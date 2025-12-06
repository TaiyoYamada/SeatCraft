"use client";

import { useCallback, useRef, useState } from "react";
import type { Seat } from "@/features/layouts/types";
import type { Member } from "@/features/members/types";
import { getGenderColor } from "@/features/members/types";

interface DraggableSeatProps {
    seat: Seat;
    assignedMember: Member | null;
    isDragOver: boolean;
    onDrag: (seatId: string, x: number, y: number) => void;
    onDrop: () => void;
    onUnassign: () => void;
}

export function DraggableSeat({
    seat,
    assignedMember,
    isDragOver,
    onDrag,
    onDrop,
    onUnassign,
}: DraggableSeatProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const seatRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - seat.position.x,
                y: e.clientY - seat.position.y,
            });
        },
        [seat.position]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (isDragging) {
                e.stopPropagation();
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;
                onDrag(seat.id, newX, newY);
            }
        },
        [isDragging, dragOffset, onDrag, seat.id]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // ドロップターゲットとして
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }, []);

    const handleDropEvent = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            onDrop();
        },
        [onDrop]
    );

    return (
        <div
            ref={seatRef}
            className={`absolute rounded-xl transition-shadow cursor-move select-none ${isDragging ? "shadow-2xl z-50" : "shadow-md hover:shadow-lg"
                } ${isDragOver ? "ring-2 ring-[var(--primary)]" : ""}`}
            style={{
                left: seat.position.x,
                top: seat.position.y,
                width: seat.size.width,
                height: seat.size.height,
                backgroundColor: assignedMember ? "var(--primary)" : "var(--card-bg)",
                border: assignedMember ? "none" : "2px dashed var(--border)",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDragOver={handleDragOver}
            onDrop={handleDropEvent}
        >
            <div className="w-full h-full flex flex-col items-center justify-center p-2">
                {assignedMember ? (
                    <>
                        <span className="text-white font-bold text-center text-sm truncate w-full">
                            {assignedMember.nickname || assignedMember.name}
                        </span>
                        <span className={`badge ${getGenderColor(assignedMember.gender)} text-xs mt-1`}>
                            {seat.label}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUnassign();
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-xs"
                        >
                            ×
                        </button>
                    </>
                ) : (
                    <span className="text-[var(--text-muted)] text-sm font-medium">
                        {seat.label || "空席"}
                    </span>
                )}
            </div>
        </div>
    );
}
