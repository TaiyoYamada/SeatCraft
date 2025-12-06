// ============================================================
// Repository Interface
// ============================================================

import type { Layout } from '../domain/entities.js';

/**
 * レイアウト永続化のリポジトリインターフェース
 */
export interface LayoutRepository {
    /**
     * レイアウトを保存する
     */
    save(layout: Layout): Promise<void>;

    /**
     * ID でレイアウトを取得する
     */
    findById(id: string): Promise<Layout | null>;
}
