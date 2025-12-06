"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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
                        setResult(JSON.parse(stored));
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto" />
                    <p className="mt-4 text-[var(--text-muted)]">読み込み中...</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">😢</div>
                    <h1 className="text-xl sm:text-2xl font-bold mb-2">結果が見つかりません</h1>
                    <p className="text-[var(--text-muted)] mb-4 text-sm">{error}</p>
                    <p className="text-xs text-[var(--text-muted)] mb-6">
                        ID: {id}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Link href="/" className="btn btn-primary">
                            トップへ戻る
                        </Link>
                        <Link href="/craft" className="btn btn-secondary">
                            新しく作成
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-4 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">席配置結果</h1>
                        <p className="text-[var(--text-muted)] mt-1 text-sm">
                            {new Date(result.createdAt).toLocaleString("ja-JP")}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={handleCopyUrl}
                            className="btn btn-secondary text-sm"
                        >
                            {copied ? "✓ コピー済み" : "🔗 URLをコピー"}
                        </button>
                        <Link href="/craft" className="btn btn-primary text-sm">
                            編集する
                        </Link>
                    </div>
                </div>

                {/* Layout Preview */}
                <div className="card mb-6 sm:mb-8">
                    <h2 className="text-lg font-semibold mb-4">レイアウト</h2>
                    <div
                        className="relative mx-auto rounded-lg bg-[var(--secondary)] overflow-hidden"
                        style={{
                            width: "100%",
                            maxWidth: Math.min(result.settings.canvasWidth, 800),
                            aspectRatio: `${result.settings.canvasWidth} / ${result.settings.canvasHeight}`,
                        }}
                    >
                        <div
                            className="absolute inset-0"
                            style={{
                                transform: `scale(${Math.min(800 / result.settings.canvasWidth, 1)})`,
                                transformOrigin: "0 0",
                            }}
                        >
                            {result.settings.seats.map((seat) => {
                                const member = getMemberForSeat(seat.id);
                                return (
                                    <div
                                        key={seat.id}
                                        className={`absolute rounded-xl flex items-center justify-center ${member
                                            ? "bg-[var(--primary)] text-white"
                                            : "bg-[var(--card-bg)] border-2 border-dashed border-[var(--border)]"
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
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">配置一覧</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {result.assignments.map((assignment) => {
                            const member = result.members.find((m) => m.id === assignment.memberId);
                            const seat = result.settings.seats.find((s) => s.id === assignment.seatId);
                            if (!member || !seat) return null;

                            return (
                                <div key={assignment.seatId} className="p-3 sm:p-4 rounded-lg bg-[var(--secondary)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm sm:text-base">
                                            {seat.label}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium truncate">{member.name}</p>
                                            {member.nickname && (
                                                <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">
                                                    {member.nickname}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
