"use client";

import { useState } from "react";
import type { CreateMemberInput, Gender } from "../types";
import { GENDER_OPTIONS } from "../types";

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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                    名前 <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    placeholder="山田 太郎"
                    required
                />
            </div>

            {/* Nickname */}
            <div>
                <label htmlFor="nickname" className="block text-sm font-medium mb-1">
                    ニックネーム・表示名
                </label>
                <input
                    type="text"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="input"
                    placeholder="やまちゃん、1、A など"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                    席に表示する名前（数字や記号も可）
                </p>
            </div>

            {/* Gender */}
            <div>
                <label className="block text-sm font-medium mb-2">性別</label>
                <div className="flex gap-3">
                    {GENDER_OPTIONS.map((option) => (
                        <label
                            key={option.value}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${gender === option.value
                                    ? "border-[var(--primary)] bg-[var(--primary)] bg-opacity-10"
                                    : "border-[var(--border)] hover:border-[var(--primary)]"
                                }`}
                        >
                            <input
                                type="radio"
                                name="gender"
                                value={option.value}
                                checked={gender === option.value}
                                onChange={(e) => setGender(e.target.value as Gender)}
                                className="sr-only"
                            />
                            <span className="text-sm">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Tags */}
            <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-1">
                    タグ
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        className="input flex-1"
                        placeholder="部署名、役職など"
                    />
                    <button
                        type="button"
                        onClick={handleAddTag}
                        className="btn btn-secondary"
                    >
                        追加
                    </button>
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="badge badge-primary flex items-center gap-1"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-[var(--danger)] transition-colors"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary w-full">
                {submitLabel}
            </button>
        </form>
    );
}
