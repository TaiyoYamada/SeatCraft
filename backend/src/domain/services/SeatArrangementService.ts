// ============================================================
// SeatArrangementService
// 制約付き席配置アルゴリズム
// ============================================================

import type { Member, Seat, Constraint, SeatAssignment } from '../entities.js';
import { areSeatsAdjacent } from '../value-objects.js';

/**
 * 男女配置モード
 */
export type GenderArrangementMode =
    | 'random'       // 完全ランダム
    | 'alternate'    // 男女交互
    | 'femaleFirst'  // 女性を前列（座席番号が小さい方）
    | 'maleFront'    // 男性を前列
    | 'femaleLast'   // 女性を後列
    | 'maleLast';    // 男性を後列

/**
 * 席配置サービスの結果
 */
export interface ArrangementResult {
    success: boolean;
    assignments: SeatAssignment[];
    errors: string[];
}

/**
 * 配置オプション
 */
export interface ArrangementOptions {
    maxRetries?: number;
    adjacencyThreshold?: number;
    genderMode?: GenderArrangementMode;
}

const DEFAULT_OPTIONS: Required<ArrangementOptions> = {
    maxRetries: 100,
    adjacencyThreshold: 50,
    genderMode: 'random',
};

/**
 * 制約付き席配置を行う純粋関数
 */
export function arrangeSeats(
    members: Member[],
    seats: Seat[],
    constraints: Constraint[],
    options: ArrangementOptions = {}
): ArrangementResult {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const errors: string[] = [];

    // バリデーション
    if (members.length > seats.length) {
        return {
            success: false,
            assignments: [],
            errors: ['メンバー数が座席数を超えています'],
        };
    }

    if (members.length === 0) {
        return {
            success: true,
            assignments: [],
            errors: [],
        };
    }

    // 有効な制約のみ抽出
    const enabledConstraints = constraints.filter((c) => c.enabled);

    // 固定席の抽出
    const fixedSeatConstraints = enabledConstraints.filter(
        (c) => c.type === 'fixedSeat'
    ) as Extract<Constraint, { type: 'fixedSeat' }>[];

    // NGペアの抽出
    const ngPairConstraints = enabledConstraints.filter(
        (c) => c.type === 'ngPair'
    ) as Extract<Constraint, { type: 'ngPair' }>[];

    // 男女バランスの有無（後方互換性）
    const hasGenderBalance = enabledConstraints.some(
        (c) => c.type === 'genderBalance'
    );

    // genderMode の決定
    const genderMode = hasGenderBalance && opts.genderMode === 'random'
        ? 'alternate'
        : opts.genderMode;

    // 初期配置の生成
    let bestAssignments: SeatAssignment[] = [];
    let bestScore = -Infinity;

    for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
        const result = tryArrangement(
            members,
            seats,
            fixedSeatConstraints,
            ngPairConstraints,
            genderMode,
            opts.adjacencyThreshold
        );

        if (result.score > bestScore) {
            bestScore = result.score;
            bestAssignments = result.assignments;
        }

        // 完璧なスコア（制約違反なし）なら終了
        if (result.score === 0) {
            break;
        }
    }

    // 制約違反のチェック
    const violations = checkConstraintViolations(
        bestAssignments,
        seats,
        ngPairConstraints,
        opts.adjacencyThreshold
    );

    if (violations.length > 0) {
        errors.push(...violations.map((v) => `警告: ${v}`));
    }

    return {
        success: true,
        assignments: bestAssignments,
        errors,
    };
}

/**
 * 1回の配置試行
 */
