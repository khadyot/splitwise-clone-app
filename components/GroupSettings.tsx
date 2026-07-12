"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, LogOut } from "lucide-react";
import { deleteGroup, leaveGroup } from "@/app/actions";
import { Button } from "@/components/ui/Button";

export function GroupSettings({ groupId }: { groupId: string }) {
    const router = useRouter();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [leaveError, setLeaveError] = useState<string | null>(null);

    const handleDeleteGroup = async () => {
        setIsDeleting(true);
        await deleteGroup(groupId);
        // Action handles revalidate, client side we navigate
        router.push("/dashboard");
    };

    const handleLeaveGroup = async () => {
        setIsLeaving(true);
        setLeaveError(null);
        
        const sessionToken = localStorage.getItem(`splitit_session_${groupId}`);
        if (!sessionToken) {
            setLeaveError("Not joined via this browser.");
            setIsLeaving(false);
            return;
        }

        try {
            const res = await leaveGroup(groupId, sessionToken);
            if (res.error) {
                setLeaveError(res.error);
                setIsConfirmingLeave(false);
            } else {
                localStorage.removeItem(`splitit_session_${groupId}`);
                localStorage.removeItem(`splitit_name_${groupId}`);
                router.push("/dashboard");
            }
        } catch (err) {
            setLeaveError("Failed to leave group.");
        } finally {
            setIsLeaving(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm mt-6">
            <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-4">Danger Zone</h2>
            
            <div className="flex flex-col gap-3">
                {/* Leave Group */}
                <div className="flex flex-col gap-1.5">
                    {isConfirmingLeave ? (
                        <div className="flex items-center justify-between bg-red-50 p-2 rounded-xl border border-red-100">
                            <span className="text-xs font-bold text-red-600 px-1">Are you sure you want to leave?</span>
                            <div className="flex gap-1">
                                <button 
                                    onClick={handleLeaveGroup} 
                                    disabled={isLeaving}
                                    className="h-8 px-3 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isLeaving ? 'Leaving...' : 'Yes, Leave'}
                                </button>
                                <button 
                                    onClick={() => setIsConfirmingLeave(false)} 
                                    className="h-8 px-3 bg-white text-gray-600 rounded-lg text-xs font-bold border border-gray-200 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Button 
                            variant="outline" 
                            onClick={() => { setLeaveError(null); setIsConfirmingLeave(true); }}
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 gap-2 h-10"
                        >
                            <LogOut className="w-4 h-4" />
                            Leave this group
                        </Button>
                    )}
                    {leaveError && (
                        <div className="text-[11px] text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                            {leaveError}
                        </div>
                    )}
                </div>

                {/* Delete Group */}
                <div>
                    {isConfirmingDelete ? (
                        <div className="flex items-center justify-between bg-red-50 p-2 rounded-xl border border-red-100">
                            <span className="text-xs font-bold text-red-600 px-1">Delete group permanently?</span>
                            <div className="flex gap-1">
                                <button 
                                    onClick={handleDeleteGroup} 
                                    disabled={isDeleting}
                                    className="h-8 px-3 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                                <button 
                                    onClick={() => setIsConfirmingDelete(false)} 
                                    className="h-8 px-3 bg-white text-gray-600 rounded-lg text-xs font-bold border border-gray-200 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Button 
                            variant="outline" 
                            onClick={() => setIsConfirmingDelete(true)}
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 gap-2 h-10"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete this group
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
