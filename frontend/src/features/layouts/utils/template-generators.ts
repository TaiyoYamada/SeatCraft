// ============================================================
// Template Generators
// 各テンプレートから座席位置を生成する純粋関数
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type { Seat, SeatTemplateType } from '../types';

// 最大50人対応
export const MAX_MEMBERS = 50;

// 基本サイズ（動的に調整される）
const BASE_SEAT_SIZE = { width: 80, height: 80 };
const MIN_SEAT_SIZE = { width: 40, height: 40 };
const BASE_GAP = 20;
const MIN_GAP = 10;

/**
 * 人数に応じた座席サイズを計算
 */
export function calculateSeatSize(
    seatCount: number,
    canvasWidth: number,
    canvasHeight: number
): { width: number; height: number; gap: number } {
    // 20人以下は通常サイズ
    if (seatCount <= 20) {
        return { ...BASE_SEAT_SIZE, gap: BASE_GAP };
    }

    // 20〜50人は徐々に縮小
    const scaleFactor = Math.max(0.5, 1 - (seatCount - 20) / 60);
    const width = Math.max(MIN_SEAT_SIZE.width, Math.round(BASE_SEAT_SIZE.width * scaleFactor));
    const height = Math.max(MIN_SEAT_SIZE.height, Math.round(BASE_SEAT_SIZE.height * scaleFactor));
    const gap = Math.max(MIN_GAP, Math.round(BASE_GAP * scaleFactor));

    return { width, height, gap };
}

export interface IslandOptions {
    rows: number;
    cols: number;
}

/**
 * テンプレートタイプと座席数から座席配置を生成
 */
export function generateSeatsFromTemplate(
    type: SeatTemplateType,
    seatCount: number,
    canvasWidth: number,
    canvasHeight: number,
    islandOptions?: IslandOptions
): Seat[] {
    const clampedCount = Math.min(seatCount, MAX_MEMBERS);

    switch (type) {
        case 'line':
            return generateLineSeats(clampedCount, canvasWidth, canvasHeight);
        case 'circle':
            return generateCircleSeats(clampedCount, canvasWidth, canvasHeight);
        case 'island':
            return generateIslandSeats(clampedCount, canvasWidth, canvasHeight, islandOptions);
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
    const seatSize = calculateSeatSize(count, canvasWidth, canvasHeight);

    // 1列に収まる最大数を計算
    const maxPerRow = Math.floor((canvasWidth - 40) / (seatSize.width + seatSize.gap));
    const rowCount = Math.ceil(count / maxPerRow);
    const seatsPerRow = Math.min(count, maxPerRow);

    const totalWidth = seatsPerRow * (seatSize.width + seatSize.gap) - seatSize.gap;
    const totalHeight = rowCount * (seatSize.height + seatSize.gap) - seatSize.gap;
    const startX = (canvasWidth - totalWidth) / 2;
    const startY = (canvasHeight - totalHeight) / 2;

    let seatIndex = 0;
    for (let row = 0; row < rowCount && seatIndex < count; row++) {
        const seatsInThisRow = Math.min(seatsPerRow, count - seatIndex);
        const rowWidth = seatsInThisRow * (seatSize.width + seatSize.gap) - seatSize.gap;
        const rowStartX = (canvasWidth - rowWidth) / 2;

        for (let col = 0; col < seatsInThisRow; col++) {
            seats.push({
                id: uuidv4(),
                position: {
                    x: rowStartX + col * (seatSize.width + seatSize.gap),
                    y: startY + row * (seatSize.height + seatSize.gap),
                },
                size: { width: seatSize.width, height: seatSize.height },
                label: `${seatIndex + 1}`,
            });
            seatIndex++;
        }
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
    const seatSize = calculateSeatSize(count, canvasWidth, canvasHeight);
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // 座席サイズに応じて半径を調整
    const circumference = count * (seatSize.width + seatSize.gap);
    const minRadius = circumference / (2 * Math.PI);
    const maxRadius = Math.min(canvasWidth, canvasHeight) * 0.4 - seatSize.width / 2;
    const radius = Math.max(minRadius, Math.min(maxRadius, Math.min(canvasWidth, canvasHeight) * 0.35));

    for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        seats.push({
            id: uuidv4(),
            position: {
                x: centerX + radius * Math.cos(angle) - seatSize.width / 2,
                y: centerY + radius * Math.sin(angle) - seatSize.height / 2,
            },
            size: { width: seatSize.width, height: seatSize.height },
            label: `${i + 1}`,
        });
    }

    return seats;
}

/**
 * 島型の座席配置を生成（行列数を指定可能）
 */
function generateIslandSeats(
    count: number,
    canvasWidth: number,
    canvasHeight: number,
    options?: IslandOptions
): Seat[] {
    const seats: Seat[] = [];
    const seatSize = calculateSeatSize(count, canvasWidth, canvasHeight);

    // デフォルトは2×2の島
    const islandRows = options?.rows || 2;
    const islandCols = options?.cols || 2;
    const seatsPerIsland = islandRows * islandCols;
    const islandCount = Math.ceil(count / seatsPerIsland);

    // 島の配置（正方形に近い形）
    const islandsPerRow = Math.ceil(Math.sqrt(islandCount));
    const islandRowCount = Math.ceil(islandCount / islandsPerRow);

    const islandWidth = islandCols * seatSize.width + (islandCols - 1) * seatSize.gap;
    const islandHeight = islandRows * seatSize.height + (islandRows - 1) * seatSize.gap;
    const islandGapX = Math.max(40, seatSize.gap * 2);
    const islandGapY = Math.max(40, seatSize.gap * 2);

    const totalWidth = islandsPerRow * islandWidth + (islandsPerRow - 1) * islandGapX;
    const totalHeight = islandRowCount * islandHeight + (islandRowCount - 1) * islandGapY;

    const startX = (canvasWidth - totalWidth) / 2;
    const startY = (canvasHeight - totalHeight) / 2;

    let seatIndex = 0;
    for (let island = 0; island < islandCount && seatIndex < count; island++) {
        const iRow = Math.floor(island / islandsPerRow);
        const iCol = island % islandsPerRow;
        const islandX = startX + iCol * (islandWidth + islandGapX);
        const islandY = startY + iRow * (islandHeight + islandGapY);

        // 島内の座席配置
        for (let row = 0; row < islandRows; row++) {
            for (let col = 0; col < islandCols; col++) {
                if (seatIndex >= count) break;
                seats.push({
                    id: uuidv4(),
                    position: {
                        x: islandX + col * (seatSize.width + seatSize.gap),
                        y: islandY + row * (seatSize.height + seatSize.gap),
                    },
                    size: { width: seatSize.width, height: seatSize.height },
                    label: `${seatIndex + 1}`,
                });
                seatIndex++;
            }
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
