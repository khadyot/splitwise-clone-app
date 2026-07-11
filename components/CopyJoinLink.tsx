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
            className={`rounded-full h-8 px-3 text-xs flex gap-1.5 transition-colors ${copied ? 'bg-pastel-green text-pastel-greenText border-pastel-green' : ''}`}
        >
            {copied ? (
                <>
                    <Check className="w-3.5 h-3.5" />
                    Copied Link
                </>
            ) : (
                <>
                    <LinkIcon className="w-3.5 h-3.5" />
                    Copy Invite Link
                </>
            )}
        </Button>
    );
}
