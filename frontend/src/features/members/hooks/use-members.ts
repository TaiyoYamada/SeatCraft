import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Member, CreateMemberInput } from '../types';

interface MembersState {
    members: Member[];
    addMember: (input: CreateMemberInput) => void;
    updateMember: (id: string, input: Partial<CreateMemberInput>) => void;
    removeMember: (id: string) => void;
    clearMembers: () => void;
    importMembers: (members: Member[]) => void;
}

export const useMembersStore = create<MembersState>()(
    persist(
        (set) => ({
            members: [],

            addMember: (input) => {
                const newMember: Member = {
                    id: uuidv4(),
                    ...input,
                };
                set((state) => ({
                    members: [...state.members, newMember],
                }));
            },

            updateMember: (id, input) => {
                set((state) => ({
                    members: state.members.map((m) =>
                        m.id === id ? { ...m, ...input } : m
                    ),
                }));
            },

            removeMember: (id) => {
                set((state) => ({
                    members: state.members.filter((m) => m.id !== id),
                }));
            },

            clearMembers: () => {
                set({ members: [] });
            },

            importMembers: (members) => {
                set({ members });
            },
        }),
        {
            name: 'seatcraft-members',
        }
    )
);
