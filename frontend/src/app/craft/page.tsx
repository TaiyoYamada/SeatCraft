"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Canvas } from "@/features/canvas/components/Canvas";
import { useCanvasStore } from "@/features/canvas/hooks/use-canvas";
import { useMembersStore } from "@/features/members/hooks/use-members";
import { v4 as uuidv4 } from "uuid";

export default function CraftPage() {
    const router = useRouter();
    const [isShuffling, setIsShuffling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { seats, assignments, constraints, setAssignments, resetViewport } = useCanvasStore();
    const members = useMembersStore((state) => state.members);

    const handleShuffle = async () => {
        if (members.length === 0) {
            setError("メンバーを登録してください");
            return;
        }
        if (seats.length === 0) {
            setError("座席を配置してください");
            return;
        }

        setIsShuffling(true);
        setError(null);

        try {
            // API呼び出し（ローカル開発時はモック）
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

            if (apiUrl) {
                const response = await fetch(`${apiUrl}/shuffle`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        members,
                        settings: {
                            templateType: useCanvasStore.getState().templateType || "custom",
                            seats,
                            canvasWidth: useCanvasStore.getState().canvasWidth,
                            canvasHeight: useCanvasStore.getState().canvasHeight,
                            gridSize: useCanvasStore.getState().gridSize,
                        },
                        constraints: constraints.filter((c) => c.enabled),
                    }),
                });

                if (!response.ok) {
                    throw new Error("シャッフルに失敗しました");
                }

                const data = await response.json();
                setAssignments(data.assignments);
                router.push(`/result/${data.id}`);
            } else {
                // ローカルモック: ランダム配置
                const shuffledMembers = [...members].sort(() => Math.random() - 0.5);
                const newAssignments = seats.slice(0, shuffledMembers.length).map((seat, i) => ({
                    seatId: seat.id,
                    memberId: shuffledMembers[i].id,
                }));
                setAssignments(newAssignments);

                // ローカルストレージに保存してリダイレクト
                const resultId = uuidv4();
                localStorage.setItem(
                    `seatcraft-result-${resultId}`,
                    JSON.stringify({
                        id: resultId,
                        members,
                        settings: {
                            templateType: useCanvasStore.getState().templateType || "custom",
                            seats,
                            canvasWidth: useCanvasStore.getState().canvasWidth,
                            canvasHeight: useCanvasStore.getState().canvasHeight,
                            gridSize: useCanvasStore.getState().gridSize,
                        },
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
            setIsShuffling(false);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Toolbar */}
            <div className="bg-[var(--card-bg)] border-b border-[var(--border)] p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/layouts/templates" className="btn btn-secondary">
                            ← テンプレート
                        </Link>
                        <div className="h-6 w-px bg-[var(--border)]" />
                        <span className="text-sm text-[var(--text-muted)]">
                            座席: {seats.length} | 配置済み: {assignments.length} / {members.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={resetViewport}
                            className="btn btn-secondary text-sm"
                        >
                            リセット
                        </button>
                        <button
                            onClick={handleShuffle}
                            disabled={isShuffling || members.length === 0}
                            className="btn btn-primary"
                        >
                            {isShuffling ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    シャッフル中...
                                </>
                            ) : (
                                "🔀 シャッフル"
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-[var(--danger)] rounded text-sm text-center">
                        {error}
                    </div>
                )}
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-hidden">
                <Canvas />
            </div>
        </div>
    );
}
