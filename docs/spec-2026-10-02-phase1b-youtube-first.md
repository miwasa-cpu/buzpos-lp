# LP 修正仕様: 3画面目を YouTube 横型に、ショートは控えめに（phase 1b）

作業ディレクトリ: `/Users/massy/Desktop/ai_tools/lp`（git ブランチ `feat/sns-lp-v2`。commit/push はしない。ファイル編集のみ）
対象ファイル: `index.html`、`sns_assets/css/v2.css`、`sns_assets/js/motion.js`
プレビュー（現状）: https://pr-1.buzpos-lp.pages.dev/
第1段の仕様（デザイン言語・部品・制約の正）: `/private/tmp/claude-501/-Users-massy-Desktop-src-shimiken-app/99a02420-aa9e-4ab6-992e-5672d425cd15/scratchpad/lp_design/SPEC_phase1.md`（§2 視覚システム、§6 共通部品、§7 60fps ルール、§9 自己検証は全部そのまま適用）

## 依頼主の言葉

「LPですがトップにショート動画を推す形で出てますが、控えめにしてください。YouTube制作を推してください。」
主力は YouTube 横型（決定済み）。ショートは横型の補助。

## 現状の section 順（index.html）

1. `sns-top`（v2 hero）
2. `v2-limit`（丸投げ OK ティッカー＋毎月5社限定）
3. `v2-shorts`（ショート実績。端末枠7台＋1分動画の端末＋背景の巨大「SHORTS」文字。見出し「「まず数字を作る」フェーズには、Shorts が最短距離」）
4. `sns-youtube`（旧デザインのまま。見出し画像「Youtube制作実績」、サブ「様々なジャンルに対応可能です！」、Swiper で 16:9 サムネ8枚（img_youtube_achievement_1〜8.webp）にジャンル名と役割チップ、アクトレブログ監修の紹介ブロック。コピーは section 内を全部読んで把握すること）
5. `sns-performance-result` 以降（旧デザイン・触らない）

## やること

### A. 新セクション `v2-youtube` を 3 番目に作る（v2 デザイン言語）

- 位置: `v2-limit` の直後。索引「03」＋ヘアライン＋英字 kicker「WORKS / YOUTUBE」の共通ヘッダー。
- 見出し（実テキスト・Noto Sans JP 900）: 「YouTube 横型動画の制作実績」（「YouTube」は Anton）。サブ: 「様々なジャンルに対応可能です！」（旧コピー逐語）。
- 本体: 旧 `sns-youtube` の 8 枚のサムネ（16:9）を、ネイティブ scroll-snap の横レール（Swiper は使わない）で並べる。各カードの左下に白い角丸なしチップでジャンル名（パーソナルジム／体操教室／体操教室／ハウスクリーニング／ホスト／ホスト／登録者200万人実業家／登録者100万人筋肉系Youtuber。順と対応は旧マークアップどおり）、その下に Space Mono 11px で役割（動画撮影 / 動画編集 / 企画、7・8 枚目は 動画制作）。右下に「01 / 08」のカウンター（Anton）。
- 背景に aria-hidden の「YOUTUBE」Anton 22vw アウトライン文字を、セクション全長で translateX(+6vw→-18vw) の scrub（SHORTS で使っていた部品を流用。scrub はページ全体で 2 本までなので、ショート側の背景文字は削除する）。
- 入場: viewport 70% で各カードが clip-path inset(0 100% 0 0)→inset(0) .7s expo.out、左から stagger .08s。
- アクトレブログ監修のブロックが旧 `sns-youtube` にあれば、その直後に v2 スタイルで移植する（写真 photo_actre.webp、「登録者数約73万人」「公開動画1,450本超」「総再生回数5億回超（2025年5月7日時点）」などの数字はスロット数字部品で表示、文言は逐語）。旧 section に無ければ作らない。
- SP（390）: カード幅 78vw、次の 1 枚が覗く。横スクロール禁止（section に overflow-x:clip）。

### B. ショート `v2-shorts` を 4 番目へ移し、控えめにする

- 位置: `v2-youtube` の直後。索引を「04」に変更。
- 見出しは 1 段落とす（v2-h2 ではなく v2-h3 相当のサイズ、clamp(28px, 4vw, 52px)）。コピーは逐語のまま（「「まず数字を作る」フェーズには、Shorts が最短距離」）。
- 背景の巨大「SHORTS」文字と、その scrub を削除。
- 端末枠は 7 台のまま、幅を PC 180px→140px、SP 中央 1 台 78vw→60vw に縮める。1分動画の端末も同じ比率で縮める。自動再生・タップ再生の挙動は変えない。
- 「BUZPOSがショートに強い理由」3 点は残すが、2 列（左: 本文、右: 3 点）の 1 ブロックに畳み、縦の占有を今の 6 割程度にする。

### C. 旧 `sns-youtube` を削除する

- 内容は A に移したので、旧 section は丸ごと削除し重複させない。旧 Swiper の初期化コード（`sns-swiper-youtube` 向け）が motion.js か旧 inline script に残っていればエラーにならないよう外す。
- `sns-performance-result` 以降の旧セクションは触らない（アンカー `#sns-contact` などはそのまま）。

### D. hero は文言を変えない

- 浮遊アイコンの大きさだけ、YouTube を 1.15 倍、TikTok を 0.85 倍にする（位置はそのまま。重なりが出るなら現状維持）。

## 制約（第1段と同じ）

- 数字・固有名詞は逐語。架空の数字を足さない。
- ライブラリは jsdelivr のみ。CSP は変えない。
- SP は pin 禁止、scrub は最大 2 本（hero 離脱 + YOUTUBE 背景）、filter/box-shadow のアニメ禁止、画像は width/height 必須・lazy。
- prefers-reduced-motion で全アニメ停止・全内容表示。data-reveal の 3 秒安全タイマーは維持。
- `console.log` は入れない。

## 自己検証（§9 と同じ手順）

- Playwright（channel=chrome）で 390×844 / 375×667 / 1440×900 / 1440×全長 を撮影して目視。`document.documentElement.scrollWidth === innerWidth`。console の error・CSP 違反・404 がゼロ。reduced-motion で全部見える。
- 旧 `sns-youtube` のコピー（ジャンル名・役割・サブコピー・監修の数字）が新セクションに逐語で入っていることを diff で確認。重複表示が無いこと。
- `sns-performance-result` 以降の旧セクションが現状どおり動く（Swiper・FAQ・フォーム）。
- 終わったら `pkill -f "http.server 8765"`。

報告は「できたこと／検証結果（数値）／できなかったこと・判断が要ること」の3つに分けて日本語で。
