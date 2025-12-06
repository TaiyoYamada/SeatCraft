"use client";

import { useCallback, useState } from "react";
import type { Seat } from "@/features/layouts/types";
import type { Member } from "@/features/members/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, Lock, Unlock } from "lucide-react";

interface DraggableSeatProps {
    seat: Seat;
    assignedMember: Member | null;
    isDragOver: boolean;
    onDrag: (seatId: string, x: number, y: number) => void;
    onDrop: () => void;
    onUnassign: () => void;
    onToggleLock: () => void;
    zoom: number;
}

export function DraggableSeat({
    seat,
    assignedMember,
    isDragOver,
    onDrag,
    onDrop,
    onUnassign,
    onToggleLock,
    zoom,
}: DraggableSeatProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [showMenu, setShowMenu] = useState(false);

    // Calculate precise initial offset for smooth dragging start
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            // Don't start drag if seat is locked
            if (seat.isLocked) return;

            e.stopPropagation();
            e.preventDefault();
            setIsDragging(true);
            setDragOffset({
                x: e.clientX / zoom - seat.position.x,
                y: e.clientY / zoom - seat.position.y,
            });

            // Add document-level event listeners for smooth dragging
            const handleDocumentMouseMove = (moveEvent: MouseEvent) => {
                moveEvent.preventDefault();
                moveEvent.stopPropagation();
                const newX = moveEvent.clientX / zoom - (e.clientX / zoom - seat.position.x);
                const newY = moveEvent.clientY / zoom - (e.clientY / zoom - seat.position.y);
                onDrag(seat.id, newX, newY);
            };

            const handleDocumentMouseUp = () => {
                setIsDragging(false);
                document.removeEventListener('mousemove', handleDocumentMouseMove);
                document.removeEventListener('mouseup', handleDocumentMouseUp);
            };

            document.addEventListener('mousemove', handleDocumentMouseMove);
            document.addEventListener('mouseup', handleDocumentMouseUp);
        },
        [seat.position, seat.isLocked, seat.id, zoom, onDrag]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            // This is now handled at document level, keep for safety
            if (isDragging && !seat.isLocked) {
                e.preventDefault();
                e.stopPropagation();
            }
        },
        [isDragging, seat.isLocked]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

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

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setShowMenu(!showMenu);
    }, [showMenu]);

    // Dynamic style for gender colors strictly following the official theme
    const getGenderStyle = (gender: Member["gender"]) => {
        switch (gender) {
            case "male": return "bg-[var(--color-seat-male)] text-[#1e3a8a]";
            case "female": return "bg-[var(--color-seat-female)] text-[#831843]";
            default: return "bg-[var(--color-seat-default)] text-foreground";
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: 1,
                scale: isDragging ? 1.03 : 1, // Slight lift
                boxShadow: isDragging ? "var(--shadow-md)" : "var(--shadow-sm)",
                zIndex: isDragging ? 50 : 1,
            }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 30
            }}
            className={cn(
                "absolute rounded-lg select-none",
                seat.isLocked ? "cursor-default" : "cursor-move",
                assignedMember ? "border" : "border border-dashed bg-background/50 hover:bg-secondary/30",
                isDragOver && "ring-2 ring-primary ring-offset-2",
                seat.isLocked && "border-2 border-[var(--color-accent)]/50"
            )}
            style={{
                left: seat.position.x,
                top: seat.position.y,
                width: seat.size.width,
                height: seat.size.height,
                borderColor: seat.isLocked ? 'var(--color-accent)' : 'var(--color-seat-border)',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { handleMouseUp(); setShowMenu(false); }}
            onDragOver={handleDragOver}
            onDrop={handleDropEvent}
            onContextMenu={handleContextMenu}
            onClick={() => !isDragging && setShowMenu(!showMenu)}
        >
            <div className={cn(
                "w-full h-full flex flex-col items-center justify-center p-1 rounded-lg overflow-hidden relative transition-colors duration-200 border border-[var(--color-seat-border)]",
                assignedMember && getGenderStyle(assignedMember.gender)
            )}>
                {/* Lock indicator */}
                {seat.isLocked && (
                    <div className="absolute top-1 left-1 text-[var(--color-accent)]">
                        <Lock className="w-3 h-3" />
                    </div>
                )}

                {assignedMember ? (
                    <>
                        <span className="font-bold text-center text-sm truncate w-full px-1 leading-tight tracking-tight">
                            {assignedMember.nickname || assignedMember.name}
                        </span>

                        <div className="mt-0.5 text-[10px] opacity-60 font-mono">
                            {seat.label}
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUnassign();
                            }}
                            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/40 transition-colors"
                        >
                            <X className="w-2.5 h-2.5" />
                        </button>
                    </>
                ) : (
                    <span className="text-muted-foreground/40 text-xs font-medium font-mono">
                        {seat.label}
                    </span>
                )}
            </div>

            {/* Context Menu */}
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background border border-border rounded-lg shadow-lg p-1 z-50 flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleLock();
                                setShowMenu(false);
                            }}
                            className={cn(
                                "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                                seat.isLocked
                                    ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20"
                                    : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                            )}
                        >
                            {seat.isLocked ? (
                                <>
                                    <Unlock className="w-3 h-3" /> 解除
                                </>
                            ) : (
                                <>
                                    <Lock className="w-3 h-3" /> 固定
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
