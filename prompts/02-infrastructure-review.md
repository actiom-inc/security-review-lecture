# デモ2: インフラ構成をレビューする

```text
`infra/` とシステム前提資料を読み、インフラ構成のセキュリティレビューをしてください。

対象:
- `infra/`
- `docs/system-context.md`
- `docs/architecture.md`

まだコードやTerraformの変更は行わず、分析だけをしてください。
`src/` のアプリケーションコードは、このデモでは詳細レビューの対象に含めないでください。

次の観点を重点的に確認してください。

- インターネットからの到達性
- Cloud Runの呼び出し制御
- IAM / Service Accountの最小権限
- Cloud SQLのネットワーク公開範囲
- Secretの管理方法
- バックアップと復旧性
- `docs/system-context.md` に書かれた設計意図とTerraform実装の差分

重要度が高い順に最大5件を報告してください。

各指摘には次を含めてください。

- Severity: Critical / High / Medium / Low
- Confidence: High / Medium / Low
- 対象ファイルと該当箇所
- 何が問題なのか
- 攻撃または事故が成立する前提条件
- 想定される影響
- 推奨する修正方針

Terraformや資料だけでは判断できない点は推測せず、「追加確認が必要」としてください。
```
