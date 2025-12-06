# アーキテクチャ

## システム全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                       クライアント                           │
│                    (ブラウザ / モバイル)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    フロントエンド                            │
│              Next.js 15 (App Router)                        │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  pages  │  │features │  │ shared  │  │   lib   │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     バックエンド                             │
│                    AWS Lambda + API Gateway                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              infrastructure (handlers)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              application (use cases)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 domain (entities)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      データベース                            │
│                       DynamoDB                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 設計原則

### SOLID 原則

| 原則 | 適用例 |
|------|--------|
| **S**ingle Responsibility | 各 UseCase は単一のビジネスロジックのみ担当 |
| **O**pen/Closed | Constraint 型は拡張可能（新しい制約タイプの追加が容易） |
| **L**iskov Substitution | Repository インターフェースによる実装の差し替え |
| **I**nterface Segregation | 必要最小限のインターフェース定義 |
| **D**ependency Inversion | UseCase は Repository インターフェースに依存 |

### クリーンアーキテクチャ

```
┌───────────────────────────────────────┐
│           Frameworks & Drivers         │  ← API Gateway, DynamoDB
├───────────────────────────────────────┤
│        Interface Adapters              │  ← Handlers, Repository 実装
├───────────────────────────────────────┤
│         Application Layer              │  ← UseCases
├───────────────────────────────────────┤
│           Domain Layer                 │  ← Entities, Services
└───────────────────────────────────────┘
```

**依存の方向**: 外側 → 内側（Domain は何にも依存しない）

---

## フロントエンド構成

### ディレクトリ構造

```
frontend/src/
├── app/                      # App Router ページ
│   ├── page.tsx              # / (トップ)
│   ├── members/              # /members
│   ├── layouts/templates/    # /layouts/templates
│   ├── craft/                # /craft
│   └── result/[id]/          # /result/[id]
│
├── features/                 # ドメイン別機能（Feature-based）
│   ├── members/
│   │   ├── components/       # UI コンポーネント
│   │   ├── hooks/            # 状態管理・カスタムフック
│   │   └── types.ts          # 型定義
│   ├── canvas/
│   └── layouts/
│
├── shared/                   # 共通コンポーネント
│   └── components/
│
└── lib/                      # ユーティリティ
```

### 状態管理

**Zustand** を使用し、以下の Store を定義：

| Store | 永続化 | 用途 |
|-------|--------|------|
| `useMembersStore` | localStorage | メンバーリスト |
| `useCanvasStore` | localStorage | 座席配置、制約 |

---

## バックエンド構成

### ディレクトリ構造

```
backend/src/
├── domain/                   # ドメイン層
│   ├── entities.ts           # Entity, ValueObject
│   ├── value-objects.ts      # ID 生成、隣接判定
│   └── services/
│       └── SeatArrangementService.ts  # 席配置アルゴリズム
│
├── application/              # アプリケーション層
│   ├── GenerateLayoutUseCase.ts
│   └── GetLayoutUseCase.ts
│
├── infrastructure/           # インフラ層
│   ├── handlers/             # Lambda エントリポイント
│   │   ├── shuffle-handler.ts
│   │   └── result-handler.ts
│   └── repositories/
│       └── DynamoDBLayoutRepository.ts
│
└── shared/                   # 共通
    └── repository.ts         # Repository インターフェース
```

### データフロー

```
リクエスト
    │
    ▼
┌──────────────────┐
│     Handler      │  ← JSON パース、バリデーション
└──────────────────┘
    │
    ▼
┌──────────────────┐
│     UseCase      │  ← ビジネスロジック調整
└──────────────────┘
    │
    ▼
┌──────────────────┐
│  Domain Service  │  ← 純粋なドメインロジック
└──────────────────┘
    │
    ▼
┌──────────────────┐
│   Repository     │  ← データ永続化
└──────────────────┘
    │
    ▼
レスポンス
```

---

## インフラ構成

### AWS リソース

| サービス | 用途 |
|----------|------|
| API Gateway | REST API エンドポイント |
| Lambda | サーバーレス関数 |
| DynamoDB | NoSQL データベース |
| IAM | 権限管理 |

### 定義ファイル

| ツール | ファイル | 管理対象 |
|--------|----------|----------|
| Terraform | `infrastructure/*.tf` | DynamoDB, IAM Role |
| SAM | `backend/template.yaml` | Lambda, API Gateway |

---

## データモデル

### DynamoDB テーブル: `seatcraft_layouts`

| 属性 | 型 | 説明 |
|------|-----|------|
| `id` (PK) | String | レイアウト ID (UUID) |
| `result` | String (JSON) | メンバー・割り当て情報 |
| `settings` | String (JSON) | 座席設定 |
| `constraints` | String (JSON) | 制約条件 |
| `createdAt` | String | 作成日時 (ISO 8601) |

---

## 拡張ポイント

### 新しい制約タイプの追加

1. `entities.ts` に新しい Constraint 型を追加
2. `validation.ts` に Zod スキーマを追加
3. `SeatArrangementService.ts` にロジックを追加

### 新しいテンプレートの追加

1. `layouts/types.ts` に `SEAT_TEMPLATES` を追加
2. `template-generators.ts` に生成関数を追加
3. `TemplateSelector.tsx` にプレビューを追加

### AI 配置機能の追加

1. `SeatArrangementService` を拡張、または新しい Service を作成
2. 外部 AI API との連携レイヤーを追加
3. UseCase で切り替えロジックを実装
