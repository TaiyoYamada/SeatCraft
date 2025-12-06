# SeatCraft

飲み会や会議などの「席決め」を行う Web アプリケーション。

## 特徴

- **メンバー管理**: 名前、ニックネーム、性別、タグを設定してメンバーを登録
- **テンプレート選択**: 直線型、円卓型、島型などのレイアウトテンプレート
- **自由レイアウト**: キャンバス上で席や人を自由にドラッグ＆ドロップ
- **制約設定**: 男女バランス、固定席、NGペアなどの制約条件
- **自動配置**: 制約を考慮した席配置を自動生成
- **URL共有**: 結果レイアウトを保存し、URLで共有

## アーキテクチャ

```
SeatCraft/
├── frontend/          # Next.js 15 (App Router)
├── backend/           # AWS Lambda + SAM
├── infrastructure/    # Terraform
├── shared-types/      # 共有型定義
└── docker-compose.yml # DynamoDB Local
```

## セットアップ

### 前提条件

- Node.js 22.x
- Docker & Docker Compose
- AWS SAM CLI (ローカル開発用)
- Terraform (インフラ構築用)

### ローカル開発

1. **依存関係のインストール**

```bash
# フロントエンド
cd frontend && npm install

# バックエンド
cd backend && npm install

# 共有型
cd shared-types && npm install
```

2. **DynamoDB Local の起動**

```bash
docker-compose up -d
```

3. **ローカルテーブルの作成**

```bash
./scripts/create-local-table.sh
```

4. **フロントエンドの起動**

```bash
cd frontend && npm run dev
```

5. **バックエンドの起動 (オプション)**

```bash
cd backend
npm run build
sam local start-api --env-vars env.json
```

### 環境変数

#### フロントエンド (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### バックエンド (env.json)

```json
{
  "ShuffleFunction": {
    "IS_LOCAL": "true",
    "TABLE_NAME": "seatcraft_layouts"
  },
  "ResultFunction": {
    "IS_LOCAL": "true",
    "TABLE_NAME": "seatcraft_layouts"
  }
}
```

## ビルド

### フロントエンド

```bash
cd frontend && npm run build
```

### バックエンド

```bash
cd backend && npm run build
```

## テスト

```bash
# バックエンドテスト
cd backend && npm test

# 型チェック
cd frontend && npm run type-check
cd backend && npm run type-check
```

## デプロイ

### Terraform でインフラ構築

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### SAM でバックエンドデプロイ

```bash
cd backend
sam build
sam deploy --guided
```

## 技術スタック

### フロントエンド

- Next.js 15 (App Router)
- TypeScript 5.7
- Tailwind CSS 4
- Zustand (状態管理)
- @dnd-kit (ドラッグ＆ドロップ)

### バックエンド

- AWS Lambda (Node.js 22)
- AWS DynamoDB
- AWS API Gateway
- Zod (バリデーション)
- AWS SDK v3

### インフラ

- Terraform (AWS Provider v6)
- AWS SAM

## ライセンス

MIT License
