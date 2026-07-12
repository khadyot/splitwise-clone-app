"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CopyJoinLink } from "@/components/CopyJoinLink";
import { KeyRound, Copy, Check } from "lucide-react";

interface GroupInviteHeaderProps {
    joinCode: string;
}

export function GroupInviteHeader({ joinCode }: GroupInviteHeaderProps) {
    const [copiedCode, setCopiedCode] = useState(false);

    if (!joinCode) return null;

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(joinCode);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        } catch (err) {
            console.error("Failed to copy join code:", err);
        }
    };

    return (
        <div className="w-full bg-pastel-yellow/50 border border-pastel-yellow rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs mt-6 transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-pastel-orange text-pastel-orangeText flex items-center justify-center shadow-xs shrink-0 font-extrabold">
                    <KeyRound className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600 mb-0.5">
                        Group Invite Code
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl sm:text-2xl font-mono font-black tracking-widest text-gray-900 bg-white px-3.5 py-1 rounded-xl border border-gray-200/80 shadow-2xs">
                            {joinCode}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2.5 sm:shrink-0 flex-wrap sm:flex-nowrap">
                <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    size="sm"
                    className={`rounded-full h-9 px-4 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs bg-white hover:bg-gray-50 border-gray-300 ${
                        copiedCode ? "bg-pastel-green text-pastel-greenText border-pastel-green shadow-none" : ""
                    }`}
                >
                    {copiedCode ? (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            Copied Code
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5 text-gray-600" />
                            Copy Code
                        </>
                    )}
                </Button>

                <CopyJoinLink joinCode={joinCode} />
            </div>
        </div>
    );
}
