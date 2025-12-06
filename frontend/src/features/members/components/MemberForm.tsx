"use client";

import { useState } from "react";
import type { CreateMemberInput, Gender } from "../types";
import { GENDER_OPTIONS } from "../types";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/lib/utils";
import { X, Plus, User, Hash, Tag } from "lucide-react";

interface MemberFormProps {
    onSubmit: (input: CreateMemberInput) => void;
    initialValues?: Partial<CreateMemberInput>;
    submitLabel?: string;
}

export function MemberForm({
    onSubmit,
    initialValues,
    submitLabel = "追加",
}: MemberFormProps) {
    const [name, setName] = useState(initialValues?.name ?? "");
    const [nickname, setNickname] = useState(initialValues?.nickname ?? "");
    const [gender, setGender] = useState<Gender>(initialValues?.gender ?? "other");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        onSubmit({
            name: name.trim(),
            nickname: nickname.trim() || undefined,
            gender,
            tags,
        });

        // Reset form
        setName("");
        setNickname("");
        setGender("other");
        setTags([]);
        setTagInput("");
    };

    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const getGenderSelectionStyle = (optionValue: string, isSelected: boolean) => {
        if (!isSelected) return "border-border hover:border-primary/50 hover:bg-secondary/50";
        switch (optionValue) {
            case "male": return "border-blue-200 bg-[var(--color-seat-male)] text-blue-700 shadow-sm";
            case "female": return "border-pink-200 bg-[var(--color-seat-female)] text-pink-700 shadow-sm";
            default: return "border-border bg-secondary text-foreground shadow-sm";
        }
    }

    return (

        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    名前 <span className="text-destructive">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-200 focus:shadow-[var(--shadow-sm)]"
                    placeholder="山田 太郎"
                    required
                />
            </div>

            {/* Nickname */}
            <div className="space-y-1.5">
                <label htmlFor="nickname" className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                    ニックネーム・表示名
                </label>
                <input
                    type="text"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-200 focus:shadow-[var(--shadow-sm)]"
                    placeholder="やまちゃん、1、A など"
                />
                <p className="text-[10px] text-muted-foreground">
                    ※席に表示される短い名前
                </p>
            </div>

            {/* Gender */}
            <div className="space-y-2">
                <label className="text-sm font-medium block text-foreground">性別</label>
                <div className="grid grid-cols-3 gap-3">
                    {GENDER_OPTIONS.map((option) => (
                        <label
                            key={option.value}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl border cursor-pointer transition-all duration-200",
                                getGenderSelectionStyle(option.value, gender === option.value)
                            )}
                        >
                            <input
                                type="radio"
                                name="gender"
                                value={option.value}
                                checked={gender === option.value}
                                onChange={(e) => setGender(e.target.value as Gender)}
                                className="sr-only"
                            />
                            <span className="text-sm font-medium">
                                {option.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                    タグ
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="部署, 役職..."
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddTag}
                        className="shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-destructive transition-colors ml-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <Button type="submit" className="w-full mt-4 shadow-md hover:shadow-xl transition-shadow">
                {submitLabel}
            </Button>
        </form>

    );
}
