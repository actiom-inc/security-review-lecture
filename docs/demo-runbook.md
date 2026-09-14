# AIセキュリティレビュー実演 Runbook

この文書は、`security-review-lecture` リポジトリを使って、AI Coding Agentによるアプリケーションコード + インフラ構成のセキュリティレビューを実演するための講師用手順です。

## 目的

レビュー対象を次の順序で広げます。

1. アプリケーションコードをレビューする
2. Terraformとシステム前提をレビューする
3. コードとインフラを横断してAttack Pathを考えさせる
4. 重要な問題を1件だけ修正し、テストと再レビューまで行う

研修で使用するプロンプトは `prompts/` 配下の4ファイルだけです。

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

想定するAttack Path:

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

SSRFについては、コード上の問題として十分に指摘できます。ただし現在のfixtureだけから「GCP Metadata ServerからCredentialを取得できる」と断定するのは根拠不足です。成立条件が不足している場合は「追加確認が必要」と扱います。

## デモ1: アプリケーションコードレビュー

使用ファイル: `prompts/01-code-review.md`

レビュー対象を `src/`、`Dockerfile`、`.github/workflows/`、`package.json` に限定します。ここでは `infra/` を見せず、コードや設定ファイルだけからどこまで問題を見つけられるかを確認します。

結果を見るときは、指摘件数ではなく次を確認します。

- 対象ファイルと該当箇所が示されているか
- コード上の根拠があるか
- 攻撃成立条件が整理されているか
- コードだけで分からない内容を断定していないか

## デモ2: インフラレビュー

使用ファイル: `prompts/02-infrastructure-review.md`

対象は `infra/`、`docs/system-context.md`、`docs/architecture.md` です。

主な確認ポイント:

- Cloud Runの公開範囲
- Runtime Service Accountの権限
- Cloud SQLのPublic exposure
- Secretの扱い
- Backup設定
- 設計意図とTerraform実装の差分

コードレビューとは違い、到達性、IAM、ネットワーク、データ保護などが中心になります。

## デモ3: コード + インフラ横断レビュー

使用ファイル: `prompts/03-cross-layer-review.md`

このデモでは単独の脆弱性一覧ではなく、複数の弱点をつないだAttack Pathを出させます。

特に次の4ファイルを開きながら確認します。

1. `docs/system-context.md` - `x-user-id` はProxyが保証する前提
2. `infra/main.tf` - Cloud RunへInternetから直接到達できる
3. `src/middleware/auth.js` - `x-user-id` をユーザーIDとして利用する
4. `src/routes/admin.js` - 管理者roleの確認がない

ここで、コード単体の問題を「Trust Boundaryの破綻」として評価できることを示します。

## デモ4: 1件だけ修正して検証

使用ファイル: `prompts/04-fix-and-verify.md`

一度に複数件を直さず、1件・最小差分・テスト追加に限定します。時間と分かりやすさを優先するならSQL Injectionの修正が扱いやすいです。

修正後は同じプロンプトの中で、テスト実行と変更差分の再レビューまで行わせます。

確認すること:

- 元の問題が解消されたか
- 不要な変更が混ざっていないか
- 再発防止テストが追加されたか
- 既存テストが通るか
- 新しい問題を作っていないか
- 残リスクや追加確認事項が整理されているか

## 締めのポイント

AIを使ったセキュリティレビューの価値は、単に脆弱性候補を列挙することではありません。リポジトリ、IaC、システム前提をまとめて読ませることで、人間が別々に確認していた情報を横断し、Attack Pathとして整理するところにあります。
