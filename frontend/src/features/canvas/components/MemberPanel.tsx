"use client";

import type { Member } from "@/features/members/types";
import { getGenderLabel, getGenderColor } from "@/features/members/types";

interface MemberPanelProps {
    members: Member[];
    onDragStart: (memberId: string) => void;
    onDragEnd: () => void;
}

export function MemberPanel({ members, onDragStart, onDragEnd }: MemberPanelProps) {
    return (
        <div className="w-64 bg-[var(--card-bg)] border-r border-[var(--border)] flex flex-col">
            <div className="p-4 border-b border-[var(--border)]">
                <h3 className="font-semibold">未配置メンバー</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                    {members.length} 人
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {members.length === 0 ? (
                    <div className="text-center text-[var(--text-muted)] py-8 text-sm">
                        <p>全員配置済み！</p>
                    </div>
                ) : (
                    members.map((member) => (
                        <div
                            key={member.id}
                            draggable
                            onDragStart={() => onDragStart(member.id)}
                            onDragEnd={onDragEnd}
                            className="p-3 rounded-lg bg-[var(--secondary)] cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-emerald-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                    {(member.nickname || member.name).charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                        {member.nickname || member.name}
                                    </p>
                                    <span className={`badge ${getGenderColor(member.gender)} text-xs`}>
                                        {getGenderLabel(member.gender)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
