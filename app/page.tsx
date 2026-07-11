import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/ui/Layout";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#f8f6f0] font-sans selection:bg-pastel-purple selection:text-pastel-purpleText">
            {/* Minimal Header */}
            <header className="absolute top-0 w-full z-10 px-6 py-6 max-w-6xl mx-auto left-0 right-0 flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center text-white font-extrabold text-sm tracking-tighter shadow-sm">
                        S
                    </div>
                    <span className="font-extrabold tracking-tight text-gray-900">Splitwise Alternative</span>
                </div>
                <div className="flex space-x-3 items-center">
                    <Link href="/join" className="text-sm font-bold text-gray-600 hover:text-black transition-colors hidden sm:block">
                        Have a code?
                    </Link>
                    <Link href="/dashboard">
                        <Button className="rounded-full bg-black text-white hover:bg-gray-800 border-0 h-9 px-5">
                            Open App
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
                <div className="max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-gray-900 leading-[1.1] mb-6">
                        Split expenses for trips, <br className="hidden md:block"/>
                        <span className="text-brand-red">without the friction.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                        A direct answer to modern paywalls and forced signups. No accounts required, no daily expense limits, and completely free. Just enter a short code, log your dinner, and walk away when it's settled.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto rounded-full bg-black text-white hover:bg-gray-800 border-0 h-14 px-8 text-lg font-bold group">
                                Start a group
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/join" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg font-bold bg-white border-gray-200 hover:bg-gray-50 text-gray-900">
                                Join with code
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* The Problem / Solution Grid */}
                <div className="mt-24 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-pastel-purple text-pastel-purpleText flex items-center justify-center mb-6">
                            <span className="font-bold text-xl">1</span>
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900 mb-3">No forced signups</h3>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Don't force your friends to download an app, verify an email, or create a password just to pay you back for pizza. Group data lives securely in the cloud for everyone to see, while only login convenience is tied to your device—no bloated accounts required.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-pastel-blue text-pastel-blueText flex items-center justify-center mb-6">
                            <span className="font-bold text-xl">2</span>
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900 mb-3">No paywalled features</h3>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Splitting a bill by exact amounts shouldn't cost a monthly subscription. We built the core utility for one-off group trips, entirely free of Pro upgrades.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-pastel-orange text-pastel-orangeText flex items-center justify-center mb-6">
                            <span className="font-bold text-xl">3</span>
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900 mb-3">No daily limits</h3>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Log as many expenses as you want, as quickly as you want. There are no artificial limits or cooldown timers capping how you manage your shared costs.
                        </p>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="mt-24 mb-10 text-center bg-pastel-green/30 border border-pastel-green/50 rounded-3xl p-10 md:p-16 w-full max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-5 tracking-tight">Ready to split the bill?</h2>
                    <p className="text-gray-700 mb-8 max-w-xl mx-auto font-medium">
                        Create a group in two clicks. Share the 6-letter join code. Log the expenses, hit settle up, and close the tab for good.
                    </p>
                    <Link href="/dashboard">
                        <Button className="rounded-full bg-black text-white hover:bg-gray-800 border-0 h-12 px-8 font-bold">
                            Create your first group
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
