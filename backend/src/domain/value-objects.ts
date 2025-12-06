// ============================================================
// Value Objects
// ============================================================

import { v4 as uuidv4 } from 'uuid';

/**
 * 一意な ID を生成する
 */
export function generateId(): string {
    return uuidv4();
}

/**
 * ID のバリデーション
 */
export function isValidId(id: string): boolean {
    // UUID v4 形式または任意の文字列 (将来的に nanoid なども許容)
    return typeof id === 'string' && id.length > 0 && id.length <= 128;
}

/**
 * 座席が隣接しているかどうかを判定する
 * 隣接 = 座席間の距離がしきい値以下
 */
export function areSeatsAdjacent(
    seat1: { position: { x: number; y: number }; size: { width: number; height: number } },
    seat2: { position: { x: number; y: number }; size: { width: number; height: number } },
    threshold: number = 50
): boolean {
    // 座席の中心点を計算
    const center1 = {
        x: seat1.position.x + seat1.size.width / 2,
        y: seat1.position.y + seat1.size.height / 2,
    };
    const center2 = {
        x: seat2.position.x + seat2.size.width / 2,
        y: seat2.position.y + seat2.size.height / 2,
    };

    // 距離を計算
    const distance = Math.sqrt(
        Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
    );

    // 座席サイズの半分の合計 + しきい値以下なら隣接とみなす
    const minDistance =
        (seat1.size.width + seat2.size.width) / 2 + threshold;

    return distance <= minDistance;
}

/**
 * Gender の日本語表示名
 */
export function getGenderDisplayName(gender: 'male' | 'female' | 'other'): string {
    const names = {
        male: '男性',
        female: '女性',
        other: 'その他',
    };
    return names[gender];
}
