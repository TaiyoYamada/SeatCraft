// ============================================================
// Domain Entities
// ============================================================

// Member Types
export type Gender = 'male' | 'female' | 'other';

export interface Member {
    id: string;
    name: string;
    nickname?: string;
    gender: Gender;
    tags: string[];
}

// Seat Types
export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Seat {
    id: string;
    position: Position;
    size: Size;
    label?: string;
}

export type SeatTemplateType = 'line' | 'circle' | 'island' | 'custom';

// Constraint Types
export type ConstraintType =
    | 'genderBalance'
    | 'fixedSeat'
    | 'ngPair'
    | 'mustSitTogether'
    | 'mustNotSitAdjacent';

export interface BaseConstraint {
    id: string;
    type: ConstraintType;
    enabled: boolean;
}

export interface GenderBalanceConstraint extends BaseConstraint {
    type: 'genderBalance';
}

export interface FixedSeatConstraint extends BaseConstraint {
    type: 'fixedSeat';
    memberId: string;
    seatId: string;
}

export interface NGPairConstraint extends BaseConstraint {
    type: 'ngPair';
    memberIds: [string, string];
}

export interface MustSitTogetherConstraint extends BaseConstraint {
    type: 'mustSitTogether';
    memberIds: string[];
}

export interface MustNotSitAdjacentConstraint extends BaseConstraint {
    type: 'mustNotSitAdjacent';
    memberIds: [string, string];
}

export type Constraint =
    | GenderBalanceConstraint
    | FixedSeatConstraint
    | NGPairConstraint
    | MustSitTogetherConstraint
    | MustNotSitAdjacentConstraint;

// Assignment Types
export interface SeatAssignment {
    seatId: string;
    memberId: string;
}

// Layout Settings
export interface LayoutSettings {
    templateType: SeatTemplateType;
    seats: Seat[];
    canvasWidth: number;
    canvasHeight: number;
    gridSize: number;
}

/**
 * Layout 集約ルート
 * 席配置の結果を表すエンティティ
 */
export interface Layout {
    id: string;
    members: Member[];
    settings: LayoutSettings;
    assignments: SeatAssignment[];
    constraints: Constraint[];
    createdAt: Date;
}

/**
 * 新しいレイアウトを作成する
 */
export function createLayout(params: {
    id: string;
    members: Member[];
    settings: LayoutSettings;
    assignments: SeatAssignment[];
    constraints: Constraint[];
}): Layout {
    return {
        ...params,
        createdAt: new Date(),
    };
}

/**
 * レイアウトを永続化用の形式に変換する
 */
export function toLayoutRecord(layout: Layout): LayoutRecord {
    return {
        id: layout.id,
        result: JSON.stringify({
            members: layout.members,
            assignments: layout.assignments,
        }),
        settings: JSON.stringify(layout.settings),
        constraints: JSON.stringify(layout.constraints),
        createdAt: layout.createdAt.toISOString(),
    };
}

/**
 * 永続化形式からレイアウトを復元する
 */
export function fromLayoutRecord(record: LayoutRecord): Layout {
    const result = JSON.parse(record.result);
    return {
        id: record.id,
        members: result.members,
        settings: JSON.parse(record.settings),
        assignments: result.assignments,
        constraints: JSON.parse(record.constraints),
        createdAt: new Date(record.createdAt),
    };
}

/**
 * DynamoDB に保存する形式
 */
export interface LayoutRecord {
    id: string;
    result: string; // JSON string
    settings: string; // JSON string
    constraints: string; // JSON string
    createdAt: string; // ISO 8601
}
