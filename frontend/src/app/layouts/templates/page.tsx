"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TemplateSelector } from "@/features/layouts/components/TemplateSelector";
import type { SeatTemplateType } from "@/features/layouts/types";
import { useCanvasStore } from "@/features/canvas/hooks/use-canvas";
import { useMembersStore } from "@/features/members/hooks/use-members";
import { generateSeatsFromTemplate } from "@/features/layouts/utils/template-generators";

export default function TemplatesPage() {
    const router = useRouter();
    const [selectedTemplate, setSelectedTemplate] = useState<SeatTemplateType | null>(null);
    const [seatCount, setSeatCount] = useState(8);
    const members = useMembersStore((state) => state.members);
    const { setSeats, setTemplateType, canvasWidth, canvasHeight } = useCanvasStore();

    const handleContinue = () => {
        if (!selectedTemplate) return;

        // テンプレートから座席を生成
        const seats = generateSeatsFromTemplate(
            selectedTemplate,
            selectedTemplate === "custom" ? 0 : seatCount,
            canvasWidth,
            canvasHeight
        );

        setTemplateType(selectedTemplate);
        setSeats(seats);
        router.push("/craft");
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">テンプレート選択</h1>
                        <p className="text-[var(--text-muted)] mt-1">
                            席のレイアウトを選んでください
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/members" className="btn btn-secondary">
                            ← メンバー編集
                        </Link>
                    </div>
                </div>

                {/* Member count info */}
                {members.length > 0 && (
                    <div className="mb-8 p-4 bg-[var(--secondary)] rounded-lg">
                        <p className="text-sm">
                            登録メンバー: <strong>{members.length}</strong> 人
                        </p>
                    </div>
                )}

                {/* Template selection */}
                <div className="mb-8">
                    <TemplateSelector
                        selected={selectedTemplate}
                        onSelect={setSelectedTemplate}
                    />
                </div>

                {/* Seat count input */}
                {selectedTemplate && selectedTemplate !== "custom" && (
                    <div className="card mb-8 max-w-md animate-fade-in">
                        <label htmlFor="seatCount" className="block text-sm font-medium mb-2">
                            座席数
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                id="seatCount"
                                min={2}
                                max={24}
                                value={seatCount}
                                onChange={(e) => setSeatCount(Number(e.target.value))}
                                className="flex-1"
                            />
                            <input
                                type="number"
                                value={seatCount}
                                onChange={(e) => setSeatCount(Number(e.target.value))}
                                min={2}
                                max={24}
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

                {/* Continue button */}
                {selectedTemplate && (
                    <div className="flex justify-end animate-fade-in">
                        <button
                            onClick={handleContinue}
                            className="btn btn-primary text-lg px-8"
                        >
                            キャンバスへ進む →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
