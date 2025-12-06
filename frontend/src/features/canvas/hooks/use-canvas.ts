import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Seat, SeatTemplateType } from '@/features/layouts/types';
import type { SeatAssignment, CanvasViewport, ConstraintType } from '../types';

interface CanvasState {
    // Canvas settings
    canvasWidth: number;
    canvasHeight: number;
    gridSize: number;

    // Viewport
    viewport: CanvasViewport;

    // Template & Seats
    templateType: SeatTemplateType | null;
    seats: Seat[];

    // Assignments
    assignments: SeatAssignment[];

    // Constraints
    constraints: ConstraintType[];

    // Actions
    setViewport: (viewport: Partial<CanvasViewport>) => void;
    resetViewport: () => void;
    setTemplateType: (type: SeatTemplateType) => void;
    setSeats: (seats: Seat[]) => void;
    updateSeat: (id: string, updates: Partial<Seat>) => void;
    addSeat: (seat: Seat) => void;
    removeSeat: (id: string) => void;
    setAssignments: (assignments: SeatAssignment[]) => void;
    assignMemberToSeat: (seatId: string, memberId: string) => void;
    unassignSeat: (seatId: string) => void;
    addConstraint: (constraint: ConstraintType) => void;
    updateConstraint: (id: string, updates: Partial<ConstraintType>) => void;
    removeConstraint: (id: string) => void;
    clearCanvas: () => void;
}

const DEFAULT_VIEWPORT: CanvasViewport = {
    x: 0,
    y: 0,
    zoom: 1,
};

export const useCanvasStore = create<CanvasState>()(
    persist(
        (set) => ({
            canvasWidth: 1200,
            canvasHeight: 800,
            gridSize: 20,
            viewport: DEFAULT_VIEWPORT,
            templateType: null,
            seats: [],
            assignments: [],
            constraints: [],

            setViewport: (updates) => {
                set((state) => ({
                    viewport: { ...state.viewport, ...updates },
                }));
            },

            resetViewport: () => {
                set({ viewport: DEFAULT_VIEWPORT });
            },

            setTemplateType: (type) => {
                set({ templateType: type });
            },

            setSeats: (seats) => {
                set({ seats, assignments: [] });
            },

            updateSeat: (id, updates) => {
                set((state) => ({
                    seats: state.seats.map((s) =>
                        s.id === id ? { ...s, ...updates } : s
                    ),
                }));
            },

            addSeat: (seat) => {
                set((state) => ({
                    seats: [...state.seats, seat],
                }));
            },

            removeSeat: (id) => {
                set((state) => ({
                    seats: state.seats.filter((s) => s.id !== id),
                    assignments: state.assignments.filter((a) => a.seatId !== id),
                }));
            },

            setAssignments: (assignments) => {
                set({ assignments });
            },

            assignMemberToSeat: (seatId, memberId) => {
                set((state) => {
                    // 既存の割り当てを解除
                    const filtered = state.assignments.filter(
                        (a) => a.seatId !== seatId && a.memberId !== memberId
                    );
                    return {
                        assignments: [...filtered, { seatId, memberId }],
                    };
                });
            },

            unassignSeat: (seatId) => {
                set((state) => ({
                    assignments: state.assignments.filter((a) => a.seatId !== seatId),
                }));
            },

            addConstraint: (constraint) => {
                set((state) => ({
                    constraints: [...state.constraints, constraint],
                }));
            },

            updateConstraint: (id, updates) => {
                set((state) => ({
                    constraints: state.constraints.map((c) =>
                        c.id === id ? { ...c, ...updates } : c
                    ),
                }));
            },

            removeConstraint: (id) => {
                set((state) => ({
                    constraints: state.constraints.filter((c) => c.id !== id),
                }));
            },

            clearCanvas: () => {
                set({
                    templateType: null,
                    seats: [],
                    assignments: [],
                    viewport: DEFAULT_VIEWPORT,
                });
            },
        }),
        {
            name: 'seatcraft-canvas',
        }
    )
);
