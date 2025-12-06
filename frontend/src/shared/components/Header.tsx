"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/", label: "ホーム" },
    { href: "/members", label: "メンバー" },
    { href: "/layouts/templates", label: "テンプレート" },
    { href: "/craft", label: "キャンバス" },
];

export function Header() {
    const pathname = usePathname();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--card-bg)] border-b border-[var(--border)] backdrop-blur-sm bg-opacity-90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-105">
                            SC
                        </div>
                        <span className="font-semibold text-lg hidden sm:block">SeatCraft</span>
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
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? "bg-[var(--primary)] text-white"
                                            : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </header>
    );
}
