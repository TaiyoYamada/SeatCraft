"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";

const navItems = [
    { href: "/", label: "ホーム" },
    { href: "/members", label: "メンバー" },
    { href: "/layouts/templates", label: "テンプレート" },
    { href: "/craft", label: "キャンバス" },
];

export function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 bg-background/80 backdrop-blur-md border-b border-border shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm transition-transform group-hover:scale-105">
                        SC
                    </div>
                    <span className="font-semibold text-lg hidden sm:block tracking-tight">SeatCraft</span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                                    isActive
                                        ? "text-foreground bg-secondary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
