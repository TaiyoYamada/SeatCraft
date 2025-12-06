import { describe, it, expect } from 'vitest';
import { arrangeSeats } from './SeatArrangementService.js';
import type { Member, Seat, Constraint } from '../entities.js';

// テスト用ヘルパー関数
function createMember(id: string, name: string, gender: 'male' | 'female' | 'other'): Member {
    return { id, name, gender, tags: [] };
}

function createSeat(id: string, x: number, y: number): Seat {
    return {
        id,
        position: { x, y },
        size: { width: 80, height: 80 },
        label: id,
    };
}

describe('SeatArrangementService', () => {
    describe('arrangeSeats', () => {
        it('空のメンバーリストの場合は成功を返す', () => {
            const result = arrangeSeats([], [], []);

            expect(result.success).toBe(true);
            expect(result.assignments).toHaveLength(0);
            expect(result.errors).toHaveLength(0);
        });

        it('メンバー数が座席数を超える場合はエラーを返す', () => {
            const members = [
                createMember('m1', 'Member 1', 'male'),
                createMember('m2', 'Member 2', 'female'),
            ];
            const seats = [createSeat('s1', 0, 0)];

            const result = arrangeSeats(members, seats, []);

            expect(result.success).toBe(false);
            expect(result.errors).toContain('メンバー数が座席数を超えています');
        });

        it('全メンバーに座席が割り当てられる', () => {
            const members = [
                createMember('m1', 'Member 1', 'male'),
                createMember('m2', 'Member 2', 'female'),
                createMember('m3', 'Member 3', 'other'),
            ];
            const seats = [
                createSeat('s1', 0, 0),
                createSeat('s2', 100, 0),
                createSeat('s3', 200, 0),
            ];

            const result = arrangeSeats(members, seats, []);

            expect(result.success).toBe(true);
            expect(result.assignments).toHaveLength(3);

            // 全メンバーが割り当てられていることを確認
            const assignedMemberIds = result.assignments.map((a) => a.memberId);
            expect(assignedMemberIds).toContain('m1');
            expect(assignedMemberIds).toContain('m2');
            expect(assignedMemberIds).toContain('m3');
        });

        it('固定席制約が正しく適用される', () => {
            const members = [
                createMember('m1', 'Member 1', 'male'),
                createMember('m2', 'Member 2', 'female'),
            ];
            const seats = [
                createSeat('s1', 0, 0),
                createSeat('s2', 100, 0),
            ];
            const constraints: Constraint[] = [
                {
                    id: 'c1',
                    type: 'fixedSeat',
                    enabled: true,
                    memberId: 'm1',
                    seatId: 's2',
                },
            ];

            const result = arrangeSeats(members, seats, constraints);

            expect(result.success).toBe(true);

            // m1 が s2 に配置されていることを確認
            const m1Assignment = result.assignments.find((a) => a.memberId === 'm1');
            expect(m1Assignment?.seatId).toBe('s2');
        });

        it('無効な制約は無視される', () => {
            const members = [
                createMember('m1', 'Member 1', 'male'),
                createMember('m2', 'Member 2', 'female'),
            ];
            const seats = [
                createSeat('s1', 0, 0),
                createSeat('s2', 100, 0),
            ];
            const constraints: Constraint[] = [
                {
                    id: 'c1',
                    type: 'fixedSeat',
                    enabled: false, // 無効
                    memberId: 'm1',
                    seatId: 's2',
                },
            ];

            const result = arrangeSeats(members, seats, constraints);

            expect(result.success).toBe(true);
            // 固定席制約が適用されないので、m1 は s1 または s2 のどちらかに配置される
            expect(result.assignments).toHaveLength(2);
        });

        it('座席数がメンバー数より多い場合も正常に動作する', () => {
            const members = [
                createMember('m1', 'Member 1', 'male'),
            ];
            const seats = [
                createSeat('s1', 0, 0),
                createSeat('s2', 100, 0),
                createSeat('s3', 200, 0),
            ];

            const result = arrangeSeats(members, seats, []);

            expect(result.success).toBe(true);
            expect(result.assignments).toHaveLength(1);
        });

        it('男女バランス制約を考慮する', () => {
            const members = [
                createMember('m1', 'Male 1', 'male'),
                createMember('m2', 'Male 2', 'male'),
                createMember('f1', 'Female 1', 'female'),
                createMember('f2', 'Female 2', 'female'),
            ];
            const seats = [
                createSeat('s1', 0, 0),
                createSeat('s2', 100, 0),
                createSeat('s3', 200, 0),
                createSeat('s4', 300, 0),
            ];
            const constraints: Constraint[] = [
                {
                    id: 'c1',
                    type: 'genderBalance',
                    enabled: true,
                },
            ];

            const result = arrangeSeats(members, seats, constraints);

            expect(result.success).toBe(true);
            expect(result.assignments).toHaveLength(4);
        });
    });
});
