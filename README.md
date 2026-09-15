# AIセキュリティレビュー研修用デモ

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

研修では `prompts/` 配下の3ファイルを番号順に使用します。

1. `prompts/01-code-review.md` - アプリケーションコードをレビューする
2. `prompts/02-infrastructure-review.md` - Terraformとシステム前提をレビューする
3. `prompts/03-cross-layer-review.md` - コードとインフラを横断してAttack Pathをレビューする

各プロンプトの役割は `prompts/README.md` にまとめています。

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
  architecture.md
prompts/
  README.md
  01-code-review.md
  02-infrastructure-review.md
  03-cross-layer-review.md
test/
training-fixtures/
Dockerfile
.github/workflows/ci.yml
```

この教材では、レビュー対象を「コード」から「インフラ」、さらに「コード + インフラ + システム前提」へ広げることで、単独の脆弱性だけでなくTrust BoundaryやAttack PathまでAIにレビューさせます。
