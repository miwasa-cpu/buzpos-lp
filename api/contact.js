// LP お問い合わせフォームの受け口（Vercel Node.js Serverless Function）。
// フォーム（application/x-www-form-urlencoded）を受けて、Resend でメール通知し、/thanks.html へ 303 で戻す。
// 依存パッケージなし（Node 20 標準の fetch のみ）。IP・ユーザーエージェントは通知に入れない（個人情報を増やさない）。

const MAX_BODY_BYTES = 64 * 1024;
const MAX_TEXT = 4000; // お問い合わせ内容
const MAX_FIELD = 200; // それ以外
const RESEND_TIMEOUT_MS = 10000;

const INQUIRY_TYPES = ['お見積り・お問い合わせ', '資料請求'];
const SNS_CHOICES = ['Instagram', 'TikTok', 'X', 'YouTube', 'その他'];
const EMAIL_RE = /^[^\s@<>()",;:\\[\]]+@[^\s@<>()",;:\\[\]]+\.[^\s@<>()",;:\\[\]]+$/;

const REDIRECT_OK = '/thanks.html';
const REDIRECT_FAIL = '/thanks.html?error=1';
const REDIRECT_INVALID = '/thanks.html?error=invalid';

class PayloadTooLarge extends Error {}

function redirect(res, location) {
  res.statusCode = 303;
  res.setHeader('Location', location);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}

function sendStatus(res, status, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  res.end();
}

// 生ボディを最大 64KB まで読む。Vercel のヘルパーが req.body を用意していればそれを使う。
async function readParams(req) {
  const pre = req.body;
  if (typeof pre === 'string' || Buffer.isBuffer(pre)) {
    const raw = Buffer.isBuffer(pre) ? pre : Buffer.from(pre, 'utf8');
    if (raw.length > MAX_BODY_BYTES) throw new PayloadTooLarge();
    return new URLSearchParams(raw.toString('utf8'));
  }
  if (pre && typeof pre === 'object') {
    const params = new URLSearchParams();
    let size = 0;
    for (const [k, v] of Object.entries(pre)) {
      for (const item of Array.isArray(v) ? v : [v]) {
        const s = item == null ? '' : String(item);
        size += Buffer.byteLength(k) + Buffer.byteLength(s) + 2;
        if (size > MAX_BODY_BYTES) throw new PayloadTooLarge();
        params.append(k, s);
      }
    }
    return params;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk;
    size += buf.length;
    if (size > MAX_BODY_BYTES) throw new PayloadTooLarge();
    chunks.push(buf);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
}

// 1 行の値：制御文字（改行・タブ含む）を空白に寄せて trim、上限で切る
function oneLine(value, max = MAX_FIELD) {
  const s = String(value ?? '')
    .replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return truncate(s, max);
}

// 複数行の値：改行は \n にそろえて残し、それ以外の制御文字は消す
function multiLine(value, max = MAX_TEXT) {
  const s = String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u2028\u2029]/g, '')
    .trim();
  return truncate(s, max);
}

function truncate(s, max) {
  const chars = Array.from(s);
  if (chars.length <= max) return s;
  return chars.slice(0, max).join('') + '…（上限' + max + '字で以下省略）';
}

function jstNow() {
  const fmt = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  return fmt.format(new Date()) + '（JST）';
}

function parseForm(params) {
  const sns = params.getAll('運用検討中のSNS[]').map((v) => oneLine(v)).filter(Boolean);
  return {
    inquiryType: oneLine(params.get('ご用件')),
    company: oneLine(params.get('会社名')),
    division: oneLine(params.get('部署名')),
    name: oneLine(params.get('お名前')),
    email: oneLine(params.get('Email')),
    phone: oneLine(params.get('電話番号')),
    sns: Array.from(new Set(sns)),
    otherSns: oneLine(params.get('その他のSNS')),
    message: multiLine(params.get('お問い合わせ内容')),
    agreed: params.getAll('個人情報保護方針に同意[]').some((v) => String(v).trim() !== ''),
    honeypot: String(params.get('website') ?? '').trim(),
  };
}

function isValid(f) {
  if (!INQUIRY_TYPES.includes(f.inquiryType)) return false;
  if (!f.company || !f.name || !f.phone || !f.message) return false;
  if (!f.email || f.email.length > MAX_FIELD || !EMAIL_RE.test(f.email)) return false;
  if (f.sns.length === 0 || !f.sns.every((v) => SNS_CHOICES.includes(v))) return false;
  if (!f.agreed) return false;
  return true;
}

function buildMail(f, referer) {
  const subject = oneLine(`【LP問い合わせ】${f.inquiryType}｜${f.company} ${f.name}様`, 300);
  const lines = [
    `ご用件: ${f.inquiryType}`,
    `会社名: ${f.company}`,
    `部署名: ${f.division || '（未入力）'}`,
    `お名前: ${f.name}`,
    `Email: ${f.email}`,
    `電話番号: ${f.phone}`,
    `運用検討中のSNS: ${f.sns.join('、')}`,
    `その他のSNS: ${f.otherSns || '（未入力）'}`,
    `個人情報保護方針に同意: 同意する`,
    '',
    'お問い合わせ内容:',
    f.message,
    '',
    '――――――――――',
    `受信日時: ${jstNow()}`,
  ];
  if (referer) lines.push(`送信元ページ: ${referer}`);
  return { subject, text: lines.join('\n') };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    sendStatus(res, 405, { Allow: 'POST' });
    return;
  }

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (!contentType.startsWith('application/x-www-form-urlencoded')) {
    sendStatus(res, 415);
    return;
  }

  const declared = Number(req.headers['content-length']);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    sendStatus(res, 413);
    return;
  }

  let params;
  try {
    params = await readParams(req);
  } catch (err) {
    if (err instanceof PayloadTooLarge) {
      sendStatus(res, 413);
      return;
    }
    redirect(res, REDIRECT_INVALID);
    return;
  }

  const form = parseForm(params);

  // ハニーポット：人間には見えない欄に値がある＝ボット。送らずに成功と同じ戻り先へ
  if (form.honeypot) {
    redirect(res, REDIRECT_OK);
    return;
  }

  if (!isValid(form)) {
    redirect(res, REDIRECT_INVALID);
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    redirect(res, REDIRECT_FAIL);
    return;
  }

  // 初期値の onboarding@resend.dev は Resend のテスト用送信元。DKIM が resend.dev で署名されるため迷惑メールに入りやすく、
  // Resend アカウントの登録アドレス以外を CONTACT_TO にすると 403（=利用者には送信失敗）になる。
  // 本番は Resend で send.buzpos.co.jp を認証し、Vercel の CONTACT_FROM を 'BUZPOS LP <lp@send.buzpos.co.jp>' にする。
  const from = process.env.CONTACT_FROM || 'BUZPOS LP <onboarding@resend.dev>';
  const to = String(process.env.CONTACT_TO || 'm.iwasa@buzpos.co.jp')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const referer = oneLine(req.headers.referer || req.headers.referrer || '', 500);
  const { subject, text } = buildMail(form, referer);

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, reply_to: form.email, subject, text }),
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    });
    if (!r.ok) {
      console.error('contact: resend responded', r.status);
      redirect(res, REDIRECT_FAIL);
      return;
    }
  } catch (err) {
    console.error('contact: resend request failed', err && err.name);
    redirect(res, REDIRECT_FAIL);
    return;
  }

  redirect(res, REDIRECT_OK);
}
