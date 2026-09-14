# AIセキュリティレビュー研修用デモ

AI Coding Agentを使ったセキュリティレビューを実演するための、小規模なWeb APIです。

> [!CAUTION]
> このリポジトリには、研修のために意図的な脆弱性と安全でない設定が含まれます。インターネットへ公開したり、本番環境へ転用したりしないでください。

## 必要な環境

- Node.js 22.13以降
- npm

外部パッケージは使用していません。

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

1. `prompts/01-quick-review.md` の依頼で一次レビューを行う
2. `prompts/02-structured-review.md` の依頼で結果を比較する
3. `prompts/03-fix-one-finding.md` の依頼で1件だけ修正する
4. `prompts/04-re-review.md` の依頼でテストと再レビューを行う

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
test/
prompts/
docs/
training-fixtures/
Dockerfile
.github/workflows/ci.yml
```
