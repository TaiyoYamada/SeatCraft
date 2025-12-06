// ============================================================
// GetLayoutUseCase
// ============================================================

import type { Member, LayoutSettings, SeatAssignment, Constraint } from '../domain/entities.js';
import type { LayoutRepository } from '../shared/repository.js';

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export interface LayoutResult {
    id: string;
    members: Member[];
    settings: LayoutSettings;
    assignments: SeatAssignment[];
    constraints: Constraint[];
    createdAt: string;
}

export interface GetResultResponse {
    layout: LayoutResult;
}

export class GetLayoutUseCase {
    constructor(private readonly layoutRepository: LayoutRepository) { }

    async execute(id: string): Promise<GetResultResponse> {
        // 1. レイアウトを取得
        const layout = await this.layoutRepository.findById(id);

        if (!layout) {
            throw new NotFoundError(`レイアウトが見つかりません: ${id}`);
        }

        // 2. レスポンスを返却
        return {
            layout: {
                id: layout.id,
                members: layout.members,
                settings: layout.settings,
                assignments: layout.assignments,
                constraints: layout.constraints,
                createdAt: layout.createdAt.toISOString(),
            },
        };
    }
}
