"use client";

import type { Member } from "../types";
import { getGenderLabel } from "../types";
import { Button } from "@/shared/components/ui/Button";
import { Edit2, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberListProps {
    members: Member[];
    onEdit?: (member: Member) => void;
    onRemove?: (id: string) => void;
}

export function MemberList({ members, onEdit, onRemove }: MemberListProps) {
    if (members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
                <div className="bg-secondary rounded-full p-4 mb-4">
                    <Users className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="font-medium">メンバーがいません</p>
                <p className="text-xs mt-1">フォームから追加してください</p>
            </div>
        );
    }

    const getGenderStyle = (gender: Member["gender"]) => {
        switch (gender) {
            case "male": return "bg-[var(--color-seat-male)] text-[#1e3a8a] border-[var(--color-seat-border)]";
            case "female": return "bg-[var(--color-seat-female)] text-[#831843] border-[var(--color-seat-border)]";
            default: return "bg-[var(--color-seat-default)] text-foreground border-[var(--color-seat-border)]";
        }
    };

    return (
        <div className="grid grid-cols-1 gap-2">
            {members.map((member, index) => (
                <div
                    key={member.id}
                    className="group bg-card flex items-center gap-3 p-3 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200"
                    style={{ animationDelay: `${index * 30}ms` }}
                >
                    {/* Avatar */}
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border",
                        getGenderStyle(member.gender)
                    )}>
                        {(member.nickname || member.name).charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm text-foreground truncate">{member.name}</h3>
                            {member.nickname && (
                                <span className="text-xs text-muted-foreground truncate">
                                    @{member.nickname}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-md font-medium border",
                                getGenderStyle(member.gender)
                            )}>
                                {getGenderLabel(member.gender)}
                            </span>
                            {member.tags.map((tag) => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(member)}
                                className="h-8 w-8 hover:bg-secondary"
                            >
                                <Edit2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        )}
                        {onRemove && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemove(member.id)}
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
