"use client";

import type { SeatTemplate, SeatTemplateType } from "../types";
import { SEAT_TEMPLATES } from "../types";
import { cn } from "@/lib/utils";
import { CheckCircle2, LayoutGrid, CircleDot, Grid, MousePointerClick } from "lucide-react";

interface TemplateSelectorProps {
    selected: SeatTemplateType | null;
    onSelect: (type: SeatTemplateType) => void;
}

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            className={cn(
                "relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 w-full text-left bg-card hover:shadow-md",
                isSelected
                    ? "border-primary ring-offset-2"
                    : "border-border hover:border-primary/50"
            )}
        >
            {/* Icon */}
            <div className={cn(
                "mb-4 h-12 w-12 flex items-center justify-center rounded-lg transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
            )}>
                <TemplateIcon type={template.type} />
            </div>

            {/* Info */}
            <h3 className="font-semibold text-base mb-1 text-foreground">{template.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{template.description}</p>

            {/* Selected indicator */}
            {isSelected && (
                <div className="absolute top-4 right-4 text-primary animate-in zoom-in spin-in-180 duration-300">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
            )}
        </button>
    );
}

function TemplateIcon({ type }: { type: SeatTemplateType }) {
    switch (type) {
        case "line":
            return <LayoutGrid className="w-6 h-6" />;
        case "circle":
            return <CircleDot className="w-6 h-6" />;
        case "island":
            return <Grid className="w-6 h-6" />;
        case "custom":
            return <MousePointerClick className="w-6 h-6" />;
    }
}
