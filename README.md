# 🪑 SeatCraft

飲み会や会議などの「席決め」を行う Web アプリケーション。

## 特徴

- **メンバー管理**: 名前、ニックネーム、性別を設定してメンバーを登録
- **テンプレート選択**: 直線型、円卓型、島型などのレイアウトテンプレート
- **自由レイアウト**: キャンバス上で席や人を自由に配置
  - デスクトップ: ドラッグ＆ドロップ
  - モバイル: タップ選択方式
- **制約設定**: 男女バランス、固定席などの制約条件
- **自動配置**: シャッフル機能で席配置を自動生成
- **URL共有**: 結果レイアウトを保存し、URLで共有
- **AI相談**: Gemini AIによる座席配置のアドバイス

## アーキテクチャ

```
SeatCraft/
├── frontend/          # Next.js 15 (App Router)
├── backend/           # AWS Lambda + SAM
├── infrastructure/    # Terraform (DynamoDB)
├── shared-types/      # 共有型定義
├── .github/workflows/ # CI/CD
└── docker-compose.yml # DynamoDB Local
```

## セットアップ

### 前提条件

- Node.js 22.x
- Docker & Docker Compose
- AWS SAM CLI (ローカル開発用)

### ローカル開発

```bash
# フロントエンド
cd frontend && npm install
npm run dev

# バックエンド
cd backend && npm install
npm run build
sam local start-api --env-vars env.json

# DynamoDB Local
docker-compose up -d
```

### 環境変数

#### フロントエンド (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-lite  # 省略可
```

## 開発コマンド

```bash
# フロントエンド
cd frontend
npm run dev          # 開発サーバー
npm run build        # ビルド
npm run lint         # Lint

# バックエンド
cd backend
npm run build        # ビルド
npm run lint         # Lint
npm run type-check   # 型チェック
npm test             # テスト
```

## デプロイ

### CI/CD (GitHub Actions)

- **CI**: `pull_request` / `push` で自動実行
  - フロントエンド: lint → build
  - バックエンド: type-check → lint → test → build

- **Backend Deploy**: `main` push で SAM 自動デプロイ

### 必要な GitHub Secrets

| Secret名 | 説明 |
|---------|-----|
| `AWS_ACCESS_KEY_ID` | AWSアクセスキー |
| `AWS_SECRET_ACCESS_KEY` | AWSシークレットキー |
| `SAM_S3_BUCKET` | SAMデプロイ用S3バケット |

## 🛠️ 技術スタック

### フロントエンド
- Next.js 15 (App Router)
- TypeScript 5.7
- Tailwind CSS 4
- Zustand (状態管理)
- @use-gesture/react (ジェスチャー)
- Framer Motion (アニメーション)
- Google Generative AI (AI相談)

### バックエンド
- AWS Lambda (Node.js 22)
- AWS DynamoDB
- AWS API Gateway
- AWS SAM

### インフラ
- Terraform
- GitHub Actions

## 対応デバイス

- デスクトップ: Chrome, Safari, Firefox
- モバイル: iOS Safari, Android Chrome

## ライセンス

- MIT License
