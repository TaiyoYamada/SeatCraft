"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TemplateSelector } from "@/features/layouts/components/TemplateSelector";
import type { SeatTemplateType } from "@/features/layouts/types";
import { useCanvasStore } from "@/features/canvas/hooks/use-canvas";
import { useMembersStore } from "@/features/members/hooks/use-members";
import { generateSeatsFromTemplate, MAX_MEMBERS } from "@/features/layouts/utils/template-generators";

export default function TemplatesPage() {
    const router = useRouter();
    const [selectedTemplate, setSelectedTemplate] = useState<SeatTemplateType | null>(null);
    const [seatCount, setSeatCount] = useState(8);
    const [islandRows, setIslandRows] = useState(2);
    const [islandCols, setIslandCols] = useState(2);
    const members = useMembersStore((state) => state.members);
    const { setSeats, setTemplateType, canvasWidth, canvasHeight } = useCanvasStore();

    const handleContinue = () => {
        if (!selectedTemplate) return;

        // テンプレートから座席を生成
        const seats = generateSeatsFromTemplate(
            selectedTemplate,
            selectedTemplate === "custom" ? 0 : seatCount,
            canvasWidth,
            canvasHeight,
            selectedTemplate === "island" ? { rows: islandRows, cols: islandCols } : undefined
        );

        setTemplateType(selectedTemplate);
        setSeats(seats);
        router.push("/craft");
    };

    const handleSeatCountChange = (value: number) => {
        setSeatCount(Math.min(Math.max(2, value), MAX_MEMBERS));
    };

    return (
        <div className="min-h-screen py-4 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">テンプレート選択</h1>
                        <p className="text-[var(--text-muted)] mt-1 text-sm sm:text-base">
                            席のレイアウトを選んでください
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/members" className="btn btn-secondary text-sm sm:text-base">
                            ← メンバー編集
                        </Link>
                    </div>
                </div>

                {/* Member count info */}
                {members.length > 0 && (
                    <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-[var(--secondary)] rounded-lg">
                        <p className="text-sm">
                            登録メンバー: <strong>{members.length}</strong> 人
                            {members.length > MAX_MEMBERS && (
                                <span className="text-[var(--warning)] ml-2">
                                    (最大 {MAX_MEMBERS} 人まで)
                                </span>
                            )}
                        </p>
                    </div>
                )}

                {/* Template selection */}
                <div className="mb-6 sm:mb-8">
                    <TemplateSelector
                        selected={selectedTemplate}
                        onSelect={setSelectedTemplate}
                    />
                </div>

                {/* Seat count input */}
                {selectedTemplate && selectedTemplate !== "custom" && (
                    <div className="card mb-6 sm:mb-8 max-w-md animate-fade-in">
                        <label htmlFor="seatCount" className="block text-sm font-medium mb-2">
                            座席数 (最大 {MAX_MEMBERS} 人)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                id="seatCount"
                                min={2}
                                max={MAX_MEMBERS}
                                value={seatCount}
                                onChange={(e) => handleSeatCountChange(Number(e.target.value))}
                                className="flex-1"
                            />
                            <input
                                type="number"
                                value={seatCount}
                                onChange={(e) => handleSeatCountChange(Number(e.target.value))}
                                min={2}
                                max={MAX_MEMBERS}
                                className="input w-20 text-center"
                            />
                        </div>
                        {members.length > seatCount && (
                            <p className="text-sm text-[var(--warning)] mt-2">
                                ⚠ メンバー数({members.length})が座席数より多いです
                            </p>
                        )}
                    </div>
                )}

                {/* Island customization */}
                {selectedTemplate === "island" && (
                    <div className="card mb-6 sm:mb-8 max-w-md animate-fade-in">
                        <h3 className="text-sm font-medium mb-4">島のサイズ設定</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="islandRows" className="block text-xs text-[var(--text-muted)] mb-1">
                                    行数 (縦)
                                </label>
                                <input
                                    type="number"
                                    id="islandRows"
                                    value={islandRows}
                                    onChange={(e) => setIslandRows(Math.min(Math.max(1, Number(e.target.value)), 5))}
                                    min={1}
                                    max={5}
                                    className="input w-full text-center"
                                />
                            </div>
                            <div>
                                <label htmlFor="islandCols" className="block text-xs text-[var(--text-muted)] mb-1">
                                    列数 (横)
                                </label>
                                <input
                                    type="number"
                                    id="islandCols"
                                    value={islandCols}
                                    onChange={(e) => setIslandCols(Math.min(Math.max(1, Number(e.target.value)), 5))}
                                    min={1}
                                    max={5}
                                    className="input w-full text-center"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-2">
                            1島あたり {islandRows * islandCols} 席
                        </p>
                    </div>
                )}

                {/* Continue button */}
                {selectedTemplate && (
                    <div className="flex justify-end animate-fade-in">
                        <button
                            onClick={handleContinue}
                            className="btn btn-primary text-base sm:text-lg px-6 sm:px-8"
                        >
                            キャンバスへ進む →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
