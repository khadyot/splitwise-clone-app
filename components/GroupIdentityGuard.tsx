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
        let isMounted = true;
        const timeoutId = setTimeout(() => {
            if (isMounted) {
                router.replace(`/join?code=${joinCode}`);
            }
        }, 8000);

        const checkIdentity = async () => {
            let token = localStorage.getItem(`splitit_session_${groupId}`);
            if (!token) {
                const oldToken = localStorage.getItem(`splitwise_session_${groupId}`);
                if (oldToken) {
                    token = oldToken;
                    localStorage.setItem(`splitit_session_${groupId}`, oldToken);
                    localStorage.removeItem(`splitwise_session_${groupId}`);
                    const oldName = localStorage.getItem(`splitwise_name_${groupId}`);
                    if (oldName) {
                        localStorage.setItem(`splitit_name_${groupId}`, oldName);
                        localStorage.removeItem(`splitwise_name_${groupId}`);
                    }
                }
            }

            if (!token) {
                clearTimeout(timeoutId);
                if (isMounted) router.replace(`/join?code=${joinCode}`);
                return;
            }

            try {
                const isValid = await verifySession(groupId, token);
                clearTimeout(timeoutId);
                if (!isMounted) return;

                if (!isValid) {
                    localStorage.removeItem(`splitit_session_${groupId}`);
                    localStorage.removeItem(`splitit_name_${groupId}`);
                    router.replace(`/join?code=${joinCode}`);
                    return;
                }

                setIsChecking(false);
            } catch (e) {
                clearTimeout(timeoutId);
                if (isMounted) router.replace(`/join?code=${joinCode}`);
            }
        };

        checkIdentity();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
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
