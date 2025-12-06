# インフラ構成

## 概要

SeatCraft のインフラは以下のツールで管理されています。

| ツール | 管理対象 | ディレクトリ |
|--------|----------|-------------|
| **Terraform** | DynamoDB, IAM Role | `infrastructure/` |
| **SAM** | Lambda, API Gateway | `backend/template.yaml` |
| **Docker Compose** | ローカル開発環境 | `docker-compose.yml` |

---

## Terraform

### ファイル構成

```
infrastructure/
├── main.tf          # プロバイダー設定
├── variables.tf     # 変数定義
├── dynamodb.tf      # DynamoDB テーブル
└── iam.tf           # IAM ロール
```

### 変数一覧

| 変数 | デフォルト | 説明 |
|------|-----------|------|
| `aws_region` | `ap-northeast-1` | AWS リージョン |
| `environment` | `dev` | 環境名 (dev/staging/prod) |
| `project_name` | `seatcraft` | プロジェクト名 |

### 作成されるリソース

#### DynamoDB テーブル

| 項目 | 値 |
|------|-----|
| テーブル名 | `seatcraft_layouts_{environment}` |
| パーティションキー | `id` (String) |
| 課金モード | PAY_PER_REQUEST (オンデマンド) |
| TTL | 有効 (`ttl` 属性) |
| Point-in-time Recovery | prod のみ有効 |

#### IAM ロール

Lambda 実行用の IAM ロールを定義:
- CloudWatch Logs 書き込み権限
- DynamoDB CRUD 権限

### コマンド

```bash
cd infrastructure

# 初期化（初回のみ）
terraform init

# 実行計画の確認
terraform plan -var="environment=dev"

# 適用
terraform apply -var="environment=dev"

# 出力値の確認
terraform output

# 削除
terraform destroy -var="environment=dev"
```

### 出力値

```bash
terraform output
```

| 出力名 | 説明 |
|--------|------|
| `dynamodb_table_name` | テーブル名 |
| `dynamodb_table_arn` | テーブル ARN |
| `lambda_execution_role_arn` | Lambda 実行ロール ARN |

---

## SAM

### template.yaml 構成

```yaml
Resources:
  SeatCraftApi:      # API Gateway
  ShuffleFunction:   # POST /shuffle
  ResultFunction:    # GET /result/{id}
  SaveFunction:      # POST /save
```

### ローカル実行

```bash
cd backend
npm run build
sam local start-api --env-vars env.json
```

`env.json`:
```json
{
  "ShuffleFunction": {
    "IS_LOCAL": "true",
    "TABLE_NAME": "seatcraft_layouts"
  },
  "ResultFunction": {
    "IS_LOCAL": "true",
    "TABLE_NAME": "seatcraft_layouts"
  },
  "SaveFunction": {
    "IS_LOCAL": "true",
    "TABLE_NAME": "seatcraft_layouts"
  }
}
```

### デプロイ

```bash
npm run build
sam build
sam deploy --guided
```

---

## Docker Compose

### サービス一覧

| サービス | ポート | 説明 |
|----------|--------|------|
| dynamodb-local | 8000 | DynamoDB Local |
| dynamodb-admin | 8001 | 管理 UI |

### コマンド

```bash
# 起動
docker-compose up -d

# 停止
docker-compose down

# ログ確認
docker-compose logs -f

# データ含めて削除
docker-compose down -v
```

### ローカルテーブル作成

```bash
./scripts/create-local-table.sh
```

---

## 環境別設定

| 環境 | DynamoDB | API | フロントエンド |
|------|----------|-----|---------------|
| dev | ローカル or AWS | SAM Local or AWS | localhost:3000 |
| staging | AWS | AWS | Vercel Preview |
| prod | AWS | AWS | Vercel Production |

---

## コスト考慮

| リソース | 課金モデル | 備考 |
|----------|-----------|------|
| Lambda | 実行時間 + リクエスト数 | Free Tier: 100万リクエスト/月 |
| API Gateway | リクエスト数 | Free Tier: 100万リクエスト/月 |
| DynamoDB | PAY_PER_REQUEST | 使った分だけ |

**開発時のコスト削減:**
- DynamoDB Local を使用
- SAM Local で Lambda をテスト
