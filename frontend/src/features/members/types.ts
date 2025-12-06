// ============================================================
// Member Types
// ============================================================

export type Gender = 'male' | 'female' | 'other';

export interface Member {
    id: string;
    name: string;
    nickname?: string;
    gender: Gender;
    tags: string[];
}

export type CreateMemberInput = Omit<Member, 'id'>;

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
    { value: 'male', label: '男性' },
    { value: 'female', label: '女性' },
    { value: 'other', label: 'その他' },
];

export function getGenderLabel(gender: Gender): string {
    const option = GENDER_OPTIONS.find((o) => o.value === gender);
    return option?.label ?? gender;
}

export function getGenderColor(gender: Gender): string {
    const colors: Record<Gender, string> = {
        male: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        female: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
        other: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    };
    return colors[gender];
}
