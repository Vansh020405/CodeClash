"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Rocket, LogOut, User, Settings, LayoutDashboard, ChevronDown, FileText, Sun, Moon, Sparkles } from "lucide-react";

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const { isDarkMode, toggleTheme } = useTheme();
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Floating Navbar Design Variables
    const floatBg = isDarkMode ? "bg-black/70 border-white/10 shadow-black/40" : "bg-white/70 border-slate-200 shadow-slate-200/50";
    const floatText = isDarkMode ? "text-zinc-400 hover:text-white" : "text-slate-500 hover:text-slate-900";
    const logoColor = isDarkMode ? "text-white" : "text-slate-900";
    const dropdownBg = isDarkMode ? "bg-[#111] border-zinc-800" : "bg-white border-slate-200";
    const dropdownItemHover = isDarkMode ? "hover:bg-zinc-800 text-zinc-300 hover:text-white" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900";

    return (
        <>
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 pointer-events-none flex justify-center">
                <nav className={`pointer-events-auto w-full rounded-full border shadow-2xl backdrop-blur-xl px-2 py-2 flex items-center justify-between transition-all duration-300 ${floatBg}`}>

                    {/* Left: Logo (Circle Icon style + Text) */}
                    <div className="flex items-center gap-4 pl-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-zinc-800 group-hover:bg-zinc-700' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                                <Rocket size={16} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                            </div>
                            <span className={`font-bold tracking-tight hidden sm:block ${logoColor}`}>CodeClash</span>
                        </Link>
                    </div>

                    {/* Center: Links */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/problems" className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${floatText}`}>
                            Problems
                        </Link>
                        <Link href="/parser" className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${floatText}`}>
                            Normalizer
                        </Link>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 pr-1">
                        <button
                            onClick={toggleTheme}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'text-zinc-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </button>

                        <div className="w-px h-5 bg-zinc-500/20 mx-1"></div>

                        {session ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'text-zinc-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                                >
                                    <User size={18} />
                                </button>

                                {isProfileOpen && (
                                    <div className={`absolute top-12 right-0 w-56 rounded-xl border p-1 shadow-xl animate-in fade-in zoom-in-95 ${dropdownBg}`}>
                                        <div className="px-2 py-2 mb-1 border-b border-zinc-800/10 dark:border-white/10">
                                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{session.user?.name || "User"}</p>
                                            <p className="text-xs text-zinc-500 truncate">{session.user?.email}</p>
                                        </div>

                                        <Link
                                            href="/dashboard"
                                            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${dropdownItemHover}`}
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <LayoutDashboard size={16} />
                                            Dashboard
                                        </Link>

                                        <button
                                            onClick={async () => {
                                                setIsProfileOpen(false);
                                                await signOut({ redirect: false });
                                                router.push("/");
                                                router.refresh();
                                            }}
                                            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors text-red-500 hover:bg-red-500/10`}
                                        >
                                            <LogOut size={16} />
                                            Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/auth/signin">
                                    <Button variant="ghost" className={`rounded-full px-4 ${floatText} hover:bg-transparent`}>
                                        Sign In
                                    </Button>
                                </Link>

                                <Link href="/auth/signup">
                                    <Button className={`rounded-full px-5 shadow-lg shadow-blue-500/20 ${isDarkMode ? "bg-white text-black hover:bg-zinc-200" : "bg-slate-900 text-white hover:bg-slate-800"}`}>
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>

            {/* Spacer for non-home pages to match fixed navbar height + top offset */}
            {!isHomePage && <div className="h-28 w-full block" aria-hidden="true" />}
        </>
    );
}
