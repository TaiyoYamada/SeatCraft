# インフラ構成

## 概要

| ツール | 用途 | ディレクトリ |
|--------|------|-------------|
| Terraform | DynamoDB, IAM Role | `infrastructure/` |
| SAM | Lambda, API Gateway | `backend/template.yaml` |
| Docker Compose | ローカル開発環境 | `docker-compose.yml` |

---

## Terraform

### ファイル構成

```
infrastructure/
├── main.tf        # プロバイダー設定
├── variables.tf   # 変数定義
├── dynamodb.tf    # DynamoDB テーブル
└── iam.tf         # IAM ロール
```

### 変数

| 変数 | デフォルト | 説明 |
|------|-----------|------|
| `aws_region` | `ap-northeast-1` | AWS リージョン |
| `environment` | `dev` | 環境名 |
| `project_name` | `seatcraft` | プロジェクト名 |

### 実行方法

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

---

## SAM

### ローカル実行

```bash
cd backend
npm run build
sam local start-api --env-vars env.json
```

### デプロイ

```bash
sam build
sam deploy --guided
```

---

## Docker Compose

| サービス | ポート | 説明 |
|----------|--------|------|
| dynamodb-local | 8000 | DynamoDB Local |
| dynamodb-admin | 8001 | 管理 UI |

```bash
docker-compose up -d    # 起動
docker-compose down     # 停止
```

---

## ローカルテーブル作成

```bash
./scripts/create-local-table.sh
```
