import Link from "next/link";
import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { KeyRound } from "lucide-react";
import { NavbarIdentity } from "@/components/ui/NavbarIdentity";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-xs transition-all">
            <div className="container mx-auto flex h-16 items-center px-6 max-w-6xl justify-between">
                <Link href="/dashboard" className="flex items-center space-x-2.5 group">
                    <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center text-white font-extrabold text-sm tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
                        S
                    </div>
                    <span className="font-extrabold text-gray-900 text-lg tracking-tight">SplitIt</span>
                </Link>

                <div className="flex items-center space-x-3">
                    <div className="hidden sm:inline-flex items-center rounded-full bg-pastel-green px-3 py-1 text-xs font-semibold text-pastel-greenText">
                        Free & Instant • No Accounts Required
                    </div>
                    <NavbarIdentity />
                    <Link
                        href="/join"
                        className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-800 transition-colors"
                    >
                        <KeyRound className="h-3.5 w-3.5 text-gray-600" />
                        Join Group
                    </Link>
                </div>
            </div>
        </header>
    );
}

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#f8f6f0] font-sans antialiased text-gray-900 flex flex-col">
            <Navbar />
            <div className="container mx-auto max-w-6xl px-6 flex flex-1">
                <Sidebar />
                <main className="flex-1 py-8 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
