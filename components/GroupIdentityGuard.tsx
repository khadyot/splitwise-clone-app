"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifySession } from "@/app/actions";

interface GroupIdentityGuardProps {
    groupId: string;
    joinCode: string;
}

export function GroupIdentityGuard({ groupId, joinCode }: GroupIdentityGuardProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkIdentity = async () => {
            const token = localStorage.getItem(`splitwise_session_${groupId}`);
            if (!token) {
                // No token found, redirect to join screen with the code pre-filled
                router.replace(`/join?code=${joinCode}`);
                return;
            }

            // Verify the token on the server
            const isValid = await verifySession(groupId, token);
            if (!isValid) {
                // Token is invalid (e.g. participant deleted, DB reset)
                localStorage.removeItem(`splitwise_session_${groupId}`);
                localStorage.removeItem(`splitwise_name_${groupId}`);
                router.replace(`/join?code=${joinCode}`);
                return;
            }

            // Valid identity found
            setIsChecking(false);
        };

        checkIdentity();
    }, [groupId, joinCode, router]);

    if (isChecking) {
        // Return a full screen loader overlay while verifying local storage to avoid layout flash
        return (
            <div className="fixed inset-0 z-50 bg-[#f8f6f0] flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-black animate-spin mb-4" />
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Verifying Access...</p>
            </div>
        );
    }

    return null; // Renders nothing if valid
}
