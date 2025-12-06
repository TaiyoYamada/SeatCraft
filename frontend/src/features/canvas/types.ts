// ============================================================
// Canvas Types
// ============================================================

import type { Seat, SeatTemplateType } from '@/features/layouts/types';
import type { Member } from '@/features/members/types';

export interface SeatAssignment {
    seatId: string;
    memberId: string;
}

export interface CanvasViewport {
    x: number;
    y: number;
    zoom: number;
}

export interface ConstraintType {
    id: string;
    type: 'genderBalance' | 'fixedSeat' | 'ngPair';
    enabled: boolean;
    // FixedSeat
    memberId?: string;
    seatId?: string;
    // NGPair
    memberIds?: [string, string];
}
