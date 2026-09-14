# AIセキュリティレビュー実演 Runbook

この文書は、`security-review-lecture` リポジトリを使って、AI Coding Agentによるアプリケーションコード + インフラ構成のセキュリティレビューを実演するための講師用手順です。

## 目的

次の順序で、レビュー対象を徐々に広げます。

1. アプリケーションコードだけをレビューする
2. レビュー観点と出力形式を指定する
3. Terraformとシステム前提をレビューする
4. コードとインフラを横断してAttack Pathを考えさせる
5. 重要な問題を1件だけ修正する
6. テストと再レビューを行う

ポイントは「AIに脆弱性の正解を出させる」ことではなく、コード単体では見えないTrust BoundaryやBlast Radiusまでレビュー対象を広げられることを見せることです。

## 事前準備

```bash
git clone https://github.com/actiom-inc/security-review-lecture.git
cd security-review-lecture
npm test
npm start
```

動作確認:

```bash
curl http://localhost:3000/health
```

実演前に作業ブランチを作ります。

```bash
git switch main
git pull
git switch -c demo-$(date +%Y%m%d-%H%M)
```

`infra/` はレビュー専用fixtureです。Terraformをapplyする必要はありません。

## 講師だけが把握しておく主な論点

### アプリケーション

- SQL Injection: `src/routes/users.js`
- 管理APIの認可チェック漏れ: `src/routes/admin.js`
- SSRF: `src/routes/preview.js`
- Authorizationヘッダーのログ出力: `src/middleware/requestLogger.js`
- Docker root実行: `Dockerfile`
- GitHub Actionsの過大権限: `.github/workflows/ci.yml`

### インフラ

- Cloud Runが `INGRESS_TRAFFIC_ALL` で公開されている
- `allUsers` に `roles/run.invoker` が付与され、Cloud Runへ直接アクセスできる
- アプリ実行Service Accountに `roles/editor` が付与されている
- Cloud SQLがPublic IPv4を持ち、`0.0.0.0/0` からの接続を許可している
- Cloud SQLのバックアップが無効
- DBパスワードがTerraformのdefault値として平文で定義されている

### コードとインフラを組み合わせた重要論点

最も見せやすいのは、`x-user-id` のTrust Boundaryです。

`docs/system-context.md` では、信頼されたIdentity-aware proxyがクライアントの `x-user-id` を除去し、検証済みIDを注入する前提です。一方TerraformではCloud Runへ直接アクセスできます。

そのためAIには、次のようなAttack Pathを見つけてほしいです。

```text
Internet
  ↓
Cloud Runへ直接アクセス
  ↓
攻撃者が x-user-id を任意指定
  ↓
src/middleware/auth.js がその値を信頼
  ↓
任意ユーザーとして扱われる
  ↓
管理APIの認可漏れと組み合わせて監査ログへアクセス
```

この問題はコードだけ、Terraformだけを見るより、両方と `system-context.md` を読んだ方が明確になります。

SSRFについては、コード上の問題として十分に指摘できますが、現在のfixtureだけから「GCP Metadata ServerからCredentialを取得できる」と断定させないでください。成立条件が不足している場合は「追加確認が必要」と言わせるのが適切です。

## デモ1: コードだけをレビュー

`prompts/01-quick-review.md` を使います。

ここでは結果の件数を採点しません。AIがどのコードを根拠に、どのような問題候補を出すかを見ます。

確認する観点:

- 対象ファイルと該当箇所が示されているか
- Severityの根拠があるか
- 攻撃成立条件を区別できているか
- コードから証明できないことを断定していないか

## デモ2: 構造化レビュー

`prompts/02-structured-review.md` を使います。

雑な依頼と比較し、Severity、Confidence、根拠、成立条件、影響を指定すると人間が検証しやすい出力になることを見せます。

## デモ3: インフラレビュー

`prompts/05-infrastructure-review.md` を使います。

`infra/` と `docs/system-context.md` だけを見せます。

期待する主な指摘:

- Cloud Runの直接公開が設計意図と一致しない
- Runtime Service Accountの権限が広すぎる
- Cloud SQLのPublic exposureが広すぎる
- DB Secretの扱いが不適切
- Backupが無効

ここでも全件発見を期待しません。

## デモ4: コード + インフラ横断レビュー

`prompts/06-cross-layer-review.md` を使います。

このデモの中心は、単独の脆弱性一覧ではなくAttack Pathです。

特に `x-user-id` の信頼前提とCloud Runの直接公開を組み合わせて指摘できるかを見ます。

AIが指摘した場合は、以下の順でコードとTerraformを開きながら説明します。

1. `docs/system-context.md`: `x-user-id` はProxyが保証する前提
2. `infra/main.tf`: Cloud RunがInternetから直接呼べる
3. `src/middleware/auth.js`: `x-user-id` をそのままユーザーIDとして利用
4. `src/routes/admin.js`: `admin` roleの確認がない

これで「コード上の1行」ではなく「Trust Boundaryの破綻」として説明できます。

AIがここを見落とした場合も問題ありません。「コード単体のScannerと同様、AIにもFalse Negativeがある」という説明に切り替えます。資料への追記は不要です。

## デモ5: 1件だけ修正

`prompts/03-fix-one-finding.md` を使います。

時間と分かりやすさを優先するならSQL Injectionの修正を推奨します。

一気に複数件を直させず、1件・最小差分・テスト追加に限定します。

## デモ6: テストと再レビュー

`prompts/04-re-review.md` を使います。

確認すること:

- テストが追加されているか
- 既存テストが通るか
- 修正によって新しい問題が増えていないか
- 残リスクと追加確認事項が整理されているか

## デモ結果に依存しない説明の軸

AIの結果は毎回変わるため、「何件見つけたか」の答え合わせはしません。

結果が何であっても、次の5点で読みます。

1. コード / Terraform上の根拠はあるか
2. 攻撃経路は本当に成立するか
3. どのTrust Boundaryを越えるのか
4. 到達する資産とBlast Radiusは何か
5. 推測と確認済み事実を分けているか

## 締めのメッセージ

AIを使ったセキュリティレビューの価値は、単に脆弱性候補を列挙することではありません。リポジトリ、IaC、システム前提をまとめて読ませることで、人間が別々に確認していた情報を横断し、攻撃経路として整理するところにあります。
