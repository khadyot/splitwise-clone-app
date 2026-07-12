"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LinkIcon, Check } from "lucide-react";

interface CopyJoinLinkProps {
    joinCode: string;
}

export function CopyJoinLink({ joinCode }: CopyJoinLinkProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const url = `${window.location.origin}/join?code=${joinCode}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    return (
        <Button 
            onClick={handleCopy} 
            variant="outline" 
            size="sm" 
            className={`rounded-full h-9 px-4 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs bg-white hover:bg-gray-50 border-gray-300 ${copied ? 'bg-pastel-green text-pastel-greenText border-pastel-green shadow-none' : ''}`}
        >
            {copied ? (
                <>
                    <Check className="w-3.5 h-3.5" />
                    Copied Link
                </>
            ) : (
                <>
                    <LinkIcon className="w-3.5 h-3.5 text-gray-600" />
                    Copy Invite Link
                </>
            )}
        </Button>
    );
}
