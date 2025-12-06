// ============================================================
// SeatArrangementService
// 制約付き席配置アルゴリズム
// ============================================================

import type { Member, Seat, Constraint, SeatAssignment } from '../entities.js';
import { areSeatsAdjacent } from '../value-objects.js';

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
}

const DEFAULT_OPTIONS: Required<ArrangementOptions> = {
    maxRetries: 100,
    adjacencyThreshold: 50,
};

/**
 * 制約付き席配置を行う純粋関数
 * 
 * アルゴリズム:
 * 1. 固定席の配置
 * 2. NG ペア制約を考慮しながらシャッフル
 * 3. 男女バランスを考慮した微調整
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

    // 男女バランスの有無
    const hasGenderBalance = enabledConstraints.some(
        (c) => c.type === 'genderBalance'
    );

    // 初期配置の生成
    let bestAssignments: SeatAssignment[] = [];
    let bestScore = -Infinity;

    for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
        const result = tryArrangement(
            members,
            seats,
            fixedSeatConstraints,
            ngPairConstraints,
            hasGenderBalance,
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
    hasGenderBalance: boolean,
    adjacencyThreshold: number
): { assignments: SeatAssignment[]; score: number } {
    const assignments: SeatAssignment[] = [];
    const usedSeatIds = new Set<string>();
    const assignedMemberIds = new Set<string>();

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
    const remainingSeats = seats.filter((s) => !usedSeatIds.has(s.id));

    // シャッフル
    const shuffledMembers = shuffleArray([...remainingMembers]);

    // 男女バランスを考慮する場合、交互に配置を試みる
    if (hasGenderBalance) {
        shuffledMembers.sort((a, b) => {
            if (a.gender === b.gender) return 0;
            // 男女交互になるようにソート
            return a.gender === 'male' ? -1 : 1;
        });

        // 交互に並べ替え
        const males = shuffledMembers.filter((m) => m.gender === 'male');
        const females = shuffledMembers.filter((m) => m.gender === 'female');
        const others = shuffledMembers.filter((m) => m.gender === 'other');

        const interleaved: Member[] = [];
        const maxLen = Math.max(males.length, females.length, others.length);

        for (let i = 0; i < maxLen; i++) {
            if (i < males.length) interleaved.push(males[i]);
            if (i < females.length) interleaved.push(females[i]);
            if (i < others.length) interleaved.push(others[i]);
        }

        shuffledMembers.length = 0;
        shuffledMembers.push(...interleaved);
    }

    // 3. 残りのメンバーを座席に配置
    for (let i = 0; i < shuffledMembers.length && i < remainingSeats.length; i++) {
        assignments.push({
            seatId: remainingSeats[i].id,
            memberId: shuffledMembers[i].id,
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
