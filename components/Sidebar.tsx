import Link from 'next/link';
import { readData } from '@/lib/storage';
import { Users, Home, Plus, KeyRound } from 'lucide-react';

export async function Sidebar() {
    const data = await readData();
    const groups = data.groups;

    return (
        <aside className="w-60 hidden md:block flex-shrink-0 h-[calc(100vh-3.5rem)] sticky top-14 py-6 pr-6 mr-6 border-r border-gray-200/60">
            <nav className="space-y-1.5">
                <Link
                    href="/dashboard"
                    className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-800 hover:bg-white hover:shadow-sm transition-all"
                >
                    <Home className="mr-3 h-4 w-4 text-gray-500 group-hover:text-black" />
                    Dashboard
                </Link>
                <Link
                    href="/join"
                    className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-800 hover:bg-white hover:shadow-sm transition-all"
                >
                    <KeyRound className="mr-3 h-4 w-4 text-gray-500 group-hover:text-black" />
                    Join with Code
                </Link>
            </nav>

            <div className="mt-8">
                <div className="flex items-center justify-between px-3 mb-2.5">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Your Groups
                    </h3>
                    <Link href="/#create-group" className="text-gray-400 hover:text-black transition-colors" title="Create Group">
                        <Plus className="h-4 w-4" />
                    </Link>
                </div>
                <div className="space-y-1" role="group">
                    {groups.map((group) => (
                        <Link
                            key={group.id}
                            href={`/groups/${group.id}`}
                            className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-sm hover:text-black transition-all"
                        >
                            <div className="flex items-center min-w-0">
                                <div className="h-6 w-6 rounded-full bg-pastel-purple text-pastel-purpleText flex items-center justify-center text-[10px] font-bold mr-2.5 flex-shrink-0">
                                    {group.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate">{group.name}</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                                {group.currency}
                            </span>
                        </Link>
                    ))}
                    {groups.length === 0 && (
                        <div className="px-3 py-4 text-center bg-white/50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-xs text-gray-400 italic">No groups yet</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
