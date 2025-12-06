"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/components/ui/Button";
import { Copy, Check, Edit, Home, AlertCircle } from "lucide-react";

interface LayoutResult {
    id: string;
    members: Array<{
        id: string;
        name: string;
        nickname?: string;
        gender: string;
        tags: string[];
    }>;
    settings: {
        seats: Array<{
            id: string;
            position: { x: number; y: number };
            size: { width: number; height: number };
            label?: string;
        }>;
        canvasWidth: number;
        canvasHeight: number;
    };
    assignments: Array<{
        seatId: string;
        memberId: string;
    }>;
    createdAt: string;
}

export default function ResultPage() {
    const params = useParams();
    const id = params.id as string;
    const [result, setResult] = useState<LayoutResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchResult = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            // API URL が設定されていない場合
            if (!apiUrl) {
                // ローカルストレージからのみ取得
                const stored = localStorage.getItem(`seatcraft-result-${id}`);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        console.log("Loaded from localStorage:", parsed);
                        setResult(parsed);
                    } catch {
                        setError("ローカルデータの解析に失敗しました");
                    }
                } else {
                    setError("API が設定されていません。ローカルデータも見つかりません。");
                }
                setLoading(false);
                return;
            }

            try {
                // API から取得
                const response = await fetch(`${apiUrl}/result/${id}`);

                if (response.ok) {
                    const data = await response.json();
                    if (data.layout) {
                        setResult(data.layout);
                    } else {
                        setError("レイアウトデータが不正です");
                    }
                } else if (response.status === 404) {
                    // API で見つからない場合、ローカルストレージを確認
                    const stored = localStorage.getItem(`seatcraft-result-${id}`);
                    if (stored) {
                        setResult(JSON.parse(stored));
                    } else {
                        setError("この ID の結果はサーバーに保存されていません");
                    }
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    setError(errorData.message || `サーバーエラー: ${response.status}`);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                // ネットワークエラーの場合、ローカルストレージを確認
                const stored = localStorage.getItem(`seatcraft-result-${id}`);
                if (stored) {
                    setResult(JSON.parse(stored));
                } else {
                    setError("ネットワークエラーが発生しました。接続を確認してください。");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [id]);

    const handleCopyUrl = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getMemberForSeat = (seatId: string) => {
        if (!result) return null;
        const assignment = result.assignments.find((a) => a.seatId === seatId);
        if (!assignment) return null;
        return result.members.find((m) => m.id === assignment.memberId);
    };

    const getGenderColor = (gender: string) => {
        switch (gender) {
            case "male": return "bg-[var(--color-seat-male)] text-[#1e3a8a] border-blue-200";
            case "female": return "bg-[var(--color-seat-female)] text-[#831843] border-pink-200";
            default: return "bg-secondary text-foreground border-border";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)]">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full mx-auto" />
                    <p className="mt-4 text-muted-foreground">読み込み中...</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg-secondary)]">
                <div className="text-center max-w-md bg-background p-8 rounded-2xl shadow-lg border border-border">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">結果が見つかりません</h1>
                    <p className="text-muted-foreground mb-4 text-sm">{error}</p>
                    <p className="text-xs text-muted-foreground mb-6 font-mono">
                        ID: {id}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button asChild>
                            <Link href="/">
                                <Home className="w-4 h-4 mr-2" />
                                トップへ戻る
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/craft">
                                <Edit className="w-4 h-4 mr-2" />
                                新しく作成
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate scale for responsive display
    const maxDisplayWidth = 800;
    const scale = Math.min(1, maxDisplayWidth / result.settings.canvasWidth);

    return (
        <div className="min-h-screen pt-24 pb-4 sm:pb-8 bg-[var(--color-bg-secondary)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">席配置結果</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {new Date(result.createdAt).toLocaleString("ja-JP")}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyUrl}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-1" />
                                    コピー済み
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-1" />
                                    URLをコピー
                                </>
                            )}
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/craft">
                                <Edit className="w-4 h-4 mr-1" />
                                編集する
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Layout Preview */}
                <div className="bg-background rounded-2xl border border-border shadow-lg p-6 mb-6 sm:mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-foreground">レイアウト</h2>

                    {/* Debug info */}
                    {(!result.settings.seats || result.settings.seats.length === 0) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-yellow-800 text-sm">
                            座席データがありません。席が保存されていない可能性があります。
                        </div>
                    )}

                    <div
                        className="relative mx-auto rounded-xl bg-[var(--color-bg-secondary)] overflow-hidden border border-border"
                        style={{
                            width: "100%",
                            maxWidth: maxDisplayWidth,
                            aspectRatio: `${result.settings.canvasWidth} / ${result.settings.canvasHeight}`,
                        }}
                    >
                        <div
                            className="absolute inset-0 origin-top-left"
                            style={{
                                transform: `scale(${scale})`,
                                width: result.settings.canvasWidth,
                                height: result.settings.canvasHeight,
                            }}
                        >
                            {result.settings.seats && result.settings.seats.map((seat) => {
                                const member = getMemberForSeat(seat.id);
                                return (
                                    <div
                                        key={seat.id}
                                        className={`absolute rounded-xl flex items-center justify-center border-2 shadow-sm ${member
                                            ? getGenderColor(member.gender)
                                            : "bg-background border-dashed border-border"
                                            }`}
                                        style={{
                                            left: seat.position.x,
                                            top: seat.position.y,
                                            width: seat.size.width,
                                            height: seat.size.height,
                                        }}
                                    >
                                        <span className="text-xs sm:text-sm font-medium text-center px-1 truncate">
                                            {member ? member.nickname || member.name : seat.label || "空"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Member List */}
                <div className="bg-background rounded-2xl border border-border shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 text-foreground">配置一覧</h2>

                    {result.assignments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            配置されたメンバーがいません
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {result.assignments.map((assignment) => {
                                const member = result.members.find((m) => m.id === assignment.memberId);
                                const seat = result.settings.seats?.find((s) => s.id === assignment.seatId);
                                if (!member || !seat) return null;

                                return (
                                    <div
                                        key={assignment.seatId}
                                        className={`p-3 sm:p-4 rounded-xl border ${getGenderColor(member.gender)}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[var(--color-accent)] text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-sm">
                                                {seat.label}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate">{member.name}</p>
                                                {member.nickname && (
                                                    <p className="text-xs sm:text-sm opacity-70 truncate">
                                                        {member.nickname}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
