# デプロイ手順

SeatCraft を本番環境にデプロイする詳細な手順です。

---

## 目次

1. [前提条件](#1-前提条件)
2. [AWS 認証情報の設定](#2-aws-認証情報の設定)
3. [DynamoDB のデプロイ (Terraform)](#3-dynamodb-のデプロイ-terraform)
4. [バックエンド API のデプロイ (SAM)](#4-バックエンド-api-のデプロイ-sam)
5. [フロントエンドのデプロイ](#5-フロントエンドのデプロイ)
6. [動作確認](#6-動作確認)
7. [トラブルシューティング](#7-トラブルシューティング)

---

## 1. 前提条件

以下のツールがインストールされている必要があります。

### 必須ツール

| ツール | バージョン | インストール確認 |
|--------|-----------|------------------|
| AWS CLI | 2.x | `aws --version` |
| Terraform | 1.0+ | `terraform --version` |
| SAM CLI | 1.x | `sam --version` |
| Node.js | 22.x | `node --version` |

### インストール方法 (macOS)

```bash
# Homebrew でインストール
brew install awscli
brew install terraform
brew install aws-sam-cli
brew install node@22
```

---

## 2. AWS 認証情報の設定

### 2.1 IAM ユーザーの作成

1. AWS コンソール → IAM → ユーザー → 「ユーザーを作成」
2. ユーザー名: `seatcraft-deployer`
3. 許可ポリシーをアタッチ:
   - `AmazonDynamoDBFullAccess`
   - `AWSLambda_FullAccess`
   - `AmazonAPIGatewayAdministrator`
   - `IAMFullAccess`
   - `AmazonS3FullAccess`
   - `AWSCloudFormationFullAccess`

4. アクセスキーを作成（CLI 用）

### 2.2 AWS CLI の設定

```bash
aws configure
```

入力値:
| 項目 | 値 |
|------|-----|
| AWS Access Key ID | (作成したアクセスキー) |
| AWS Secret Access Key | (作成したシークレットキー) |
| Default region name | `ap-northeast-1` |
| Default output format | `json` |

### 2.3 認証確認

```bash
aws sts get-caller-identity
```

自分のアカウント情報が表示されれば成功です。

---

## 3. DynamoDB のデプロイ (Terraform)

### 3.1 ディレクトリ移動

```bash
cd infrastructure
```

### 3.2 Terraform 初期化

```bash
terraform init
```

**出力例:**
```
Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 6.0"...
- Installing hashicorp/aws v6.x.x...

Terraform has been successfully initialized!
```

### 3.3 実行計画の確認

```bash
# 開発環境
terraform plan -var="environment=dev"

# 本番環境
terraform plan -var="environment=prod"
```

**作成されるリソース:**
- `aws_dynamodb_table.layouts` - DynamoDB テーブル
- `aws_iam_role.lambda_execution` - Lambda 実行ロール

### 3.4 適用

```bash
# 開発環境
terraform apply -var="environment=dev"

# 本番環境
terraform apply -var="environment=prod"
```

`Do you want to perform these actions?` と聞かれたら `yes` を入力。

### 3.5 出力値の確認

```bash
terraform output
```

**出力例:**
```
dynamodb_table_arn = "arn:aws:dynamodb:ap-northeast-1:123456789012:table/seatcraft_layouts_dev"
dynamodb_table_name = "seatcraft_layouts_dev"
lambda_execution_role_arn = "arn:aws:iam::123456789012:role/seatcraft-lambda-execution-dev"
```

> **重要**: `dynamodb_table_name` を控えておいてください。

---

## 4. バックエンド API のデプロイ (SAM)

### 4.1 ディレクトリ移動

```bash
cd backend
```

### 4.2 依存関係のインストール

```bash
npm install
```

### 4.3 コードのビルド

```bash
npm run build
```

**出力例:**
```
✓ Built shuffle-handler.js
✓ Built result-handler.js
✓ Built save-handler.js

✅ Build completed successfully!
```

### 4.4 SAM ビルド

```bash
sam build
```

### 4.5 SAM デプロイ（初回）

```bash
sam deploy --guided
```

**対話式の入力:**

| 質問 | 回答 |
|------|------|
| Stack Name | `seatcraft-backend-dev` (または `seatcraft-backend-prod`) |
| AWS Region | `ap-northeast-1` |
| Parameter Stage | `dev` (または `prod`) |
| Confirm changes before deploy | `Y` |
| Allow SAM CLI IAM role creation | `Y` |
| Disable rollback | `N` |
| Save arguments to configuration file | `Y` |
| SAM configuration file | (Enter でデフォルト) |
| SAM configuration environment | (Enter でデフォルト) |

### 4.6 デプロイ完了確認

**出力例:**
```
CloudFormation outputs from deployed stack
-------------------------------------------------------------------------------------------------
Key                 ApiEndpoint
Description         API Gateway endpoint URL
Value               https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev
-------------------------------------------------------------------------------------------------
```

> **重要**: `ApiEndpoint` の URL を控えておいてください。

### 4.7 2回目以降のデプロイ

```bash
npm run build
sam build
sam deploy
```

---

## 5. フロントエンドのデプロイ

### 5.1 環境変数の設定

```bash
cd frontend

# API URL を設定（先ほど控えた値）
echo "NEXT_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev" > .env.production
```

### 5.2 ビルド

```bash
npm install
npm run build
```

### 5.3 デプロイ方法

#### 方法 A: Vercel（推奨）

```bash
npx vercel --prod
```

#### 方法 B: AWS Amplify

1. AWS コンソール → Amplify → 「新しいアプリをホスト」
2. GitHub リポジトリを接続
3. ビルド設定:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend && npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/.next
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

4. 環境変数を設定:
   - `NEXT_PUBLIC_API_URL` = API Gateway の URL

---

## 6. 動作確認

### 6.1 API のテスト

```bash
# シャッフル API
curl -X POST https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/shuffle \
  -H "Content-Type: application/json" \
  -d '{"members":[{"id":"m1","name":"テスト","gender":"male","tags":[]}],"settings":{"templateType":"line","seats":[{"id":"s1","position":{"x":0,"y":0},"size":{"width":80,"height":80},"label":"1"}],"canvasWidth":800,"canvasHeight":600,"gridSize":20},"constraints":[]}'
```

### 6.2 フロントエンドの確認

1. デプロイした URL にアクセス
2. メンバーを登録
3. テンプレートを選択
4. シャッフルまたは「この配置で決定」
5. 結果 URL を別ブラウザで開いて確認

---

## 7. トラブルシューティング

### Terraform エラー: 権限不足

```
Error: creating DynamoDB Table: AccessDeniedException
```

**対処**: IAM ユーザーに `AmazonDynamoDBFullAccess` を付与

### SAM エラー: S3 バケットがない

```
Error: Failed to create/update the stack
```

**対処**: SAM が作成する S3 バケットを確認するか、既存バケットを指定:
```bash
sam deploy --s3-bucket your-existing-bucket
```

### API エラー: テーブルが見つからない

```
ResourceNotFoundException: Requested resource not found
```

**対処**: 
1. Terraform でテーブルがデプロイされているか確認
2. SAM の Stage パラメータと Terraform の environment が一致しているか確認
   - 例: 両方とも `dev` または両方とも `prod`

### CORS エラー

**対処**: ブラウザのデベロッパーツールでエラーを確認し、API Gateway の CORS 設定を確認

---

## 環境変数一覧

### フロントエンド (.env.production)

| 変数 | 説明 | 例 |
|------|------|-----|
| `NEXT_PUBLIC_API_URL` | バックエンド API URL | `https://xxx.execute-api.ap-northeast-1.amazonaws.com/dev` |

### バックエンド (SAM で自動設定)

| 変数 | 説明 | 例 |
|------|------|-----|
| `TABLE_NAME` | DynamoDB テーブル名 | `seatcraft_layouts_dev` |
| `IS_LOCAL` | ローカルフラグ | `false` |

---

## リソースの削除

開発環境を削除する場合:

```bash
# SAM スタック削除
cd backend
sam delete --stack-name seatcraft-backend-dev

# Terraform リソース削除
cd infrastructure
terraform destroy -var="environment=dev"
```
