# BUZPOS SNS運用代行 LP — 公開までの記録と運用メモ（2026-10-04 時点）

このファイルは公開されません（`.vercelignore` で `docs/` と `*.md` を除外）。

## 1. いまの状態

| 項目 | 状態 |
|---|---|
| 公開URL | https://buzpos.co.jp/ （www は 308 で apex へ。HTTPS は Vercel が自動発行） |
| ホスティング | Vercel / チーム **BUZPOS**（Pro）/ プロジェクト `buzpos-lp` |
| 本番の中身 | ブランチ `feat/sns-lp-v2` の `a9d2bd0`（CLI デプロイ。Git 連携は未設定） |
| アクセス保護 | Standard Protection（本番の独自ドメインだけ公開。プレビューと `*.vercel.app` は Vercel ログイン必須） |
| フォーム | `/api/contact`（Vercel Functions）→ Resend → `m.iwasa@buzpos.co.jp`。送信元 `noreply@buzpos.co.jp`（ドメイン認証済み） |
| DNS | お名前.com（dnsv.jp）。A `@`=216.150.1.1、CNAME `www`=cname.vercel-dns.com、MX は Google Workspace のまま |
| 旧LP | Cloudflare Pages `buzpos-lp` は「準備中」ページのみ（旧デプロイは削除済み）。ConoHa WING の旧会社ページはドメインから外れた |
| 検索 | Search Console にドメインプロパティ登録済み（10/4）。インデックス登録リクエストとサイトマップ送信済み |

## 2. 2026-09-30 〜 10-04 にやったこと

1. **設計**（9/30）: 旧「完全成果報酬型」から、**制作費は固定単価＋成果報酬は契約で決めた成果にだけ＋月契約・違約金なし**へ。資料（スライド）を先に作り、LP はその資料に合わせた。
2. **LP v2**: hero → お任せいただける範囲 → YouTube 横型実績（11本）→ ショート実績（7本・TikTok 2本は新しいタブ）→ 実績の数字 → 支援事例 → アクトレブログ監修 → 料金 → 成果報酬と契約のルール（数式つき）→ 流れ → 無料相談＋フォーム。文言は資料の逐語。
3. **公開停止**（10/4）: Cloudflare 本番を準備中ページに差し替え、旧デプロイを API で削除（手動ワークフロー `cleanup-deployments.yml`）。
4. **Vercel 移行**（10/4）: プロジェクト作成 → フォーム関数 → ドメイン追加 → お名前.com の A/CNAME 変更 → Promote → 保護を Standard に → 公開。
5. **メール**: Resend に `buzpos.co.jp` を登録（TXT `resend._domainkey`、CNAME `rsend`/`send`、TXT `_dmarc`）。

## 3. 更新のしかた（Git 連携ができるまで）

```bash
cd ~/Desktop/ai_tools/lp            # ブランチ feat/sns-lp-v2
# 編集してコミット・push したら、クリーンな作業ツリーからデプロイ
git worktree add /tmp/lp_deploy HEAD --detach && cd /tmp/lp_deploy
vercel link --yes --project buzpos-lp --scope miwasa-9125s-projects
vercel deploy --yes --scope miwasa-9125s-projects          # プレビュー（ログイン必須）
vercel deploy --prod --yes --scope miwasa-9125s-projects   # 本番
```

- 未追跡の作業ファイル（`hero_*.png`、`laurel*.png`、`buzpos-lp-project/` など）を上げないため、必ずクリーンな worktree から。`.vercelignore` でも二重に除外。
- 環境変数（Vercel → Settings → Environment Variables）: `RESEND_API_KEY`（送信専用）、`CONTACT_TO`、`CONTACT_FROM`。値を変えたら再デプロイで反映。
- 自動テスト用に Protection Bypass のシークレットがある（Settings → Deployment Protection）。ヘッダー `x-vercel-protection-bypass` で保護を通過できるので外部に出さない。

## 4. 公開をやめたいとき

- **一時的に**: Vercel → Settings → Deployment Protection → Vercel Authentication を「All Deployments」にして Save（本番もログイン必須になる）。
- **完全に**: お名前.com の A レコードを別の向き先に変えるか、Vercel のプロジェクトからドメインを外す。

## 5. 残作業

- [ ] `feat/sns-lp-v2` を `main` にマージ（PR #1。`index.html` / `robots.txt` は PR 側を採用）→ Vercel の Git 連携（GitHub `miwasa-cpu/buzpos-lp`）
- [ ] `<title>` に「BUZPOS株式会社」を足す、`<link rel="canonical">` を入れる
- [ ] Cloudflare Pages プロジェクト `buzpos-lp` の削除（ダッシュボード）
- [ ] ショート節の旧コピー（「Shorts が最短距離」「おススメ！」「短期間で収益化」）を残すか書き直すか
- [ ] 支援企業ロゴの白抜き2社（youth 本店・バクトレ）の素材差し替え
- [ ] ConoHa WING の契約の扱い（他で使っていなければ解約候補）
- [ ] `/api/contact` のレート制限（Vercel Firewall。いまはハニーポットのみ）

## 6. 関連ファイル

- 仕様書: `docs/spec-2026-10-02-phase1b-youtube-first.md`、`docs/spec-2026-10-02-phase2-deck-align.md`（第1段の仕様書は散逸）
- 資料（スライド）: Claude の Artifact「BUZPOS SNS運用代行 サービス資料」（9枚）。LP の文言の正
- 外部サービスの操作ログ: `~/Desktop/src/shimiken-app/setting_logs/20261004_*`（Cloudflare 停止・Vercel 作成・公開）
