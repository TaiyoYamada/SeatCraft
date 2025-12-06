# SeatCraft ドキュメント

開発に必要な情報をまとめたドキュメント集です。

## 目次

| ドキュメント | 説明 |
|-------------|------|
| [開発環境セットアップ](./setup.md) | ローカル開発環境の構築手順 |
| [アーキテクチャ](./architecture.md) | システム構成と設計方針 |
| [API 仕様](./api.md) | バックエンド API のエンドポイント仕様 |
| [フロントエンド構成](./frontend.md) | Next.js アプリの構造と主要コンポーネント |
| [バックエンド構成](./backend.md) | Lambda 関数の構造とドメインモデル |
| [インフラ構成](./infrastructure.md) | Terraform と SAM によるインフラ定義 |
| [デプロイ手順](./deployment.md) | 本番環境へのデプロイ方法 |

## クイックスタート

```bash
# 1. 依存関係のインストール
cd frontend && npm install
cd ../backend && npm install

# 2. DynamoDB Local の起動
docker-compose up -d

# 3. ローカルテーブルの作成
./scripts/create-local-table.sh

# 4. フロントエンドの起動
cd frontend && npm run dev
```

http://localhost:3000 でアプリにアクセスできます。
