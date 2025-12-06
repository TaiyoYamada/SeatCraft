
# SeatCraft – AGENTS Behavioral Specification
このドキュメントは、SeatCraft プロジェクトに参加する AI エージェントに対して、
一貫した品質基準・アーキテクチャ原則・技術方針を共有するためのガイドラインである。

エージェントは本ドキュメントを常に参照し、SeatCraft に最適化された形でコード生成・設計・改善提案を行うこと。

---

# Mission
SeatCraft は「自由で柔軟な席配置アプリ」を実現するための Web アプリケーションである。

ユーザーは：
- メンバー（名前/ニックネーム/性別/タグ）を登録
- 席のテンプレートを選ぶ
- 完全フリーレイアウトのキャンバスで席を配置
- 制約（男女バランス、固定席、NGペアなど）を設定
- 自動配置 / 手動調整を行い
- 結果を保存して共有できる

エージェントは SeatCraft の技術的コンセプト・アーキテクチャ・品質基準に従って、
あらゆる生成物（コード / 設計 / 修正提案）をこの Mission に最適化する。

---

# Architecture Principles
エージェントは以下の原則を必ず遵守する。

## ■ SOLID
- **S：単一責任**  
  UI・状態管理・ドメインロジック・永続化を厳密に分離。
- **O：拡張に開かれ、修正に閉じる**  
  新しい制約やレイアウトタイプを追加しやすい構造にする。
- **L：置換可能性**  
  依存を抽象化し、サービス層から実装詳細を隠す。
- **I：インターフェース分離**  
  小さい・役割が明確な関数/型に分割する。
- **D：依存性逆転**  
  UseCase → Repository Interface → DynamoDB 実装の方向に揃える。

## ■ Clean Architecture
```

domain      ← pure logic（制約充足・座席配置アルゴリズム）
application ← usecases（生成・取得）
infrastructure ← DB / API / Lambda handlers
presentation ← Next.js（UI）

```

## ■ 再利用性
- 自動配置アルゴリズムは **UI から独立した純粋 TS モジュール**で実装する。

## ■ 型安全
- すべての API 入出力に **zod バリデーション**  
- TS の型を強く保証、`any` は原則禁止。

---

# 🛠️ Tech Stack Guidelines

## ■ Frontend
- **Next.js 16（App Router）**  
- **React 最新**  
- **TypeScript 5.9+**  
- **TailwindCSS 最新**  
- 状態管理は以下を原則とする：
  - 軽量用途：React Hooks
  - 複雑＝キャンバス：**Zustand**

### デザイン方針
- モダンでフラット（Figma / Linear 系）
- シャドウは最小限
- ラウンド大きめ（`rounded-xl`〜`2xl`）
- アニメーション：`framer-motion` など軽量ライブラリOK

---

## ■ Backend
- AWS Lambda（Node.js 22 + TS）
- AWS SDK v3
- SAM で API Gateway + Lambda を管理
- Terraform で DynamoDB / IAM / S3 を管理

### Lambda handler の原則
- handler は：
  - 入力パース
  - バリデーション
  - UseCase 呼び出し
  - HTTP 形式に変換  
  **これ以外の処理は書かない**

---

## ■ DynamoDB Model
テーブル：`seatcraft_layouts`

| Field | Type | Description |
|-------|------|-------------|
| id | string (PK) | レイアウトID |
| settings | string | メンバー/席/制約の入力情報 |
| result | string | 最終席配置 |
| createdAt | string | ISO8601 |

---

# Domain Model Rules

## Member
```

name: string
nickname?: string
gender: "male" | "female" | "other" | "unknown"
tags: string[]

```

## Seat
```

id: string
position: { x: number; y: number }
rotation?: number
tableId?: string

```

## Constraint
```

balanceGenders?: boolean
avoidPairs?: [string, string][]
fixedSeats?: { member: string; seatId: string }[]
separateGroups?: string[]

```

## Layout
```

seats: Seat[]
assignments: Record<seatId, memberId | null>

```

---

# 🔧 Algorithm Requirements
SeatCraft は「制約付き座席割り当て問題」を扱う。  
エージェントは以下のガイドラインに沿ってアルゴリズムを構築する：

1. **固定席を優先配置**
2. **NGペアを回避**
3. **男女バランス実現（可能な限り）**
4. **グループ分散**
5. 最終調整としてランダムサンプリング（Monte Carlo）を用いて最適解に近づける
6. 制約を満たせない場合は理由を返す（例：席数不足など）

---

# 📐 Code Style & Conventions
- ESLint（Next.js 推奨設定）
- Prettier（セミコロンあり）
- モジュール分割は以下を守る：

### フロント
```

features/
canvas/
state.ts
components/
algorithms/

```

### バックエンド
```

domain/
application/
infrastructure/

```

### 命名規則
- 関数：camelCase  
- 型・クラス：PascalCase  
- 定数：UPPER_SNAKE_CASE  

### コメント
- 原則シンプル  
- 複雑ロジックには必ず説明を書く

---

# AGENTS Execution Rules

エージェントは以下の動作原則を守る。

1. **不完全な指示でも推測して補完する**  
2. **複雑化する前に抽象化を提案する**  
3. **冗長コードを避け、最新のベストプラクティスを優先する**
4. **変更の影響範囲を説明しながらコードを生成する**
5. **安全でない・非効率・反復的な処理は改善案を即提案**
6. **生成物は SeatCraft のアーキテクチャに常に適合させる**

---

# Testing Principles
- Domain Service（SeatArrangementService）の単体テストは必須
- テストは Jest か Vitest を使用
- ランダム性のある処理は seed 固定でテストする

---

# Goal
Aiエージェント は SeatCraft プロジェクトにおいて、  
人間のチームメンバーと同等の品質基準を持ち、  
一貫したアーキテクチャと最新の実装方針に沿って  
コード・設計・改善提案を生成する。

AGENTS.md は SeatCraft の「開発憲法」である。