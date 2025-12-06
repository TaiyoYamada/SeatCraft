"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useMembersStore } from "@/features/members/hooks/use-members";
import { useCanvasStore } from "../hooks/use-canvas";
import { DraggableSeat } from "./DraggableSeat";
import { MemberPanel } from "./MemberPanel";
import { snapToGrid } from "@/features/layouts/utils/template-generators";
import { useGesture } from "@use-gesture/react";
import { Button } from "@/shared/components/ui/Button";
import { ZoomIn, ZoomOut, Plus, Minus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export function Canvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null);
    const [showMemberPanel, setShowMemberPanel] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    const {
        canvasWidth,
        canvasHeight,
        gridSize,
        viewport,
        seats,
        assignments,
        templateType,
        setViewport,
        updateSeat,
        assignMemberToSeat,
        unassignSeat,
        toggleSeatLock,
        addNewSeat,
        removeLastSeat,
    } = useCanvasStore();

    const members = useMembersStore((state) => state.members);

    // Responsive detection
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setShowMemberPanel(false);
            }
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Gesture handling (Zoom only - no pan)
    useGesture(
        {
            onWheel: ({ delta: [, dy], metaKey, ctrlKey }) => {
                // If ctrl/meta is pressed, treat as zoom (standard trackpad behavior)
                if (metaKey || ctrlKey) {
                    const newZoom = Math.max(0.25, Math.min(2, viewport.zoom - dy * 0.01));
                    setViewport({ zoom: newZoom });
                }
                // Removed: pan on scroll
            },
            onPinch: ({ offset: [z] }) => {
                setViewport({ zoom: z });
            },
        },
        {
            target: containerRef,
            pinch: {
                scaleBounds: { min: 0.25, max: 2 },
                modifierKey: null,
            },
            wheel: {
                // Prevent default scrolling behavior for smoother canvas control
                eventOptions: { passive: false }
            }
        }
    );

    // Handlers
    const handleSeatDrag = useCallback(
        (seatId: string, x: number, y: number) => {
            const snappedX = snapToGrid(x, gridSize);
            const snappedY = snapToGrid(y, gridSize);
            updateSeat(seatId, { position: { x: snappedX, y: snappedY } });
        },
        [gridSize, updateSeat]
    );

    const handleMemberDrop = useCallback(
        (seatId: string) => {
            if (draggedMemberId) {
                assignMemberToSeat(seatId, draggedMemberId);
                setDraggedMemberId(null);
            }
        },
        [draggedMemberId, assignMemberToSeat]
    );

    const getAssignedMember = useCallback(
        (seatId: string) => {
            const assignment = assignments.find((a) => a.seatId === seatId);
            if (!assignment) return null;
            return members.find((m) => m.id === assignment.memberId) ?? null;
        },
        [assignments, members]
    );

    const unassignedMembers = members.filter(
        (m) => !assignments.some((a) => a.memberId === m.id)
    );

    const isCustomMode = templateType === "custom";

    return (
        <div className="flex h-full relative overflow-hidden bg-background">
            {/* Toggle Member Panel (Mobile) */}
            {isMobile && (
                <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-4 left-4 z-20 shadow-md"
                    onClick={() => setShowMemberPanel(!showMemberPanel)}
                >
                    {showMemberPanel ? "閉じる" : `未配置 (${unassignedMembers.length})`}
                </Button>
            )}

            {/* Member Panel */}
            <MemberPanel
                members={unassignedMembers}
                onDragStart={setDraggedMemberId}
                onDragEnd={() => setDraggedMemberId(null)}
                isOpen={showMemberPanel}
                isMobile={isMobile}
                onClose={() => setShowMemberPanel(false)}
            />

            {/* Canvas Area */}
            <div
                ref={containerRef}
                className="flex-1 relative touch-none overflow-hidden cursor-move"
                style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    backgroundImage: `radial-gradient(var(--color-seat-border) 1px, transparent 1px)`,
                    backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
                    backgroundPosition: `${viewport.x}px ${viewport.y}px`,
                }}
            >
                {/* Top Controls: Add/Remove Seats (for Custom mode) */}
                {isCustomMode && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-background/90 backdrop-blur rounded-lg shadow-md border border-border p-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={removeLastSeat}
                            disabled={seats.length <= 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-mono w-10 text-center">{seats.length}</span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={addNewSeat}
                            disabled={seats.length >= 50}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Pan Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-background/90 backdrop-blur rounded-lg shadow-sm border border-border p-1">
                        <div className="grid grid-cols-3 gap-0.5">
                            <div />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewport({ y: viewport.y + 50 })}
                            >
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                            <div />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewport({ x: viewport.x + 50 })}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="w-8 h-8" />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewport({ x: viewport.x - 50 })}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <div />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewport({ y: viewport.y - 50 })}
                            >
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                            <div />
                        </div>
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
                    <div className="bg-background/90 backdrop-blur rounded-lg shadow-sm border border-border p-1 flex flex-col gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewport({ zoom: Math.min(2, viewport.zoom + 0.1) })}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <div className="h-px bg-border w-full" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewport({ zoom: Math.max(0.25, viewport.zoom - 0.1) })}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="bg-background/90 backdrop-blur rounded-lg shadow-sm border border-border px-2 py-1 text-xs font-mono text-center">
                        {Math.round(viewport.zoom * 100)}%
                    </div>
                </div>

                {/* Content Layer */}
                <div
                    ref={canvasRef}
                    className="absolute origin-top-left"
                    style={{
                        width: canvasWidth,
                        height: canvasHeight,
                        transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.zoom})`,
                        boxShadow: `0 0 0 1px var(--color-border)`,
                        background: 'var(--color-bg)',
                        borderRadius: '24px'
                    }}
                >
                    <AnimatePresence>
                        {seats.map((seat) => (
                            <DraggableSeat
                                key={seat.id}
                                seat={seat}
                                assignedMember={getAssignedMember(seat.id)}
                                isDragOver={false}
                                onDrag={handleSeatDrag}
                                onDrop={() => handleMemberDrop(seat.id)}
                                onUnassign={() => unassignSeat(seat.id)}
                                onToggleLock={() => toggleSeatLock(seat.id)}
                                zoom={viewport.zoom}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {seats.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center text-muted-foreground bg-background/50 px-6 py-4 rounded-xl backdrop-blur-sm">
                            <p className="text-lg font-medium text-foreground">座席がありません</p>
                            <p className="text-sm mt-1">
                                {isCustomMode ? (
                                    <>上部の「+」ボタンで席を追加してください</>
                                ) : (
                                    <>テンプレートから配置を選択するか、<br />座席を追加してください</>
                                )}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Disable default pinch zoom behavior on the document to allow canvas zoom
if (typeof document !== 'undefined') {
    document.addEventListener('gesturestart', (e) => e.preventDefault());
}