function tryArrangement(
    members: Member[],
    seats: Seat[],
    fixedSeatConstraints: Extract<Constraint, { type: 'fixedSeat' }>[],
    ngPairConstraints: Extract<Constraint, { type: 'ngPair' }>[],
    genderMode: GenderArrangementMode,
    adjacencyThreshold: number
): { assignments: SeatAssignment[]; score: number } {
    const assignments: SeatAssignment[] = [];
    const usedSeatIds = new Set<string>();
    const assignedMemberIds = new Set<string>();

    // 座席を位置でソート（前列 = Y座標が小さい、または左 = X座標が小さい）
    const sortedSeats = [...seats].sort((a, b) => {
        if (a.position.y !== b.position.y) {
            return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
    });

    // 1. 固定席を先に配置
    for (const constraint of fixedSeatConstraints) {
        const member = members.find((m) => m.id === constraint.memberId);
        const seat = seats.find((s) => s.id === constraint.seatId);

        if (member && seat && !usedSeatIds.has(seat.id)) {
            assignments.push({
                seatId: seat.id,
                memberId: member.id,
            });
            usedSeatIds.add(seat.id);
            assignedMemberIds.add(member.id);
        }
    }

    // 2. 残りのメンバーと座席を取得
    const remainingMembers = members.filter((m) => !assignedMemberIds.has(m.id));
    const remainingSeats = sortedSeats.filter((s) => !usedSeatIds.has(s.id));

    // 3. 男女配置モードに応じてメンバーをソート
    const orderedMembers = orderMembersByGenderMode(remainingMembers, genderMode);

    // 4. 残りのメンバーを座席に配置
    for (let i = 0; i < orderedMembers.length && i < remainingSeats.length; i++) {
        assignments.push({
            seatId: remainingSeats[i].id,
            memberId: orderedMembers[i].id,
        });
    }

    // スコア計算 (低いほど良い)
    const score = calculatePenalty(
        assignments,
        seats,
        ngPairConstraints,
        adjacencyThreshold
    );

    return { assignments, score: -score };
}

/**
 * 男女配置モードに応じてメンバーを並べる
 */
function orderMembersByGenderMode(
    members: Member[],
    mode: GenderArrangementMode
): Member[] {
    const shuffled = shuffleArray([...members]);

    switch (mode) {
        case 'random':
            return shuffled;

        case 'alternate': {
            // 男女交互に配置
            const males = shuffled.filter((m) => m.gender === 'male');
            const females = shuffled.filter((m) => m.gender === 'female');
            const others = shuffled.filter((m) => m.gender === 'other');

            const result: Member[] = [];
            const maxLen = Math.max(males.length, females.length);

            for (let i = 0; i < maxLen; i++) {
                if (i < males.length) result.push(males[i]);
                if (i < females.length) result.push(females[i]);
            }
            result.push(...others);
            return result;
        }

        case 'femaleFirst': {
            // 女性を前列に
            const females = shuffled.filter((m) => m.gender === 'female');
            const others = shuffled.filter((m) => m.gender !== 'female');
            return [...females, ...others];
        }

        case 'maleFront': {
            // 男性を前列に
            const males = shuffled.filter((m) => m.gender === 'male');
            const others = shuffled.filter((m) => m.gender !== 'male');
            return [...males, ...others];
        }

        case 'femaleLast': {
            // 女性を後列に
            const nonFemales = shuffled.filter((m) => m.gender !== 'female');
            const females = shuffled.filter((m) => m.gender === 'female');
            return [...nonFemales, ...females];
        }

        case 'maleLast': {
            // 男性を後列に
            const nonMales = shuffled.filter((m) => m.gender !== 'male');
            const males = shuffled.filter((m) => m.gender === 'male');
            return [...nonMales, ...males];
        }

        default:
            return shuffled;
    }
}

/**
 * 制約違反によるペナルティを計算
 */
function calculatePenalty(
    assignments: SeatAssignment[],
    seats: Seat[],
    ngPairConstraints: Extract<Constraint, { type: 'ngPair' }>[],
    adjacencyThreshold: number
): number {
    let penalty = 0;

    // NG ペアが隣り合っているかチェック
    for (const constraint of ngPairConstraints) {
        const [memberId1, memberId2] = constraint.memberIds;

        const assignment1 = assignments.find((a) => a.memberId === memberId1);
        const assignment2 = assignments.find((a) => a.memberId === memberId2);

        if (assignment1 && assignment2) {
            const seat1 = seats.find((s) => s.id === assignment1.seatId);
            const seat2 = seats.find((s) => s.id === assignment2.seatId);

            if (seat1 && seat2 && areSeatsAdjacent(seat1, seat2, adjacencyThreshold)) {
                penalty += 100; // NG ペアの隣接は大きなペナルティ
            }
        }
    }

    return penalty;
}

/**
 * 制約違反をチェック
 */
function checkConstraintViolations(
    assignments: SeatAssignment[],
    seats: Seat[],
    ngPairConstraints: Extract<Constraint, { type: 'ngPair' }>[],
    adjacencyThreshold: number
): string[] {
    const violations: string[] = [];

    for (const constraint of ngPairConstraints) {
        const [memberId1, memberId2] = constraint.memberIds;

        const assignment1 = assignments.find((a) => a.memberId === memberId1);
        const assignment2 = assignments.find((a) => a.memberId === memberId2);

        if (assignment1 && assignment2) {
            const seat1 = seats.find((s) => s.id === assignment1.seatId);
            const seat2 = seats.find((s) => s.id === assignment2.seatId);

            if (seat1 && seat2 && areSeatsAdjacent(seat1, seat2, adjacencyThreshold)) {
                violations.push(`NG ペアが隣り合っています`);
            }
        }
    }

    return violations;
}

/**
 * 配列をシャッフル (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
