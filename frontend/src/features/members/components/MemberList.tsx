"use client";

import type { Member } from "../types";
import { getGenderLabel, getGenderColor } from "../types";

interface MemberListProps {
    members: Member[];
    onEdit?: (member: Member) => void;
    onRemove?: (id: string) => void;
}

export function MemberList({ members, onEdit, onRemove }: MemberListProps) {
    if (members.length === 0) {
        return (
            <div className="text-center py-12 text-[var(--text-muted)]">
                <div className="text-4xl mb-4">👥</div>
                <p>メンバーがまだ登録されていません</p>
                <p className="text-sm mt-1">左のフォームからメンバーを追加してください</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {members.map((member, index) => (
                <div
                    key={member.id}
                    className="card flex items-center gap-4 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-emerald-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {(member.nickname || member.name).charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{member.name}</h3>
                            {member.nickname && (
                                <span className="text-sm text-[var(--text-muted)]">
                                    ({member.nickname})
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`badge ${getGenderColor(member.gender)}`}>
                                {getGenderLabel(member.gender)}
                            </span>
                            {member.tags.map((tag) => (
                                <span key={tag} className="badge">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(member)}
                                className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
                                title="編集"
                            >
                                <svg
                                    className="w-5 h-5 text-[var(--text-muted)]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                            </button>
                        )}
                        {onRemove && (
                            <button
                                onClick={() => onRemove(member.id)}
                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="削除"
                            >
                                <svg
                                    className="w-5 h-5 text-[var(--danger)]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
