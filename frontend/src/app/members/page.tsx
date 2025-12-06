"use client";

import Link from "next/link";
import { MemberForm } from "@/features/members/components/MemberForm";
import { MemberList } from "@/features/members/components/MemberList";
import { useMembersStore } from "@/features/members/hooks/use-members";

export default function MembersPage() {
    const { members, addMember, removeMember } = useMembersStore();

    return (
        <div className="min-h-screen pt-20 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">メンバー管理</h1>
                        <p className="text-[var(--text-muted)] mt-1">
                            参加者の情報を登録してください
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="badge badge-primary text-sm">
                            {members.length} 人
                        </span>
                        {members.length > 0 && (
                            <Link
                                href="/layouts/templates"
                                className="btn btn-primary"
                            >
                                次へ: テンプレート選択 →
                            </Link>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <h2 className="text-lg font-semibold mb-4">メンバー追加</h2>
                            <MemberForm onSubmit={addMember} />
                        </div>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2">
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">メンバー一覧</h2>
                                {members.length > 0 && (
                                    <button
                                        onClick={() => {
                                            if (confirm("全てのメンバーを削除しますか?")) {
                                                useMembersStore.getState().clearMembers();
                                            }
                                        }}
                                        className="text-sm text-[var(--danger)] hover:underline"
                                    >
                                        全削除
                                    </button>
                                )}
                            </div>
                            <MemberList
                                members={members}
                                onRemove={removeMember}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {members.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <StatCard
                            label="合計"
                            value={members.length}
                            suffix="人"
                        />
                        <StatCard
                            label="男性"
                            value={members.filter((m) => m.gender === "male").length}
                            suffix="人"
                        />
                        <StatCard
                            label="女性"
                            value={members.filter((m) => m.gender === "female").length}
                            suffix="人"
                        />
                        <StatCard
                            label="その他"
                            value={members.filter((m) => m.gender === "other").length}
                            suffix="人"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    suffix,
}: {
    label: string;
    value: number;
    suffix: string;
}) {
    return (
        <div className="card text-center">
            <div className="text-3xl font-bold text-[var(--primary)]">
                {value}
                <span className="text-lg font-normal text-[var(--text-muted)] ml-1">
                    {suffix}
                </span>
            </div>
            <div className="text-sm text-[var(--text-muted)] mt-1">{label}</div>
        </div>
    );
}
