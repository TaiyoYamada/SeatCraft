// ============================================================
// GenerateLayoutUseCase
// ============================================================

import type { Member, Constraint, LayoutSettings, SeatAssignment } from '../domain/entities.js';
import { createLayout } from '../domain/entities.js';
import { arrangeSeats } from '../domain/services/SeatArrangementService.js';
import { generateId } from '../domain/value-objects.js';
import type { LayoutRepository } from '../shared/repository.js';

export interface ShuffleRequest {
    members: Member[];
    settings: LayoutSettings;
    constraints: Constraint[];
}

export interface ShuffleResponse {
    id: string;
    assignments: SeatAssignment[];
}

export class GenerateLayoutUseCase {
    constructor(private readonly layoutRepository: LayoutRepository) { }

    async execute(request: ShuffleRequest): Promise<ShuffleResponse> {
        // 1. 席配置を生成
        const result = arrangeSeats(
            request.members,
            request.settings.seats,
            request.constraints
        );

        if (!result.success) {
            throw new Error(result.errors.join(', '));
        }

        // 2. レイアウトエンティティを作成
        const layoutId = generateId();
        const layout = createLayout({
            id: layoutId,
            members: request.members,
            settings: request.settings,
            assignments: result.assignments,
            constraints: request.constraints,
        });

        // 3. 保存
        await this.layoutRepository.save(layout);

        // 4. レスポンスを返却
        return {
            id: layoutId,
            assignments: result.assignments,
        };
    }
}
