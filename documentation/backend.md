# バックエンド構成

## 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Node.js | 22.x | ランタイム |
| TypeScript | 5.7.x | 型安全 |
| AWS Lambda | - | サーバーレス実行環境 |
| AWS DynamoDB | - | NoSQL データベース |
| AWS SDK v3 | 3.x | AWS サービス連携 |
| zod | 3.x | バリデーション |
| esbuild | 0.24.x | バンドル |
| vitest | 2.x | テスト |

---

## ディレクトリ構造

```
backend/src/
├── domain/                       # ドメイン層
│   ├── entities.ts               # エンティティ・型定義
│   ├── value-objects.ts          # 値オブジェクト
│   └── services/
│       ├── SeatArrangementService.ts      # 席配置アルゴリズム
│       └── SeatArrangementService.test.ts # テスト
│
├── application/                  # アプリケーション層
│   ├── GenerateLayoutUseCase.ts  # レイアウト生成
│   └── GetLayoutUseCase.ts       # レイアウト取得
│
├── infrastructure/               # インフラ層
│   ├── handlers/
│   │   ├── shuffle-handler.ts    # POST /shuffle
│   │   ├── result-handler.ts     # GET /result/{id}
│   │   └── validation.ts         # Zod スキーマ
│   └── repositories/
│       └── DynamoDBLayoutRepository.ts  # DynamoDB 実装
│
└── shared/                       # 共通
    └── repository.ts             # Repository インターフェース
```

---

## レイヤー詳細

### ドメイン層

ビジネスロジックの核心部分。外部依存なし。

#### entities.ts

主要な型定義：

```typescript
// メンバー
interface Member {
  id: string;
  name: string;
  nickname?: string;
  gender: 'male' | 'female' | 'other';
  tags: string[];
}

// 座席
interface Seat {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  label?: string;
}

// 制約（Union Type）
type Constraint =
  | GenderBalanceConstraint
  | FixedSeatConstraint
  | NGPairConstraint
  | ...;

// レイアウト（集約ルート）
interface Layout {
  id: string;
  members: Member[];
  settings: LayoutSettings;
  assignments: SeatAssignment[];
  constraints: Constraint[];
  createdAt: Date;
}
```

#### SeatArrangementService.ts

制約付き席配置アルゴリズム：

```typescript
function arrangeSeats(
  members: Member[],
  seats: Seat[],
  constraints: Constraint[],
  options?: ArrangementOptions
): ArrangementResult
```

**アルゴリズム**:
1. 固定席の配置
2. 複数回の試行（デフォルト 100 回）
3. NG ペア制約の考慮
4. 男女バランスの考慮
5. ベストスコアの結果を返却

---

### アプリケーション層

ユースケースの実装。ドメインサービスとリポジトリを調整。

#### GenerateLayoutUseCase

```typescript
class GenerateLayoutUseCase {
  constructor(private layoutRepository: LayoutRepository) {}
  
  async execute(request: ShuffleRequest): Promise<ShuffleResponse> {
    // 1. 席配置を生成
    const result = arrangeSeats(...);
    
    // 2. レイアウト作成
    const layout = createLayout(...);
    
    // 3. 保存
    await this.layoutRepository.save(layout);
    
    // 4. レスポンス返却
    return { id, assignments };
  }
}
```

#### GetLayoutUseCase

```typescript
class GetLayoutUseCase {
  constructor(private layoutRepository: LayoutRepository) {}
  
  async execute(id: string): Promise<GetResultResponse> {
    const layout = await this.layoutRepository.findById(id);
    
    if (!layout) {
      throw new NotFoundError(...);
    }
    
    return { layout };
  }
}
```

---

### インフラ層

外部サービスとの連携。

#### DynamoDBLayoutRepository

```typescript
class DynamoDBLayoutRepository implements LayoutRepository {
  async save(layout: Layout): Promise<void> {
    const record = toLayoutRecord(layout);
    await this.client.send(new PutCommand({
      TableName: this.tableName,
      Item: record,
    }));
  }
  
  async findById(id: string): Promise<Layout | null> {
    const result = await this.client.send(new GetCommand({
      TableName: this.tableName,
      Key: { id },
    }));
    return result.Item ? fromLayoutRecord(result.Item) : null;
  }
}
```

**環境切り替え**:

| 環境変数 | 値 | 動作 |
|----------|-----|------|
| `IS_LOCAL` | `true` | localhost:8000 に接続 |
| `IS_LOCAL` | `false` または未設定 | 本番 DynamoDB に接続 |
| `TABLE_NAME` | テーブル名 | 使用するテーブル |

#### Lambda Handler

ハンドラーの責務：
1. リクエストボディのパース
2. Zod によるバリデーション
3. UseCase の実行
4. レスポンスの構築

```typescript
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // 1. パース
  const body = JSON.parse(event.body);
  
  // 2. バリデーション
  const result = ShuffleRequestSchema.safeParse(body);
  if (!result.success) {
    return errorResponse(400, 'VALIDATION_ERROR', ...);
  }
  
  // 3. UseCase 実行
  const response = await useCase.execute(result.data);
  
  // 4. レスポンス
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(response),
  };
}
```

---

## バリデーション

Zod スキーマ（`validation.ts`）：

```typescript
const MemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nickname: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']),
  tags: z.array(z.string()),
});

const ShuffleRequestSchema = z.object({
  members: z.array(MemberSchema).min(1),
  settings: LayoutSettingsSchema,
  constraints: z.array(ConstraintSchema),
});
```

---

## テスト

### 実行方法

```bash
npm test          # 1回実行
npm run test:watch  # ウォッチモード
```

### テストケース

`SeatArrangementService.test.ts`:

| テスト | 説明 |
|--------|------|
| 空のメンバーリスト | 成功を返す |
| メンバー数 > 座席数 | エラーを返す |
| 全メンバー割り当て | 全員に座席が割り当てられる |
| 固定席制約 | 指定した席に配置される |
| 無効な制約 | 無視される |
| 座席数 > メンバー数 | 正常動作 |
| 男女バランス | 考慮される |

---

## ビルド

### コマンド

```bash
npm run build     # esbuild でバンドル
npm run type-check  # 型チェック
```

### 出力

`dist/` ディレクトリに Lambda 用のバンドルファイルが生成されます：

```
dist/
├── shuffle-handler/
│   └── index.js
└── result-handler/
    └── index.js
```

---

## 環境変数

| 変数 | 説明 | デフォルト |
|------|------|-----------|
| `IS_LOCAL` | ローカル DynamoDB 使用フラグ | `false` |
| `TABLE_NAME` | DynamoDB テーブル名 | `seatcraft_layouts` |
| `AWS_REGION` | AWS リージョン | `ap-northeast-1` |
