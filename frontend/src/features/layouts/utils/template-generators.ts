// ============================================================
// Template Generators
// 各テンプレートから座席位置を生成する純粋関数
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type { Seat, SeatTemplateType } from '../types';

const SEAT_SIZE = { width: 80, height: 80 };
const SEAT_GAP = 20;

/**
 * テンプレートタイプと座席数から座席配置を生成
 */
export function generateSeatsFromTemplate(
    type: SeatTemplateType,
    seatCount: number,
    canvasWidth: number,
    canvasHeight: number
): Seat[] {
    switch (type) {
        case 'line':
            return generateLineSeats(seatCount, canvasWidth, canvasHeight);
        case 'circle':
            return generateCircleSeats(seatCount, canvasWidth, canvasHeight);
        case 'island':
            return generateIslandSeats(seatCount, canvasWidth, canvasHeight);
        case 'custom':
            return [];
        default:
            return [];
    }
}

/**
 * 直線型の座席配置を生成
 */
function generateLineSeats(
    count: number,
    canvasWidth: number,
    canvasHeight: number
): Seat[] {
    const seats: Seat[] = [];
    const totalWidth = count * (SEAT_SIZE.width + SEAT_GAP) - SEAT_GAP;
    const startX = (canvasWidth - totalWidth) / 2;
    const y = (canvasHeight - SEAT_SIZE.height) / 2;

    for (let i = 0; i < count; i++) {
        seats.push({
            id: uuidv4(),
            position: {
                x: startX + i * (SEAT_SIZE.width + SEAT_GAP),
                y,
            },
            size: SEAT_SIZE,
            label: `${i + 1}`,
        });
    }

    return seats;
}

/**
 * 円卓型の座席配置を生成
 */
function generateCircleSeats(
    count: number,
    canvasWidth: number,
    canvasHeight: number
): Seat[] {
    const seats: Seat[] = [];
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) * 0.35;

    for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        seats.push({
            id: uuidv4(),
            position: {
                x: centerX + radius * Math.cos(angle) - SEAT_SIZE.width / 2,
                y: centerY + radius * Math.sin(angle) - SEAT_SIZE.height / 2,
            },
            size: SEAT_SIZE,
            label: `${i + 1}`,
        });
    }

    return seats;
}

/**
 * 島型の座席配置を生成（2×2 の島を複数）
 */
function generateIslandSeats(
    count: number,
    canvasWidth: number,
    canvasHeight: number
): Seat[] {
    const seats: Seat[] = [];
    const seatsPerIsland = 4;
    const islandCount = Math.ceil(count / seatsPerIsland);
    const islandsPerRow = Math.ceil(Math.sqrt(islandCount));

    const islandWidth = 2 * SEAT_SIZE.width + SEAT_GAP;
    const islandHeight = 2 * SEAT_SIZE.height + SEAT_GAP;
    const islandGap = 60;

    const totalWidth = islandsPerRow * islandWidth + (islandsPerRow - 1) * islandGap;
    const totalRowCount = Math.ceil(islandCount / islandsPerRow);
    const totalHeight = totalRowCount * islandHeight + (totalRowCount - 1) * islandGap;

    const startX = (canvasWidth - totalWidth) / 2;
    const startY = (canvasHeight - totalHeight) / 2;

    let seatIndex = 0;
    for (let island = 0; island < islandCount && seatIndex < count; island++) {
        const islandRow = Math.floor(island / islandsPerRow);
        const islandCol = island % islandsPerRow;
        const islandX = startX + islandCol * (islandWidth + islandGap);
        const islandY = startY + islandRow * (islandHeight + islandGap);

        // 各島に4席配置
        const positions = [
            { x: 0, y: 0 },
            { x: SEAT_SIZE.width + SEAT_GAP, y: 0 },
            { x: 0, y: SEAT_SIZE.height + SEAT_GAP },
            { x: SEAT_SIZE.width + SEAT_GAP, y: SEAT_SIZE.height + SEAT_GAP },
        ];

        for (const pos of positions) {
            if (seatIndex >= count) break;
            seats.push({
                id: uuidv4(),
                position: {
                    x: islandX + pos.x,
                    y: islandY + pos.y,
                },
                size: SEAT_SIZE,
                label: `${seatIndex + 1}`,
            });
            seatIndex++;
        }
    }

    return seats;
}

/**
 * グリッドにスナップ
 */
export function snapToGrid(value: number, gridSize: number): number {
    return Math.round(value / gridSize) * gridSize;
}
