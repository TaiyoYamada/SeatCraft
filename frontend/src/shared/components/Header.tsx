"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "./ui/Button";

const navItems = [
    { href: "/", label: "ホーム" },
    { href: "/members", label: "メンバー" },
    { href: "/layouts/templates", label: "テンプレート" },
    { href: "/craft", label: "キャンバス" },
];

export function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Section */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 group shrink-0">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200">
                                <Image
                                    src="/icon.png"
                                    alt="SeatCraft"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="font-bold text-xl text-foreground tracking-tight group-hover:text-[var(--color-accent)] transition-colors">
                                SeatCraft
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== "/" && pathname.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "text-foreground bg-secondary font-semibold"
                                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full px-5 shadow-sm hover:shadow-md border-[var(--color-accent)]/30"
                                asChild
                            >
                                <Link href="/ai">
                                    <Sparkles className="w-4 h-4 mr-1 text-[var(--color-accent)]" />
                                    AIに相談
                                </Link>
                            </Button>
                            <Button size="sm" className="rounded-full px-5 shadow-sm hover:shadow-md" asChild>
                                <Link href="/members">
                                    始める
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                            </Button>
                        </div>

                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-md text-foreground hover:bg-secondary transition-colors"
                            aria-label="メニューを開く"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border bg-background absolute w-full left-0 shadow-lg animate-in slide-in-from-top-2 fade-in duration-200 z-50">
                    <nav className="px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        "flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors duration-200",
                                        isActive
                                            ? "text-foreground bg-secondary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                    )}
                                >
                                    {item.label}
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />}
                                </Link>
                            );
                        })}
                        <div className="pt-4 mt-4 border-t border-border space-y-2">
                            <Button variant="outline" size="lg" className="w-full rounded-xl border-[var(--color-accent)]/30" asChild>
                                <Link href="/ai" onClick={() => setIsMenuOpen(false)}>
                                    <Sparkles className="w-4 h-4 mr-2 text-[var(--color-accent)]" />
                                    AIに相談
                                </Link>
                            </Button>
                            <Button size="lg" className="w-full rounded-xl" asChild>
                                <Link href="/members" onClick={() => setIsMenuOpen(false)}>
                                    今すぐ始める
                                </Link>
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
