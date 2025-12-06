"use client";

import type { Member } from "@/features/members/types";
import { getGenderLabel } from "@/features/members/types";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/Button";
import { GripVertical, X } from "lucide-react";

interface MemberPanelProps {
    members: Member[];
    onDragStart: (memberId: string) => void;
    onDragEnd: () => void;
    isOpen: boolean;
    isMobile: boolean;
    onClose: () => void;
}

export function MemberPanel({ members, onDragStart, onDragEnd, isOpen, isMobile, onClose }: MemberPanelProps) {
    if (!isOpen) return null;

    // Matches DraggableSeat styling for consistency
    const getGenderStyle = (gender: Member["gender"]) => {
        switch (gender) {
            case "male": return "bg-[var(--color-seat-male)] text-[#1e3a8a] border-[var(--color-seat-border)]";
            case "female": return "bg-[var(--color-seat-female)] text-[#831843] border-[var(--color-seat-border)]";
            default: return "bg-[var(--color-seat-default)] text-foreground border-[var(--color-seat-border)]";
        }
    };

    return (
        <aside
            className={cn(
                "flex flex-col bg-background/95 backdrop-blur-sm border-r border-border transition-all duration-300 z-30",
                isMobile
                    ? "fixed bottom-0 left-0 right-0 top-auto h-[45vh] border-t border-r-0 rounded-t-2xl shadow-[var(--shadow-md)]"
                    : "w-72 relative h-full shadow-lg"
            )}
        >
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-foreground">未配置メンバー</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        残り {members.length} 人
                    </p>
                </div>
                {isMobile && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-secondary">
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                        <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                            <span className="text-xl">🎉</span>
                        </div>
                        <p className="text-sm font-medium">全員配置済み！</p>
                    </div>
                ) : (
                    members.map((member) => (
                        <div
                            key={member.id}
                            draggable
                            onDragStart={(e) => {
                                onDragStart(member.id);
                                // Optional: Set custom drag image here if needed
                            }}
                            onDragEnd={onDragEnd}
                            className={cn(
                                "group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-sm",
                                "bg-card hover:border-[var(--color-accent)]/50",
                                member.gender === 'male' ? "hover:bg-[var(--color-seat-male)]/50" :
                                    member.gender === 'female' ? "hover:bg-[var(--color-seat-female)]/50" :
                                        "hover:bg-secondary/50"
                            )}
                        >
                            <div className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none border",
                                getGenderStyle(member.gender)
                            )}>
                                {(member.nickname || member.name).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 select-none">
                                <p className="font-medium text-sm text-foreground truncate">
                                    {member.nickname || member.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                                        getGenderStyle(member.gender)
                                    )}>
                                        {getGenderLabel(member.gender)}
                                    </span>
                                </div>
                            </div>
                            <GripVertical className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}
