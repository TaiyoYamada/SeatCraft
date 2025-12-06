"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useMembersStore } from "@/features/members/hooks/use-members";
import { useCanvasStore } from "../hooks/use-canvas";
import { DraggableSeat } from "./DraggableSeat";
import { MemberPanel } from "./MemberPanel";
import { snapToGrid } from "@/features/layouts/utils/template-generators";

export function Canvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null);

    const {
        canvasWidth,
        canvasHeight,
        gridSize,
        viewport,
        seats,
        assignments,
        setViewport,
        updateSeat,
        assignMemberToSeat,
        unassignSeat,
    } = useCanvasStore();

    const members = useMembersStore((state) => state.members);

    // マウスホイールでズーム
    const handleWheel = useCallback(
        (e: React.WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newZoom = Math.max(0.25, Math.min(2, viewport.zoom + delta));
            setViewport({ zoom: newZoom });
        },
        [viewport.zoom, setViewport]
    );

    // パン開始
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (e.button === 0 && e.target === canvasRef.current) {
                setIsPanning(true);
                setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
            }
        },
        [viewport.x, viewport.y]
    );

    // パン中
    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (isPanning) {
                setViewport({
                    x: e.clientX - panStart.x,
                    y: e.clientY - panStart.y,
                });
            }
        },
        [isPanning, panStart, setViewport]
    );

    // パン終了
    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    // 座席のドラッグ
    const handleSeatDrag = useCallback(
        (seatId: string, x: number, y: number) => {
            const snappedX = snapToGrid(x, gridSize);
            const snappedY = snapToGrid(y, gridSize);
            updateSeat(seatId, { position: { x: snappedX, y: snappedY } });
        },
        [gridSize, updateSeat]
    );

    // メンバーを座席にドロップ
    const handleMemberDrop = useCallback(
        (seatId: string) => {
            if (draggedMemberId) {
                assignMemberToSeat(seatId, draggedMemberId);
                setDraggedMemberId(null);
            }
        },
        [draggedMemberId, assignMemberToSeat]
    );

    // 割り当てられたメンバーを取得
    const getAssignedMember = useCallback(
        (seatId: string) => {
            const assignment = assignments.find((a) => a.seatId === seatId);
            if (!assignment) return null;
            return members.find((m) => m.id === assignment.memberId) ?? null;
        },
        [assignments, members]
    );

    // 未割り当てのメンバー
    const unassignedMembers = members.filter(
        (m) => !assignments.some((a) => a.memberId === m.id)
    );

    return (
        <div className="flex h-full">
            {/* Member Panel */}
            <MemberPanel
                members={unassignedMembers}
                onDragStart={setDraggedMemberId}
                onDragEnd={() => setDraggedMemberId(null)}
            />

            {/* Canvas */}
            <div
                className="flex-1 overflow-hidden bg-[var(--secondary)] relative"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Zoom indicator */}
                <div className="absolute top-4 right-4 z-10 bg-[var(--card-bg)] px-3 py-1 rounded-lg shadow text-sm">
                    {Math.round(viewport.zoom * 100)}%
                </div>

                {/* Canvas area */}
                <div
                    ref={canvasRef}
                    className="absolute cursor-grab"
                    style={{
                        width: canvasWidth,
                        height: canvasHeight,
                        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                        transformOrigin: "0 0",
                        background: `
              linear-gradient(to right, var(--border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border) 1px, transparent 1px)
            `,
                        backgroundSize: `${gridSize}px ${gridSize}px`,
                        backgroundColor: "var(--card-bg)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                    }}
                >
                    {/* Seats */}
                    {seats.map((seat) => (
                        <DraggableSeat
                            key={seat.id}
                            seat={seat}
                            assignedMember={getAssignedMember(seat.id)}
                            isDragOver={false}
                            onDrag={handleSeatDrag}
                            onDrop={() => handleMemberDrop(seat.id)}
                            onUnassign={() => unassignSeat(seat.id)}
                        />
                    ))}
                </div>

                {/* Instructions */}
                {seats.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center text-[var(--text-muted)]">
                            <p className="text-lg">座席がありません</p>
                            <p className="text-sm mt-1">テンプレートを選択するか、手動で追加してください</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
