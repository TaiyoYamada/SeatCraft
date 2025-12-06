"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Canvas } from "@/features/canvas/components/Canvas";
import { useCanvasStore } from "@/features/canvas/hooks/use-canvas";
import { useMembersStore } from "@/features/members/hooks/use-members";
import { v4 as uuidv4 } from "uuid";

type GenderMode = "random" | "alternate" | "femaleFirst" | "maleFront" | "femaleLast" | "maleLast";

const GENDER_MODES: { value: GenderMode; label: string }[] = [
    { value: "random", label: "ランダム" },
    { value: "alternate", label: "男女交互" },
    { value: "femaleFirst", label: "女性を前列" },
    { value: "maleFront", label: "男性を前列" },
    { value: "femaleLast", label: "女性を後列" },
    { value: "maleLast", label: "男性を後列" },
];

export default function CraftPage() {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [genderMode, setGenderMode] = useState<GenderMode>("random");
    const [showOptions, setShowOptions] = useState(false);

    const { seats, assignments, constraints, setAssignments, resetViewport } = useCanvasStore();
    const members = useMembersStore((state) => state.members);

    const getSettings = () => ({
        templateType: useCanvasStore.getState().templateType || "custom",
        seats,
        canvasWidth: useCanvasStore.getState().canvasWidth,
        canvasHeight: useCanvasStore.getState().canvasHeight,
        gridSize: useCanvasStore.getState().gridSize,
    });

    // シャッフルして保存
    const handleShuffle = async () => {
        if (members.length === 0) {
            setError("メンバーを登録してください");
            return;
        }
        if (seats.length === 0) {
            setError("座席を配置してください");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

            if (apiUrl) {
                const response = await fetch(`${apiUrl}/shuffle`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        members,
                        settings: getSettings(),
                        constraints: constraints.filter((c) => c.enabled),
                        genderMode,
                    }),
                });

                if (!response.ok) {
                    throw new Error("シャッフルに失敗しました");
                }

                const data = await response.json();
                setAssignments(data.assignments);
                router.push(`/result/${data.id}`);
            } else {
                // ローカルモック
                const shuffledMembers = [...members].sort(() => Math.random() - 0.5);
                const newAssignments = seats.slice(0, shuffledMembers.length).map((seat, i) => ({
                    seatId: seat.id,
                    memberId: shuffledMembers[i].id,
                }));
                setAssignments(newAssignments);

                const resultId = uuidv4();
                localStorage.setItem(
                    `seatcraft-result-${resultId}`,
                    JSON.stringify({
                        id: resultId,
                        members,
                        settings: getSettings(),
                        assignments: newAssignments,
                        constraints,
                        createdAt: new Date().toISOString(),
                    })
                );
                router.push(`/result/${resultId}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsProcessing(false);
        }
    };

    // シャッフルせずに現在の配置で保存
    const handleConfirm = async () => {
        if (assignments.length === 0) {
            setError("座席に人を配置してください");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

            if (apiUrl) {
                const response = await fetch(`${apiUrl}/save`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        members,
                        settings: getSettings(),
                        assignments,
                        constraints,
                    }),
                });

                if (!response.ok) {
                    throw new Error("保存に失敗しました");
                }

                const data = await response.json();
                router.push(`/result/${data.id}`);
            } else {
                // ローカル保存
                const resultId = uuidv4();
                localStorage.setItem(
                    `seatcraft-result-${resultId}`,
                    JSON.stringify({
                        id: resultId,
                        members,
                        settings: getSettings(),
                        assignments,
                        constraints,
                        createdAt: new Date().toISOString(),
                    })
                );
                router.push(`/result/${resultId}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Toolbar */}
            <div className="bg-[var(--card-bg)] border-b border-[var(--border)] p-2 sm:p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Top row */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link href="/layouts/templates" className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-4">
                                ← 戻る
                            </Link>
                            <span className="text-xs sm:text-sm text-[var(--text-muted)] hidden sm:inline">
                                座席: {seats.length} | 配置済み: {assignments.length} / {members.length}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowOptions(!showOptions)}
                                className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-4"
                            >
                                ⚙ 設定
                            </button>
                            <button
                                onClick={resetViewport}
                                className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-4"
                            >
                                リセット
                            </button>
                        </div>
                    </div>

                    {/* Options panel */}
                    {showOptions && (
                        <div className="mt-3 p-3 bg-[var(--secondary)] rounded-lg animate-fade-in">
                            <label className="block text-xs sm:text-sm font-medium mb-2">
                                男女配置ルール
                            </label>
                            <select
                                value={genderMode}
                                onChange={(e) => setGenderMode(e.target.value as GenderMode)}
                                className="input text-sm w-full sm:w-auto"
                            >
                                {GENDER_MODES.map((mode) => (
                                    <option key={mode.value} value={mode.value}>
                                        {mode.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Mobile stats */}
                    <div className="mt-2 text-xs text-[var(--text-muted)] sm:hidden">
                        座席: {seats.length} | 配置済み: {assignments.length} / {members.length}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 flex flex-wrap gap-2 justify-end">
                        <button
                            onClick={handleConfirm}
                            disabled={isProcessing || assignments.length === 0}
                            className="btn btn-secondary text-xs sm:text-sm flex-1 sm:flex-none"
                        >
                            ✓ この配置で決定
                        </button>
                        <button
                            onClick={handleShuffle}
                            disabled={isProcessing || members.length === 0}
                            className="btn btn-primary text-xs sm:text-sm flex-1 sm:flex-none"
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    処理中...
                                </>
                            ) : (
                                "🔀 シャッフル"
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-[var(--danger)] rounded text-xs sm:text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-hidden">
                <Canvas />
            </div>
        </div>
    );
}
