"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Canvas } from "@/features/canvas/components/Canvas";
import { useCanvasStore } from "@/features/canvas/hooks/use-canvas";
import { useMembersStore } from "@/features/members/hooks/use-members";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/shared/components/ui/Button";
import { Shuffle, Save, ArrowLeft, Settings, RotateCcw } from "lucide-react";

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

    const { seats, assignments, constraints, setAssignments, resetViewport, shuffleAssignments } = useCanvasStore();
    const members = useMembersStore((state) => state.members);

    const getSettings = () => ({
        templateType: useCanvasStore.getState().templateType || "custom",
        seats,
        canvasWidth: useCanvasStore.getState().canvasWidth,
        canvasHeight: useCanvasStore.getState().canvasHeight,
        gridSize: useCanvasStore.getState().gridSize,
    });

    // シャッフル（Canvas内のみ、遷移しない）
    const handleShuffle = () => {
        if (members.length === 0) {
            setError("メンバーを登録してください");
            return;
        }
        if (seats.length === 0) {
            setError("座席を配置してください");
            return;
        }

        setError(null);

        // Use the store's shuffleAssignments which respects locked seats
        const memberIds = members.map(m => m.id);
        shuffleAssignments(memberIds);
    };

    // 結果画面へ遷移（保存して遷移）
    const handleViewResults = async () => {
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
        <div className="h-[calc(100vh-4rem)] pt-16 flex flex-col">
            {/* Toolbar */}
            <div className="bg-background border-b border-border p-2 sm:p-4 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    {/* Top row */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/layouts/templates">
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    戻る
                                </Link>
                            </Button>
                            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                                座席: {seats.length} | 配置済み: {assignments.length} / {members.length}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowOptions(!showOptions)}
                            >
                                <Settings className="w-4 h-4 mr-1" />
                                設定
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetViewport}
                            >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                リセット
                            </Button>
                        </div>
                    </div>

                    {/* Options panel */}
                    {showOptions && (
                        <div className="mt-3 p-3 bg-secondary/50 rounded-lg animate-in fade-in slide-in-from-top-2">
                            <label className="block text-xs sm:text-sm font-medium mb-2">
                                男女配置ルール
                            </label>
                            <select
                                value={genderMode}
                                onChange={(e) => setGenderMode(e.target.value as GenderMode)}
                                className="flex h-9 w-full sm:w-auto rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    <div className="mt-2 text-xs text-muted-foreground sm:hidden">
                        座席: {seats.length} | 配置済み: {assignments.length} / {members.length}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 flex flex-wrap gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShuffle}
                            disabled={members.length === 0 || seats.length === 0}
                            className="flex-1 sm:flex-none"
                        >
                            <Shuffle className="w-4 h-4 mr-1" />
                            シャッフル
                        </Button>
                        <Button
                            onClick={handleViewResults}
                            disabled={isProcessing || assignments.length === 0}
                            size="sm"
                            className="flex-1 sm:flex-none"
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    処理中...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-1" />
                                    結果を見る
                                </>
                            )}
                        </Button>
                    </div>

                    {error && (
                        <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded text-xs sm:text-sm text-center">
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
