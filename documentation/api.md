# API 仕様

## 概要

SeatCraft バックエンド API の仕様です。

| 項目 | 値 |
|------|-----|
| ベース URL (本番) | `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}` |
| ベース URL (ローカル) | `http://localhost:3001` |
| コンテンツタイプ | `application/json` |

---

## エンドポイント一覧

| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/shuffle` | 席配置を生成・保存 |
| GET | `/result/{id}` | 保存された結果を取得 |

---

## POST /shuffle

席配置を生成し、DynamoDB に保存します。

### リクエスト

```json
{
  "members": [
    {
      "id": "m1",
      "name": "山田太郎",
      "nickname": "やまちゃん",
      "gender": "male",
      "tags": ["営業部"]
    },
    {
      "id": "m2",
      "name": "鈴木花子",
      "gender": "female",
      "tags": ["開発部"]
    }
  ],
  "settings": {
    "templateType": "line",
    "seats": [
      {
        "id": "s1",
        "position": { "x": 0, "y": 0 },
        "size": { "width": 80, "height": 80 },
        "label": "1"
      },
      {
        "id": "s2",
        "position": { "x": 100, "y": 0 },
        "size": { "width": 80, "height": 80 },
        "label": "2"
      }
    ],
    "canvasWidth": 1200,
    "canvasHeight": 800,
    "gridSize": 20
  },
  "constraints": [
    {
      "id": "c1",
      "type": "genderBalance",
      "enabled": true
    },
    {
      "id": "c2",
      "type": "fixedSeat",
      "enabled": true,
      "memberId": "m1",
      "seatId": "s1"
    }
  ]
}
```

### リクエストボディ

| フィールド | 型 | 必須 | 説明 |
|------------|-----|------|------|
| `members` | Member[] | ✓ | メンバーリスト（1件以上） |
| `settings` | LayoutSettings | ✓ | レイアウト設定 |
| `constraints` | Constraint[] | ✓ | 制約条件リスト |

#### Member

| フィールド | 型 | 必須 | 説明 |
|------------|-----|------|------|
| `id` | string | ✓ | メンバー ID |
| `name` | string | ✓ | 名前 |
| `nickname` | string | - | ニックネーム |
| `gender` | "male" \| "female" \| "other" | ✓ | 性別 |
| `tags` | string[] | ✓ | タグ |

#### LayoutSettings

| フィールド | 型 | 必須 | 説明 |
|------------|-----|------|------|
| `templateType` | "line" \| "circle" \| "island" \| "custom" | ✓ | テンプレート種別 |
| `seats` | Seat[] | ✓ | 座席リスト |
| `canvasWidth` | number | ✓ | キャンバス幅 |
| `canvasHeight` | number | ✓ | キャンバス高さ |
| `gridSize` | number | ✓ | グリッドサイズ |

#### Seat

| フィールド | 型 | 必須 | 説明 |
|------------|-----|------|------|
| `id` | string | ✓ | 座席 ID |
| `position` | { x: number, y: number } | ✓ | 位置 |
| `size` | { width: number, height: number } | ✓ | サイズ |
| `label` | string | - | ラベル |

#### Constraint

| タイプ | 追加フィールド | 説明 |
|--------|---------------|------|
| `genderBalance` | - | 男女バランス考慮 |
| `fixedSeat` | `memberId`, `seatId` | 固定席 |
| `ngPair` | `memberIds: [string, string]` | NG ペア |

### レスポンス

#### 成功 (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "assignments": [
    { "seatId": "s1", "memberId": "m1" },
    { "seatId": "s2", "memberId": "m2" }
  ]
}
```

| フィールド | 型 | 説明 |
|------------|-----|------|
| `id` | string | 生成されたレイアウト ID |
| `assignments` | SeatAssignment[] | 座席割り当て結果 |

#### エラー

| ステータス | 説明 |
|-----------|------|
| 400 | リクエストボディが不正 |
| 500 | サーバーエラー |

```json
{
  "error": "VALIDATION_ERROR",
  "message": "members: 1件以上必要です"
}
```

---

## GET /result/{id}

保存されたレイアウト結果を取得します。

### リクエスト

パスパラメータ：

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `id` | string | レイアウト ID |

### レスポンス

#### 成功 (200)

```json
{
  "layout": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "members": [...],
    "settings": {...},
    "assignments": [...],
    "constraints": [...],
    "createdAt": "2024-12-06T09:00:00.000Z"
  }
}
```

#### エラー

| ステータス | 説明 |
|-----------|------|
| 400 | ID が指定されていない |
| 404 | レイアウトが存在しない |
| 500 | サーバーエラー |

```json
{
  "error": "NOT_FOUND",
  "message": "レイアウトが見つかりません: xxx"
}
```

---

## CORS 設定

すべてのエンドポイントで以下の CORS ヘッダーが返されます：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

---

## エラーレスポンス形式

```json
{
  "error": "ERROR_CODE",
  "message": "人間が読めるエラーメッセージ",
  "details": {}  // オプション
}
```

| エラーコード | 説明 |
|-------------|------|
| `BAD_REQUEST` | リクエスト形式が不正 |
| `VALIDATION_ERROR` | バリデーションエラー |
| `NOT_FOUND` | リソースが見つからない |
| `INTERNAL_ERROR` | サーバー内部エラー |
