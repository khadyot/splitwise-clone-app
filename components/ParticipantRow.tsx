"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { removeParticipant } from "@/app/actions";

interface ParticipantRowProps {
    groupId: string;
    participantId: string;
    name: string;
}

export function ParticipantRow({ groupId, participantId, name }: ParticipantRowProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRemove = async () => {
        setIsRemoving(true);
        setError(null);
        try {
            const res = await removeParticipant(groupId, participantId);
            if (res.error) {
                setError(res.error);
                setIsConfirming(false); // Reset confirmation state to show the error clearly
            }
            // If successful, the page will revalidate and this row will disappear
        } catch (err) {
            setError("Something went wrong.");
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <li className="group flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-pastel-blue text-pastel-blueText flex items-center justify-center text-xs font-bold">
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <span>{name}</span>
                </div>
                
                <div className="flex items-center">
                    {isConfirming ? (
                        <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-100 animate-in fade-in zoom-in duration-200">
                            <span className="text-[10px] font-bold text-red-600 px-1 uppercase tracking-wide">Sure?</span>
                            <button 
                                onClick={handleRemove} 
                                disabled={isRemoving}
                                className="h-6 px-2 bg-red-600 text-white rounded text-[11px] font-bold hover:bg-red-700 disabled:opacity-50"
                            >
                                {isRemoving ? '...' : 'Yes'}
                            </button>
                            <button 
                                onClick={() => setIsConfirming(false)} 
                                className="h-6 px-2 bg-white text-gray-600 rounded text-[11px] font-bold border border-gray-200 hover:bg-gray-50"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => {
                                setError(null);
                                setIsConfirming(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                            title="Remove Participant"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
            {error && (
                <div className="text-[11px] text-red-600 font-medium bg-red-50 p-1.5 rounded border border-red-100 animate-in slide-in-from-top-1">
                    {error}
                </div>
            )}
        </li>
    );
}
