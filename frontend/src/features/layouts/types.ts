// ============================================================
// Layout Types
// ============================================================

export type SeatTemplateType = 'line' | 'circle' | 'island' | 'custom';

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
    isLocked?: boolean;
}

export interface SeatTemplate {
    type: SeatTemplateType;
    name: string;
    description: string;
    icon: string;
    defaultSeatCount: number;
}

export const SEAT_TEMPLATES: SeatTemplate[] = [
    {
        type: 'line',
        name: '直線型',
        description: '一列に並ぶレイアウト。長テーブルに最適。',
        icon: '━━━',
        defaultSeatCount: 8,
    },
    {
        type: 'circle',
        name: '円卓型',
        description: '円形に配置。全員の顔が見えるレイアウト。',
        icon: '⭕',
        defaultSeatCount: 8,
    },
    {
        type: 'island',
        name: '島型',
        description: '複数のグループに分かれたレイアウト。',
        icon: '▣▣',
        defaultSeatCount: 12,
    },
    {
        type: 'custom',
        name: 'カスタム',
        description: '自由に席を配置できます。',
        icon: '✎',
        defaultSeatCount: 0,
    },
];
