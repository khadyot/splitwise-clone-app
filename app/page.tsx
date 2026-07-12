import Link from "next/link";
import { ArrowRight, Receipt, Users, Coins } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#f8f6f0] font-sans text-gray-900 antialiased selection:bg-black selection:text-white">
            {/* Navigation */}
            <header className="px-6 py-6 max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                    <div className="h-9 w-9 rounded-2xl bg-black flex items-center justify-center text-white font-extrabold text-lg tracking-tighter">
                        S
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-gray-900">SplitIt</span>
                </div>
                <div className="flex space-x-3 items-center">
                    <Link href="/join" className="text-sm font-bold text-gray-600 hover:text-black transition-colors px-3">
                        Have a code?
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="primary" size="sm" className="h-9 px-5 font-bold">
                            Go to dashboard
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="px-6 max-w-5xl mx-auto pt-16 pb-24 flex flex-col items-center text-center">
                <div className="max-w-3xl">
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-gray-900 leading-[1.05] mb-6">
                        Expense splitting without the daily limits or paywalls.
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                        A clean, lightweight tool built to handle group costs. No accounts needed, no daily caps on expenses, and no subscriptions required to split unequally.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                        <Link href="/dashboard#create-group" className="w-full sm:w-auto">
                            <Button variant="primary" size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold flex items-center justify-center gap-2 group">
                                Start a group
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/join" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-white text-gray-900 border-gray-200 hover:bg-gray-50 flex items-center justify-center">
                                Join with code
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Grounded features grid */}
                <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs">
                        <div className="w-11 h-11 rounded-2xl bg-pastel-orange text-pastel-orangeText flex items-center justify-center mb-6">
                            <Coins className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 mb-2">No daily limits on entries</h3>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            Splitwise restricts free users to a daily limit of 3 or 4 expenses. SplitIt gives you unlimited entries so you can log your coffee, taxi, lunch, and dinner without hitting a wall.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs">
                        <div className="w-11 h-11 rounded-2xl bg-pastel-blue text-pastel-blueText flex items-center justify-center mb-6">
                            <Users className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 mb-2">No forced account signups</h3>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            Stop forcing every group member to download an app, create passwords, or verify their email addresses. Anyone with the group link can participate and log expenses immediately.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs">
                        <div className="w-11 h-11 rounded-2xl bg-pastel-purple text-pastel-purpleText flex items-center justify-center mb-6">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 mb-2">Free unequal & exact splits</h3>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            Splitting a dinner bill unequally or by percentage should not sit behind a premium monthly subscription. Access all splitting options by default, completely free.
                        </p>
                    </div>
                </div>

                {/* Identity explainer card */}
                <div className="mt-12 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/80 shadow-xs text-left w-full">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-3">How Identity Works</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium max-w-3xl">
                        Group data is shared and live for everyone in the group. Your device remembers which groups you've joined so you don't have to re-enter the code every time.
                    </p>
                </div>

                {/* Final CTA */}
                <div className="mt-16 w-full max-w-4xl bg-pastel-green/20 border border-pastel-green/45 rounded-3xl p-8 sm:p-12 text-center">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Ready to split the bill?</h2>
                    <p className="text-sm sm:text-base text-gray-700 mb-8 max-w-xl mx-auto font-medium">
                        Create a group in two clicks. Share the 6-letter join code. Log the expenses, hit settle up, and close the tab when you're done.
                    </p>
                    <Link href="/dashboard#create-group">
                        <Button variant="primary" size="lg" className="h-12 px-8 font-bold text-sm shadow-sm">
                            Create your first group
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
