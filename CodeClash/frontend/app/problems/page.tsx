"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronLeft, Code2, CheckCircle, Circle, Clock, Trash2, Zap, Trophy, Target, Sparkles, Brain } from "lucide-react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/context/ThemeContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Problem = {
    id: string;
    title: string;
    slug: string;
    difficulty: "Easy" | "Medium" | "Hard";
    description: string;
    status?: string;
    created_by?: string;
    is_ai_generated?: boolean;
};

const difficultyStyles = {
    Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]",
    Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]",
    Hard: "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]",
};

export default function ProblemsPage() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
    const [loading, setLoading] = useState(true);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch problems first
                const problemsRes = await axios.get(`${API_BASE_URL}/api/problems/`);
                let problemsData = problemsRes.data.results || problemsRes.data;

                // Try to check user status (mocked or real)
                try {
                    const submissionsRes = await axios.get(`${API_BASE_URL}/api/submissions/`);
                    const submissionsData = submissionsRes.data.results || submissionsRes.data || [];

                    const solvedProblemIds = new Set(
                        submissionsData
                            .filter((s: any) => s.verdict === "Accepted")
                            .map((s: any) => s.problem.id)
                    );

                    const attemptedProblemIds = new Set(
                        submissionsData.map((s: any) => s.problem.id)
                    );

                    problemsData = problemsData.map((p: any) => {
                        if (solvedProblemIds.has(p.id)) {
                            return { ...p, status: "Solved" };
                        }
                        if (attemptedProblemIds.has(p.id)) {
                            return { ...p, status: "Attempted" };
                        }
                        return p;
                    });
                } catch (subErr) {
                    console.log("No authenticated submissions found, showing default state.");
                }

                setProblems(problemsData);
                setFilteredProblems(problemsData);
            } catch (err) {
                console.error("Failed to load problems:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let filtered = problems;

        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (difficultyFilter !== "All") {
            filtered = filtered.filter(p => p.difficulty === difficultyFilter);
        }

        setFilteredProblems(filtered);
    }, [searchQuery, difficultyFilter, problems]);

    const handleDelete = async (slug: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (!confirm("Are you sure you want to delete this problem?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/problems/${slug}/delete/`);
            const updated = problems.filter(p => p.slug !== slug);
            setProblems(updated);
            setFilteredProblems(prev => prev.filter(p => p.slug !== slug));
        } catch (err) {
            console.error(err);
            alert("Failed to delete problem");
        }
    };

    // Stats Calculation
    const stats = {
        total: problems.length,
        easy: problems.filter(p => p.difficulty === "Easy").length,
        medium: problems.filter(p => p.difficulty === "Medium").length,
        hard: problems.filter(p => p.difficulty === "Hard").length,
    };

    const pageBg = isDarkMode ? "bg-[#050505]" : "bg-slate-50";
    const textColor = isDarkMode ? "text-zinc-100" : "text-slate-900";
    const mutedText = isDarkMode ? "text-zinc-400" : "text-slate-500";

    return (
        <div className={`min-h-screen font-sans selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-300 ${pageBg} ${textColor}`}>
            <Navbar />

            {/* Premium Background Ambient Glow - Smoother & Deeper */}
            {isDarkMode && (
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[0%] left-[20%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[150px] opacity-60"></div>
                    <div className="absolute bottom-[0%] right-[10%] w-[40%] h-[60%] bg-purple-600/5 rounded-full blur-[150px] opacity-60"></div>
                    <div className="absolute top-[40%] left-[-10%] w-[30%] h-[50%] bg-emerald-600/5 rounded-full blur-[150px] opacity-40"></div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-6 py-16 relative z-10">
                {/* Hero Header with Animated Gradient Text */}
                <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-10">
                    <div className="space-y-4 max-w-2xl">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-100 border-blue-200 text-blue-600'}`}>
                            <Code2 size={12} className={isDarkMode ? "text-blue-400" : "text-blue-600"} />
                            CodeClash Arena
                        </div>
                        <h1 className={`text-6xl font-bold tracking-tight leading-tight ${textColor}`}>
                            Master the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 animate-gradient-x">
                                Art of Algorithms
                            </span>
                        </h1>
                        <p className={`text-lg leading-relaxed border-l-2 pl-4 ${isDarkMode ? 'text-zinc-400 border-zinc-800' : 'text-slate-500 border-slate-300'}`}>
                            Challenge yourself with curated algorithmic problems. <br />
                            Refine your skills in Data Structures, Systems, and Logic.
                        </p>
                    </div>

                    {/* Stats Cards - Glassmorphism & Tilt Effect */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                        <StatCard
                            label="Total"
                            count={stats.total}
                            icon={<Brain size={18} />}
                            gradient={isDarkMode ? "from-zinc-500/20 to-zinc-600/5" : "from-slate-200 to-slate-100"}
                            textColor={isDarkMode ? "text-zinc-100" : "text-slate-700"}
                            borderColor={isDarkMode ? "group-hover:border-zinc-500/50" : "group-hover:border-slate-400/50"}
                            isDarkMode={isDarkMode}
                        />
                        <StatCard
                            label="Easy"
                            count={stats.easy}
                            icon={<Target size={18} />}
                            gradient="from-emerald-500/20 to-emerald-600/5"
                            textColor="text-emerald-400"
                            borderColor="group-hover:border-emerald-500/50"
                            isDarkMode={isDarkMode}
                        />
                        <StatCard
                            label="Medium"
                            count={stats.medium}
                            icon={<Zap size={18} />}
                            gradient="from-amber-500/20 to-amber-600/5"
                            textColor="text-amber-400"
                            borderColor="group-hover:border-amber-500/50"
                            isDarkMode={isDarkMode}
                        />
                        <StatCard
                            label="Hard"
                            count={stats.hard}
                            icon={<Trophy size={18} />}
                            gradient="from-rose-500/20 to-rose-600/5"
                            textColor="text-rose-400"
                            borderColor="group-hover:border-rose-500/50"
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </div>

                {/* Filter Bar - Floating & Frosted */}
                <div className="sticky top-6 z-30 mb-8 mx-auto">
                    <div className={`backdrop-blur-xl border rounded-2xl p-3 shadow-2xl flex flex-col md:flex-row gap-4 items-center ring-1 ${isDarkMode ? 'bg-[#0a0a0a]/80 border-white/10 ring-white/5' : 'bg-white/80 border-slate-200 ring-slate-200/50'}`}>
                        {/* Search Input */}
                        <div className="flex-1 relative group w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className={`transition-colors ${isDarkMode ? 'text-zinc-500 group-focus-within:text-blue-500' : 'text-slate-400 group-focus-within:text-blue-600'}`} size={18} />
                            </div>
                            <Input
                                type="text"
                                placeholder="Search by title, topic or tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`pl-10 h-11 rounded-xl transition-all w-full ${isDarkMode
                                    ? 'bg-zinc-900/50 border-white/5 text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30'
                                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                            />
                        </div>

                        {/* Difficulty Tabs */}
                        <div className={`flex p-1 rounded-xl border gap-1 shrink-0 w-full md:w-auto overflow-x-auto ${isDarkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                            {["All", "Easy", "Medium", "Hard"].map(diff => (
                                <button
                                    key={diff}
                                    onClick={() => setDifficultyFilter(diff)}
                                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative overflow-hidden ${difficultyFilter === diff
                                        ? isDarkMode ? "text-white shadow-lg bg-zinc-800" : "text-white shadow-lg bg-slate-900"
                                        : isDarkMode ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                                        }`}
                                >
                                    <span className="relative z-10">{diff}</span>
                                    {difficultyFilter === diff && (
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Problems List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles size={20} className="text-blue-400/50 animate-pulse" />
                            </div>
                        </div>
                        <p className={`font-medium animate-pulse tracking-wide ${mutedText}`}>Initializing CodeClash Engine...</p>
                    </div>
                ) : filteredProblems.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-32 text-center rounded-3xl border border-dashed ${isDarkMode ? 'bg-zinc-900/20 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                            <Search size={40} className={isDarkMode ? "text-zinc-600" : "text-slate-400"} />
                        </div>
                        <h3 className={`text-2xl font-bold mb-2 ${textColor}`}>No Challenges Found</h3>
                        <p className={`max-w-md mx-auto ${mutedText}`}>
                            We couldn't find any challenges matching your current filters.
                            Try broadening your search or switching categories.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Table Header */}
                        <div className={`hidden md:grid grid-cols-12 px-8 py-4 text-xs font-bold uppercase tracking-widest border-b ${isDarkMode ? 'text-zinc-500 border-white/5' : 'text-slate-400 border-slate-200'}`}>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-6">Problem Title</div>
                            <div className="col-span-2">Difficulty</div>
                            <div className="col-span-2">Acceptance</div>
                            <div className="col-span-1 text-center">Solve</div>
                        </div>

                        {/* List Items */}
                        <div className="grid gap-3">
                            {filteredProblems.map((problem, index) => (
                                <ProblemRow
                                    key={problem.id}
                                    problem={problem}
                                    index={index}
                                    onDelete={handleDelete}
                                    isDarkMode={isDarkMode}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function StatCard({ label, count, icon, gradient, textColor, borderColor, isDarkMode }: any) {
    const cardBg = isDarkMode ? "bg-zinc-900/40 border-white/5 hover:bg-zinc-900/60" : "bg-white border-slate-200 hover:bg-slate-50";

    return (
        <div className={`group flex items-center gap-4 px-5 py-4 rounded-2xl border hover:shadow-xl transition-all duration-300 ${cardBg} ${borderColor}`}>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300`}>
                <div className={textColor}>{icon}</div>
            </div>
            <div>
                <p className={`text-2xl font-bold leading-none mb-1 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 group-hover:bg-clip-text group-hover:text-transparent transition-all ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {count}
                </p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
}

function ProblemRow({ problem, index, onDelete, isDarkMode }: { problem: Problem; index: number; onDelete: (slug: string, e: React.MouseEvent) => void, isDarkMode: boolean }) {
    const status = problem.status || "Unsolved";
    const acceptanceRate = 65 + (problem.title.length % 30);

    const rowBg = isDarkMode ? "bg-[#0e0e0e] hover:bg-[#121212] border-white/5" : "bg-white hover:bg-slate-50 border-slate-200";
    const titleColor = isDarkMode ? "text-zinc-100" : "text-slate-900";

    return (
        <Link href={`/problem/${problem.slug}`} className="block group relative">
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none`} />

            <div className={`grid grid-cols-12 gap-4 px-8 py-5 border hover:border-blue-500/30 rounded-2xl transition-all duration-300 items-center relative overflow-hidden group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] group-hover:translate-x-1 ${rowBg}`}>

                {/* Status Indicator */}
                <div className="col-span-1 flex items-center">
                    {status === "Solved" ? (
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_12px_rgba(34,197,94,0.2)]">
                            <CheckCircle size={18} className="text-green-500" />
                        </div>
                    ) : status === "Attempted" ? (
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <Clock size={18} className="text-amber-500" />
                        </div>
                    ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${isDarkMode ? 'bg-zinc-800/30 border-white/5 group-hover:border-zinc-700' : 'bg-slate-100 border-slate-200 group-hover:border-slate-300'}`}>
                            <Circle size={18} className={isDarkMode ? "text-zinc-700 group-hover:text-zinc-500" : "text-slate-400 group-hover:text-slate-500"} />
                        </div>
                    )}
                </div>

                {/* Title & Tags */}
                <div className="col-span-11 md:col-span-6 flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-3">
                        <span className={`text-lg font-semibold group-hover:text-blue-400 transition-colors truncate ${titleColor}`}>
                            {problem.title}
                        </span>
                        {problem.is_ai_generated && (
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-[10px] font-bold text-purple-300 uppercase tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                <Sparkles size={10} className="text-purple-400" />
                                <span>AI</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Difficulty Badge */}
                <div className="hidden md:flex col-span-2 items-center">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 ${difficultyStyles[problem.difficulty]}`}>
                        {problem.difficulty}
                    </span>
                </div>

                {/* Acceptance Rate */}
                <div className="hidden md:flex col-span-2 items-center">
                    <div className={`w-full max-w-[100px] h-1.5 rounded-full overflow-hidden mr-3 ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                        <div className="h-full bg-zinc-600 group-hover:bg-blue-500 transition-colors" style={{ width: `${acceptanceRate}%` }}></div>
                    </div>
                    <span className={`text-xs font-mono group-hover:text-zinc-300 ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>{acceptanceRate}%</span>
                </div>

                {/* Actions & Chevron */}
                <div className="hidden md:flex col-span-1 items-center justify-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
                        onClick={(e) => onDelete(problem.slug, e)}
                        title="Delete Problem"
                    >
                        <Trash2 size={16} />
                    </Button>

                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] ${isDarkMode ? 'bg-zinc-800/50 text-zinc-500' : 'bg-slate-100 text-slate-400'}`}>
                        <ChevronLeft size={18} className="rotate-180 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
