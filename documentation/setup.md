# 開発環境セットアップ

## 1. 前提条件

以下のツールがインストールされている必要があります。

| ツール | バージョン | 用途 |
|--------|-----------|------|
| Node.js | 22.x 以上 | JavaScript ランタイム |
| npm | 10.x 以上 | パッケージ管理 |
| Docker | 最新版 | DynamoDB Local 実行 |
| Docker Compose | 最新版 | コンテナオーケストレーション |
| AWS CLI | 2.x | DynamoDB Local 操作 |
| AWS SAM CLI | 最新版 | ローカル Lambda 実行（オプション） |

### インストール確認

```bash
node --version    # v22.x.x
npm --version     # 10.x.x
docker --version  # Docker version 2x.x.x
aws --version     # aws-cli/2.x.x
sam --version     # SAM CLI, version 1.x.x (オプション)
```

---

## 2. プロジェクトのクローン

```bash
git clone <repository-url>
cd SeatCraft
```

---

## 3. 依存関係のインストール

### フロントエンド

```bash
cd frontend
npm install
```

### バックエンド

```bash
cd backend
npm install
```

### 共有型定義（オプション）

```bash
cd shared-types
npm install
```

---

## 4. DynamoDB Local の起動

Docker Compose を使用して DynamoDB Local を起動します。

```bash
# プロジェクトルートで実行
docker-compose up -d
```

### 起動確認

```bash
docker-compose ps
```

以下のサービスが起動していることを確認：

| サービス | ポート | 説明 |
|----------|--------|------|
| dynamodb-local | 8000 | DynamoDB Local |
| dynamodb-admin | 8001 | 管理 UI |

### 管理 UI

http://localhost:8001 で DynamoDB Admin UI にアクセスできます。

---

## 5. ローカルテーブルの作成

```bash
./scripts/create-local-table.sh
```

または手動で実行：

```bash
aws dynamodb create-table \
  --endpoint-url http://localhost:8000 \
  --table-name seatcraft_layouts \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-northeast-1
```

### テーブル確認

```bash
aws dynamodb list-tables --endpoint-url http://localhost:8000 --region ap-northeast-1
```

---

## 6. フロントエンドの起動

```bash
cd frontend
npm run dev
```

http://localhost:3000 でアプリにアクセスできます。

### 利用可能なコマンド

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint 実行 |

---

## 7. バックエンドの起動（オプション）

ローカルで Lambda API をテストする場合：

```bash
cd backend

# ビルド
npm run build

# SAM でローカル API 起動
sam local start-api --env-vars env.json
```

API は http://localhost:3001 で利用可能になります。

### 環境変数ファイル (env.json)

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

---

## 8. テストの実行

### バックエンドテスト

```bash
cd backend
npm test
```

### 型チェック

```bash
# フロントエンド
cd frontend && npx tsc --noEmit

# バックエンド
cd backend && npm run type-check
```

---

## トラブルシューティング

### DynamoDB Local に接続できない

1. Docker が起動しているか確認
2. ポート 8000 が使用されていないか確認
3. `docker-compose down && docker-compose up -d` で再起動

### npm install が失敗する

1. Node.js のバージョンを確認（22.x 以上）
2. `node_modules` を削除して再実行：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### SAM ローカル API が起動しない

1. Docker が起動しているか確認
2. SAM CLI がインストールされているか確認
3. ビルドが成功しているか確認：
   ```bash
   npm run build
   ```
