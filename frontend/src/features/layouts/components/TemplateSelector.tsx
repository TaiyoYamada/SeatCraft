"use client";

import type { SeatTemplate, SeatTemplateType } from "../types";
import { SEAT_TEMPLATES } from "../types";

interface TemplateSelectorProps {
    selected: SeatTemplateType | null;
    onSelect: (type: SeatTemplateType) => void;
}

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SEAT_TEMPLATES.map((template) => (
                <TemplateCard
                    key={template.type}
                    template={template}
                    isSelected={selected === template.type}
                    onClick={() => onSelect(template.type)}
                />
            ))}
        </div>
    );
}

function TemplateCard({
    template,
    isSelected,
    onClick,
}: {
    template: SeatTemplate;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`card text-left transition-all hover:shadow-lg ${isSelected
                    ? "ring-2 ring-[var(--primary)] border-[var(--primary)]"
                    : "hover:border-[var(--primary)]"
                }`}
        >
            {/* Icon */}
            <div className="text-4xl mb-4 h-16 flex items-center justify-center bg-[var(--secondary)] rounded-lg">
                <TemplatePreview type={template.type} />
            </div>

            {/* Info */}
            <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
            <p className="text-sm text-[var(--text-muted)]">{template.description}</p>

            {/* Selected indicator */}
            {isSelected && (
                <div className="mt-4 flex items-center gap-2 text-[var(--primary)]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span className="text-sm font-medium">選択中</span>
                </div>
            )}
        </button>
    );
}

function TemplatePreview({ type }: { type: SeatTemplateType }) {
    switch (type) {
        case "line":
            return (
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-6 h-6 rounded-md bg-[var(--primary)] opacity-80"
                        />
                    ))}
                </div>
            );
        case "circle":
            return (
                <div className="relative w-16 h-16">
                    {[...Array(8)].map((_, i) => {
                        const angle = (2 * Math.PI * i) / 8 - Math.PI / 2;
                        const x = 50 + 40 * Math.cos(angle);
                        const y = 50 + 40 * Math.sin(angle);
                        return (
                            <div
                                key={i}
                                className="absolute w-4 h-4 rounded-full bg-[var(--primary)] opacity-80"
                                style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    transform: "translate(-50%, -50%)",
                                }}
                            />
                        );
                    })}
                </div>
            );
        case "island":
            return (
                <div className="grid grid-cols-2 gap-3">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="grid grid-cols-2 gap-1">
                            {[...Array(4)].map((_, j) => (
                                <div
                                    key={j}
                                    className="w-3 h-3 rounded-sm bg-[var(--primary)] opacity-80"
                                />
                            ))}
                        </div>
                    ))}
                </div>
            );
        case "custom":
            return (
                <svg
                    className="w-10 h-10 text-[var(--primary)] opacity-80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                </svg>
            );
    }
}
