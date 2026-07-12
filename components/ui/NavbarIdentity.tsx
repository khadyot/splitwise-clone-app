"use client";

import { useEffect, useState } from "react";
import { UserCircle } from "lucide-react";

export function NavbarIdentity() {
    const [name, setName] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const keys = Object.keys(localStorage);
        const nameKey = keys.find(k => k.startsWith('splitit_name_')) || keys.find(k => k.startsWith('splitwise_name_'));
        if (nameKey) {
            setName(localStorage.getItem(nameKey));
        }
    }, []);

    if (!mounted || !name) {
        return null; // Return null to avoid layout shift or showing fake identity
    }

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
            <UserCircle className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-700 truncate max-w-[120px]">{name}</span>
        </div>
    );
}
