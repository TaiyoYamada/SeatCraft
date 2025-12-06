"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TemplateSelector } from "@/features/layouts/components/TemplateSelector";
import type { SeatTemplateType } from "@/features/layouts/types";
import { useCanvasStore } from "@/features/canvas/hooks/use-canvas";
import { useMembersStore } from "@/features/members/hooks/use-members";
import { generateSeatsFromTemplate, MAX_MEMBERS } from "@/features/layouts/utils/template-generators";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { ChevronRight, Users, Eye, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
    const router = useRouter();
    const [selectedTemplate, setSelectedTemplate] = useState<SeatTemplateType | null>(null);
    const [seatCount, setSeatCount] = useState(8);
    const [islandRows, setIslandRows] = useState(2);
    const [islandCols, setIslandCols] = useState(2);
    const members = useMembersStore((state) => state.members);
    const { setSeats, setTemplateType, canvasWidth, canvasHeight } = useCanvasStore();

    // Auto-update seat count if members exist and no manual override
    useEffect(() => {
        if (members.length > 0 && selectedTemplate !== "custom") {
            // Optional: auto-set seat count to member count rounded up to even?
            // setSeatCount(Math.max(members.length, 8));
        }
    }, [members.length, selectedTemplate]);

    const handleContinue = () => {
        if (!selectedTemplate) return;

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
        <div className="min-h-screen py-8 bg-secondary/30">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">テンプレート選択</h1>
                        <p className="text-muted-foreground">
                            ミーティングや飲み会のスタイルに合わせて配置を選んでください
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-sm text-right hidden sm:block">
                            <div className="font-medium">{members.length}名</div>
                            <div className="text-muted-foreground text-xs">登録済み</div>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/members">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                メンバー編集
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        <section>
                            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                                レイアウトタイプ
                            </h2>
                            <TemplateSelector
                                selected={selectedTemplate}
                                onSelect={setSelectedTemplate}
                            />
                        </section>

                        {/* Configuration Controls */}
                        {selectedTemplate && selectedTemplate !== "custom" && (
                            <section className="animate-in fade-in slide-in-from-top-4 duration-300">
                                <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                                    詳細設定
                                </h2>
                                <Card className="p-6">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label htmlFor="seatCount" className="text-sm font-medium">
                                                    座席数
                                                </label>
                                                <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                                                    {seatCount}席
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                id="seatCount"
                                                min={2}
                                                max={MAX_MEMBERS}
                                                value={seatCount}
                                                onChange={(e) => handleSeatCountChange(Number(e.target.value))}
                                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                            {members.length > seatCount && (
                                                <p className="text-xs text-destructive flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    メンバー数({members.length})が座席数より多いです
                                                </p>
                                            )}
                                        </div>

                                        {selectedTemplate === "island" && (
                                            <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-muted-foreground block text-center">
                                                        縦の席数
                                                    </label>
                                                    <div className="flex items-center justify-center gap-3">
                                                        <Button
                                                            variant="outline" size="sm"
                                                            onClick={() => setIslandRows(Math.max(1, islandRows - 1))}
                                                        >-</Button>
                                                        <span className="w-8 text-center font-medium">{islandRows}</span>
                                                        <Button
                                                            variant="outline" size="sm"
                                                            onClick={() => setIslandRows(Math.min(5, islandRows + 1))}
                                                        >+</Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-muted-foreground block text-center">
                                                        横の席数
                                                    </label>
                                                    <div className="flex items-center justify-center gap-3">
                                                        <Button
                                                            variant="outline" size="sm"
                                                            onClick={() => setIslandCols(Math.max(1, islandCols - 1))}
                                                        >-</Button>
                                                        <span className="w-8 text-center font-medium">{islandCols}</span>
                                                        <Button
                                                            variant="outline" size="sm"
                                                            onClick={() => setIslandCols(Math.min(5, islandCols + 1))}
                                                        >+</Button>
                                                    </div>
                                                </div>
                                                <p className="col-span-2 text-center text-xs text-muted-foreground">
                                                    1島あたり {islandRows * islandCols} 席 × 島の数を自動調整
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Preview & Action */}
                    <div className="space-y-6">
                        <div className="sticky top-24 space-y-4">
                            {selectedTemplate ? (
                                <Card className="p-6 border-primary/20 bg-primary/5">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 mx-auto bg-background rounded-full flex items-center justify-center shadow-sm">
                                            <Eye className="w-8 h-8 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">設定完了</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {selectedTemplate === "custom"
                                                    ? "自由に配置を作成します"
                                                    : `${seatCount}席のレイアウトを作成します`}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleContinue}
                                            size="lg"
                                            className="w-full shadow-lg hover:shadow-xl transition-all"
                                        >
                                            作成する <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <div className="h-full min-h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                    <p className="text-sm">レイアウトを選択してください</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
