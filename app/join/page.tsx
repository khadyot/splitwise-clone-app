"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layout } from "@/components/ui/Layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { joinGroup } from "@/app/actions";
import { KeyRound, ArrowRight, Sparkles } from "lucide-react";

function JoinForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [joinCode, setJoinCode] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const codeParam = searchParams?.get("code");
        if (codeParam) {
            setJoinCode(codeParam.toUpperCase().substring(0, 6));
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode || !name || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append("joinCode", joinCode);
        formData.append("name", name);

        try {
            const res = await joinGroup(formData);
            if (res.error) {
                setError(res.error);
            } else if (res.success && res.groupId) {
                // Save guest identity in local storage / session per AGENTS.md
                if (typeof window !== "undefined") {
                    localStorage.setItem(`splitwise_session_${res.groupId}`, res.sessionToken || "");
                    localStorage.setItem(`splitwise_name_${res.groupId}`, name.trim());
                }
                router.push(`/groups/${res.groupId}`);
            }
        } catch (err) {
            setError("Something went wrong joining the group. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Join Code
                </label>
                <Input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. ABC123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="h-12 font-mono tracking-widest text-lg font-bold uppercase"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Your Name
                </label>
                <Input
                    type="text"
                    placeholder="e.g. Alice"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 text-base font-medium"
                    required
                />
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={isSubmitting || !joinCode || !name}
                className="w-full h-12 mt-2 text-base shadow-md group"
            >
                <span>{isSubmitting ? "Joining..." : "Continue to Group"}</span>
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
        </form>
    );
}

export default function JoinPage() {
    return (
        <Layout>
            <div className="max-w-md mx-auto pt-8 pb-16">
                <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-pastel-purple text-pastel-purpleText flex items-center justify-center mb-6">
                        <KeyRound className="w-6 h-6" />
                    </div>

                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">
                        Join an Expense Group
                    </h1>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        Enter your 6-character invite code and your name. No signups, passwords, or emails needed.
                    </p>

                    <Suspense fallback={<div className="h-48 flex items-center justify-center text-gray-400 text-sm font-medium">Loading form...</div>}>
                        <JoinForm />
                    </Suspense>

                    <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <Sparkles className="w-3.5 h-3.5 text-pastel-orangeText" />
                        <span>Instant guest entry • 100% Free & Private</span>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
