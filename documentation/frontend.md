# フロントエンド構成

## 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 15.x | React フレームワーク (App Router) |
| React | 19.x | UI ライブラリ |
| TypeScript | 5.7.x | 型安全 |
| Tailwind CSS | 4.x | スタイリング |
| Zustand | 最新 | 状態管理 |
| @dnd-kit | 最新 | ドラッグ＆ドロップ |
| zod | 最新 | バリデーション |

---

## ディレクトリ構造

```
frontend/src/
├── app/                          # App Router ページ
│   ├── layout.tsx                # ルートレイアウト
│   ├── globals.css               # グローバルスタイル
│   ├── page.tsx                  # トップページ
│   ├── members/
│   │   └── page.tsx              # メンバー管理
│   ├── layouts/
│   │   └── templates/
│   │       └── page.tsx          # テンプレート選択
│   ├── craft/
│   │   └── page.tsx              # キャンバス
│   └── result/
│       └── [id]/
│           └── page.tsx          # 結果表示
│
├── features/                     # ドメイン別機能
│   ├── members/
│   │   ├── components/
│   │   │   ├── MemberForm.tsx    # 追加フォーム
│   │   │   └── MemberList.tsx    # 一覧表示
│   │   ├── hooks/
│   │   │   └── use-members.ts    # 状態管理
│   │   └── types.ts              # 型定義
│   │
│   ├── canvas/
│   │   ├── components/
│   │   │   ├── Canvas.tsx        # メインキャンバス
│   │   │   ├── DraggableSeat.tsx # ドラッグ可能座席
│   │   │   └── MemberPanel.tsx   # 未配置メンバー
│   │   ├── hooks/
│   │   │   └── use-canvas.ts     # 状態管理
│   │   └── types.ts              # 型定義
│   │
│   └── layouts/
│       ├── components/
│       │   └── TemplateSelector.tsx  # テンプレート選択
│       ├── utils/
│       │   └── template-generators.ts # 座席生成
│       └── types.ts              # 型定義
│
└── shared/                       # 共通コンポーネント
    └── components/
        └── Header.tsx            # ヘッダー
```

---

## ページ構成

### / (トップページ)

**ファイル**: `app/page.tsx`

- アプリの説明
- 機能紹介
- 使い方ガイド
- 「今すぐ始める」ボタン

### /members (メンバー管理)

**ファイル**: `app/members/page.tsx`

- メンバー追加フォーム
- メンバー一覧（編集・削除）
- 統計情報（男女比など）
- 次へ進むボタン

### /layouts/templates (テンプレート選択)

**ファイル**: `app/layouts/templates/page.tsx`

- テンプレートカード（直線・円卓・島型・カスタム）
- 座席数スライダー
- プレビュー

### /craft (キャンバス)

**ファイル**: `app/craft/page.tsx`

- ツールバー
- 未配置メンバーパネル
- メインキャンバス（Pan & Zoom）
- シャッフルボタン

### /result/[id] (結果表示)

**ファイル**: `app/result/[id]/page.tsx`

- レイアウトプレビュー
- 配置一覧
- URL 共有ボタン

---

## 主要コンポーネント

### MemberForm

メンバー追加・編集フォーム。

**Props**:
| Prop | 型 | 説明 |
|------|-----|------|
| `onSubmit` | `(input: CreateMemberInput) => void` | 送信時コールバック |
| `initialValues` | `Partial<CreateMemberInput>` | 初期値（編集時） |
| `submitLabel` | `string` | ボタンラベル |

### Canvas

Pan & Zoom 対応のメインキャンバス。

**機能**:
- マウスホイールでズーム
- ドラッグでパン
- グリッド表示
- 座席のドラッグ＆ドロップ

### DraggableSeat

ドラッグ可能な座席コンポーネント。

**Props**:
| Prop | 型 | 説明 |
|------|-----|------|
| `seat` | `Seat` | 座席データ |
| `assignedMember` | `Member \| null` | 割り当てメンバー |
| `onDrag` | `(seatId, x, y) => void` | ドラッグ時 |
| `onDrop` | `() => void` | ドロップ時 |
| `onUnassign` | `() => void` | 割り当て解除時 |

---

## 状態管理

### useMembersStore

メンバーリストの管理。localStorage に永続化。

```typescript
interface MembersState {
  members: Member[];
  addMember: (input: CreateMemberInput) => void;
  updateMember: (id: string, input: Partial<CreateMemberInput>) => void;
  removeMember: (id: string) => void;
  clearMembers: () => void;
}
```

### useCanvasStore

キャンバス状態の管理。localStorage に永続化。

```typescript
interface CanvasState {
  canvasWidth: number;
  canvasHeight: number;
  gridSize: number;
  viewport: CanvasViewport;
  templateType: SeatTemplateType | null;
  seats: Seat[];
  assignments: SeatAssignment[];
  constraints: ConstraintType[];
  // ... actions
}
```

---

## スタイリング

### CSS 変数

`globals.css` で定義されているカスタムプロパティ：

```css
:root {
  --background: #fafbfc;
  --foreground: #1a1a2e;
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --secondary: #f1f5f9;
  --accent: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --card-bg: #ffffff;
  --border: #e2e8f0;
  --text-muted: #64748b;
}
```

### ユーティリティクラス

| クラス | 説明 |
|--------|------|
| `.btn` | ボタン基本スタイル |
| `.btn-primary` | プライマリボタン |
| `.btn-secondary` | セカンダリボタン |
| `.btn-danger` | 危険ボタン |
| `.card` | カードスタイル |
| `.input` | 入力フィールド |
| `.badge` | バッジ |

---

## 環境変数

`.env.local` で設定：

```env
# バックエンド API URL（空の場合はローカルモック）
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## ビルド・デプロイ

### 開発

```bash
npm run dev
```

### 本番ビルド

```bash
npm run build
npm run start
```

### 静的エクスポート

```bash
npm run build
# out/ ディレクトリに静的ファイルが生成
```

### デプロイ先オプション

- **Vercel**: 推奨（Next.js 公式）
- **AWS Amplify**: AWS 統合環境
- **S3 + CloudFront**: 静的ホスティング（要設定調整）
