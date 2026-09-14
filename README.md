# AIセキュリティレビュー研修用デモ

AI Coding Agentを使って、アプリケーションコードとインフラ構成を横断したセキュリティレビューを実演するための小規模な教材です。

> [!CAUTION]
> このリポジトリには、研修のために意図的な脆弱性と安全でない設定が含まれます。インターネットへ公開したり、本番環境へ転用したりしないでください。

## 必要な環境

- Node.js 22.13以降
- npm

アプリケーションの動作確認に外部パッケージは使用していません。`infra/` はレビュー専用のTerraform fixtureで、実際にapplyする必要はありません。

## 動作確認

```bash
npm test
npm start
```

起動後、別のターミナルからヘルスチェックを実行できます。

```bash
curl http://localhost:3000/health
```

## デモの進め方

1. `prompts/01-quick-review.md` で、まずアプリケーションコードをレビューする
2. `prompts/02-structured-review.md` で、レビュー観点と出力形式を指定して結果を比較する
3. `prompts/05-infrastructure-review.md` で、`infra/` と `docs/system-context.md` をレビューする
4. `prompts/06-cross-layer-review.md` で、コードとインフラを横断した攻撃経路を考えさせる
5. `prompts/03-fix-one-finding.md` で、重要度の高い問題を1件だけ修正する
6. `prompts/04-re-review.md` で、テストと再レビューを行う

実演をやり直すときは、`main` から新しい作業ブランチを作成してください。

```bash
git switch main
git switch -c demo-$(date +%Y%m%d-%H%M)
```

## 構成

```text
src/
  app.js
  db.js
  middleware/
  routes/
  utils/
infra/
  main.tf
  iam.tf
  database.tf
  variables.tf
  versions.tf
docs/
  system-context.md
prompts/
test/
training-fixtures/
Dockerfile
.github/workflows/ci.yml
```

`src/` だけを見たレビューと、`src/` + `infra/` + `docs/system-context.md` をまとめて見たレビューで、指摘の内容や優先順位がどう変わるかを比較することがこの教材の中心です。
