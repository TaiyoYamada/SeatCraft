// ============================================================
// SeatCraft Shared Types
// フロントエンド・バックエンド間で共有する型定義
// ============================================================

// ------------------------------------------------------------
// Member Types
// ------------------------------------------------------------

export type Gender = 'male' | 'female' | 'other';

export interface Member {
    id: string;
    name: string;
    nickname?: string;
    gender: Gender;
    tags: string[];
}

// ------------------------------------------------------------
// Seat Types
// ------------------------------------------------------------

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

export interface SeatTemplate {
    type: SeatTemplateType;
    name: string;
    description: string;
    defaultSeatCount: number;
}

// ------------------------------------------------------------
// Constraint Types
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// Assignment Types
// ------------------------------------------------------------

export interface SeatAssignment {
    seatId: string;
    memberId: string;
}

// ------------------------------------------------------------
// Layout Types
// ------------------------------------------------------------

export interface LayoutSettings {
    templateType: SeatTemplateType;
    seats: Seat[];
    canvasWidth: number;
    canvasHeight: number;
    gridSize: number;
}

export interface LayoutResult {
    id: string;
    members: Member[];
    settings: LayoutSettings;
    assignments: SeatAssignment[];
    constraints: Constraint[];
    createdAt: string;
}

// ------------------------------------------------------------
// API Types
// ------------------------------------------------------------

export interface ShuffleRequest {
    members: Member[];
    settings: LayoutSettings;
    constraints: Constraint[];
}

export interface ShuffleResponse {
    id: string;
    assignments: SeatAssignment[];
}

export interface GetResultResponse {
    layout: LayoutResult;
}

export interface ApiErrorResponse {
    error: string;
    message: string;
    details?: Record<string, unknown>;
}

// ------------------------------------------------------------
// Utility Types
// ------------------------------------------------------------

export type CreateMemberInput = Omit<Member, 'id'>;
export type CreateSeatInput = Omit<Seat, 'id'>;
export type CreateConstraintInput<T extends Constraint> = Omit<T, 'id'>;
