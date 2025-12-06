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
        <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col">
            {/* Compact Toolbar */}
            <div className="bg-background border-b border-border p-2 sm:p-3 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    {/* Main toolbar row */}
                    <div className="flex items-center justify-between gap-2">
                        {/* Left: Back button */}
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3" asChild>
                                <Link href="/layouts/templates">
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline ml-1">戻る</span>
                                </Link>
                            </Button>
                            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="bg-secondary px-2 py-1 rounded">座席: {seats.length}</span>
                                <span className="bg-secondary px-2 py-1 rounded">配置: {assignments.length}/{members.length}</span>
                            </div>
                        </div>

                        {/* Right: Settings and Reset (Desktop) */}
                        <div className="hidden sm:flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowOptions(!showOptions)}>
                                <Settings className="w-4 h-4 mr-1" />
                                設定
                            </Button>
                            <Button variant="ghost" size="sm" onClick={resetViewport}>
                                <RotateCcw className="w-4 h-4 mr-1" />
                                リセット
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShuffle}
                                disabled={members.length === 0 || seats.length === 0}
                            >
                                <Shuffle className="w-4 h-4 mr-1" />
                                シャッフル
                            </Button>
                            <Button
                                onClick={handleViewResults}
                                disabled={isProcessing || assignments.length === 0}
                                size="sm"
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

                        {/* Right: Mobile icons */}
                        <div className="flex sm:hidden items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowOptions(!showOptions)}>
                                <Settings className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetViewport}>
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Mobile stats bar */}
                    <div className="flex sm:hidden items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="bg-secondary px-2 py-1 rounded-full">座席: {seats.length}</span>
                        <span className="bg-secondary px-2 py-1 rounded-full">配置: {assignments.length}/{members.length}</span>
                    </div>

                    {/* Options panel (collapsible) */}
                    {showOptions && (
                        <div className="mt-2 p-3 bg-secondary/50 rounded-lg animate-in fade-in slide-in-from-top-2">
                            <label className="block text-xs font-medium mb-2">男女配置ルール</label>
                            <select
                                value={genderMode}
                                onChange={(e) => setGenderMode(e.target.value as GenderMode)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            >
                                {GENDER_MODES.map((mode) => (
                                    <option key={mode.value} value={mode.value}>
                                        {mode.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded text-xs text-center">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-hidden relative">
                <Canvas />
            </div>

            {/* Mobile Bottom Action Bar */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur border-t border-border z-40">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 h-12"
                        onClick={handleShuffle}
                        disabled={members.length === 0 || seats.length === 0}
                    >
                        <Shuffle className="w-5 h-5 mr-2" />
                        シャッフル
                    </Button>
                    <Button
                        className="flex-1 h-12"
                        onClick={handleViewResults}
                        disabled={isProcessing || assignments.length === 0}
                    >
                        {isProcessing ? (
                            <>
                                <svg className="animate-spin mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                処理中...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                結果を見る
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
