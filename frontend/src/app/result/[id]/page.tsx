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
            try {
                // APIから取得を試みる
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;

                if (apiUrl) {
                    const response = await fetch(`${apiUrl}/result/${id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setResult(data.layout);
                        return;
                    }
                }

                // ローカルストレージから取得
                const stored = localStorage.getItem(`seatcraft-result-${id}`);
                if (stored) {
                    setResult(JSON.parse(stored));
                } else {
                    setError("結果が見つかりませんでした");
                }
            } catch (err) {
                setError("結果の取得に失敗しました");
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😢</div>
                    <h1 className="text-2xl font-bold mb-2">結果が見つかりません</h1>
                    <p className="text-[var(--text-muted)] mb-6">{error}</p>
                    <Link href="/" className="btn btn-primary">
                        トップへ戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">席配置結果</h1>
                        <p className="text-[var(--text-muted)] mt-1">
                            {new Date(result.createdAt).toLocaleString("ja-JP")}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCopyUrl}
                            className="btn btn-secondary"
                        >
                            {copied ? "✓ コピー済み" : "🔗 URLをコピー"}
                        </button>
                        <Link href="/craft" className="btn btn-primary">
                            編集する
                        </Link>
                    </div>
                </div>

                {/* Layout Preview */}
                <div className="card mb-8">
                    <h2 className="text-lg font-semibold mb-4">レイアウト</h2>
                    <div
                        className="relative mx-auto rounded-lg bg-[var(--secondary)] overflow-hidden"
                        style={{
                            width: "100%",
                            maxWidth: result.settings.canvasWidth,
                            height: result.settings.canvasHeight * 0.5,
                        }}
                    >
                        <div
                            className="absolute inset-0"
                            style={{
                                transform: "scale(0.5)",
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
                                        <span className="text-sm font-medium text-center px-1 truncate">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {result.assignments.map((assignment) => {
                            const member = result.members.find((m) => m.id === assignment.memberId);
                            const seat = result.settings.seats.find((s) => s.id === assignment.seatId);
                            if (!member || !seat) return null;

                            return (
                                <div key={assignment.seatId} className="p-4 rounded-lg bg-[var(--secondary)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                                            {seat.label}
                                        </div>
                                        <div>
                                            <p className="font-medium">{member.name}</p>
                                            {member.nickname && (
                                                <p className="text-sm text-[var(--text-muted)]">
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
