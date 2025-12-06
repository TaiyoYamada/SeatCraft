import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Seat, SeatTemplateType } from '@/features/layouts/types';
import type { SeatAssignment, CanvasViewport, ConstraintType } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
    toggleSeatLock: (id: string) => void;
    addNewSeat: () => void; // Convenience action to add a new seat with auto-positioning
    removeLastSeat: () => void; // Convenience action to remove the last seat
    shuffleAssignments: (memberIds: string[]) => void; // Shuffle only non-locked seats
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

const SEAT_SIZE = { width: 80, height: 80 };
const MAX_SEATS = 50;
const MIN_SEATS = 1;

export const useCanvasStore = create<CanvasState>()(
    persist(
        (set, get) => ({
            canvasWidth: 1600,
            canvasHeight: 1200,
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

            toggleSeatLock: (id) => {
                set((state) => ({
                    seats: state.seats.map((s) =>
                        s.id === id ? { ...s, isLocked: !s.isLocked } : s
                    ),
                }));
            },

            addNewSeat: () => {
                const { seats, canvasWidth, canvasHeight } = get();
                if (seats.length >= MAX_SEATS) return;

                // Calculate position: center with offset based on seat count
                const offsetX = (seats.length % 5) * 100;
                const offsetY = Math.floor(seats.length / 5) * 100;
                const baseX = (canvasWidth / 2) - (SEAT_SIZE.width / 2);
                const baseY = (canvasHeight / 2) - (SEAT_SIZE.height / 2);

                const newSeat: Seat = {
                    id: uuidv4(),
                    position: { x: baseX + offsetX - 200, y: baseY + offsetY - 200 },
                    size: SEAT_SIZE,
                    label: `${seats.length + 1}`,
                    isLocked: false,
                };

                set((state) => ({
                    seats: [...state.seats, newSeat],
                }));
            },

            removeLastSeat: () => {
                const { seats } = get();
                if (seats.length <= MIN_SEATS) return;

                // Remove the last seat (most recently added if not locked, otherwise find last unlocked)
                const lastUnlocked = [...seats].reverse().find(s => !s.isLocked);
                if (!lastUnlocked) return; // All seats locked

                set((state) => ({
                    seats: state.seats.filter((s) => s.id !== lastUnlocked.id),
                    assignments: state.assignments.filter((a) => a.seatId !== lastUnlocked.id),
                }));
            },

            shuffleAssignments: (memberIds: string[]) => {
                const { seats, assignments } = get();

                // Get locked seats and their assignments
                const lockedSeatIds = seats.filter(s => s.isLocked).map(s => s.id);
                const lockedAssignments = assignments.filter(a => lockedSeatIds.includes(a.seatId));
                const lockedMemberIds = lockedAssignments.map(a => a.memberId);

                // Get unlocked seats and unassigned members
                const unlockedSeats = seats.filter(s => !s.isLocked);
                const unassignedMemberIds = memberIds.filter(id => !lockedMemberIds.includes(id));

                // Shuffle unassigned members
                const shuffled = [...unassignedMemberIds].sort(() => Math.random() - 0.5);

                // Create new assignments for unlocked seats
                const newUnlockedAssignments = unlockedSeats
                    .slice(0, shuffled.length)
                    .map((seat, i) => ({
                        seatId: seat.id,
                        memberId: shuffled[i],
                    }));

                // Merge locked and new assignments
                set({
                    assignments: [...lockedAssignments, ...newUnlockedAssignments],
                });
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
