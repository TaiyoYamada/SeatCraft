# デプロイ手順

## 概要

SeatCraft を本番環境にデプロイする手順です。

---

## 1. 前提条件

- AWS CLI が設定済み（`aws configure`）
- Terraform がインストール済み
- SAM CLI がインストール済み

---

## 2. インフラ構築（Terraform）

```bash
cd infrastructure

# 初期化
terraform init

# 本番用変数で実行
terraform apply -var="environment=prod"
```

**出力値を控えておく**:
- `dynamodb_table_name`
- `lambda_execution_role_arn`

---

## 3. バックエンドデプロイ（SAM）

```bash
cd backend

# ビルド
npm run build
sam build

# 初回デプロイ
sam deploy --guided
```

**設定値**:
| 項目 | 値 |
|------|-----|
| Stack Name | `seatcraft-prod` |
| Region | `ap-northeast-1` |
| Stage | `prod` |

**出力値を控えておく**:
- API Gateway エンドポイント URL

---

## 4. フロントエンドビルド

```bash
cd frontend

# 環境変数設定
echo "NEXT_PUBLIC_API_URL=https://xxx.execute-api.ap-northeast-1.amazonaws.com/prod" > .env.production

# ビルド
npm run build
```

---

## 5. フロントエンドデプロイ

### Vercel（推奨）

```bash
npx vercel --prod
```

### AWS Amplify

1. Amplify コンソールでリポジトリを接続
2. ビルド設定:
   ```yaml
   version: 1
   frontend:
     phases:
       build:
         commands:
           - cd frontend && npm install && npm run build
     artifacts:
       baseDirectory: frontend/.next
       files:
         - '**/*'
   ```

---

## 6. 動作確認

1. フロントエンド URL にアクセス
2. メンバー登録 → テンプレート選択 → シャッフル
3. 結果 URL の共有確認

---

## 環境変数一覧

### フロントエンド

| 変数 | 説明 |
|------|------|
| `NEXT_PUBLIC_API_URL` | バックエンド API URL |

### バックエンド

| 変数 | 説明 |
|------|------|
| `TABLE_NAME` | DynamoDB テーブル名 |
| `IS_LOCAL` | `false` |
