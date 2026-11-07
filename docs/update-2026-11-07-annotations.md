# BUZPOS LP 追加注釈対応 2026-11-07

## 実装
- LINE必須に見えるサービス説明・図・ヒーロー・帯・計測準備説明を一般化。自社相談用LINEリンクは維持。
- 「契約と保証」カードを削除。成果報酬対象と課金しないものの2カードは維持。ヒーローの「月契約・違約金なし」はユーザー削除対象カード外の既存条件のため維持。
- 広告用短い動画は3〜5万円、初期費用は0円。価格例の制作動画料金・成果報酬条件は変更なし。
- 横動画レールの先頭へ3本追加、既存11本維持、通し番号14本へ更新。変動する再生数はサイトに固定掲載しない。

## 動画確認（vidIQ、2026-11-07）
- VOLIXチャンネル: https://www.youtube.com/watch?v=lPDJTSxSYHo 、2026-09-09公開、49,602回。
- 伊勢ヶ濱部屋 SUMO: https://www.youtube.com/watch?v=djAygefbIhI 、2026-10-06公開、589,096回。
- テストステロン扇谷チャンネル: https://www.youtube.com/watch?v=cff9oHyRb8Q 、2026-09-21公開、153,076回。
- サムネイルは各動画の公式 i.ytimg.com の maxresdefault.jpg を使用。

## 正式ロゴ
- VITAS: https://vitas.inc/wp-content/themes/vitas/img/logo-05.svg （出典 https://vitas.inc/ ）
- VOLIX: https://volix.jp/cdn/shop/files/logo.svg?v=1782624646 （出典 https://volix.jp/pages/about ）
- 公式SVGを無加工で自サイト配信。既存の合成ロゴ画像は無変更、追加ロゴは独立行として表示。

## 検証
- HTMLタグ構造、ID重複、ローカル参照画像・スクリプト存在、JavaScript構文、git diff --check: 合格。
- Chromeの320/390/768/1280px表示でページ横あふれなし。導線図・ロゴ・料金を実画面確認。
- 追加したYouTube3本すべて埋込み再生、閉じるボタン／Escape後のiframeクリア、横スクロールを確認。
- フォーム送信は変更対象外のため送信テストなし。
