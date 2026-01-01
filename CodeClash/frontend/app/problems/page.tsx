"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronLeft, Code2, CheckCircle, Circle, Clock, Trash2, Zap, Trophy, Target, Sparkles, Brain } from "lucide-react";
import axios from "axios";
import Navbar from "@/components/Navbar";

const API_URL = "http://localhost:8000/api";

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
    const { data: session } = useSession();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_URL}/problems/`)
            .then(res => {
                const data = res.data.results || res.data;
                setProblems(data);
                setFilteredProblems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
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
            await axios.delete(`${API_URL}/problems/${slug}/delete/`);
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

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-blue-500/30">
            <Navbar />

            {/* Background Ambient Glow */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px]"></div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                {/* Hero Header */}
                <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-blue-500 font-medium mb-3">
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                CodeClash Arena
                            </span>
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                            Problem Set
                        </h1>
                        <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                            Challenge yourself with curated algorithmic problems.
                            Master Data Structures, Algorithms, and System Design.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                        <StatCard label="Total" count={stats.total} icon={<Brain size={16} />} color="text-white" bg="bg-zinc-800/50" />
                        <StatCard label="Easy" count={stats.easy} icon={<Target size={16} />} color="text-emerald-400" bg="bg-emerald-500/10" />
                        <StatCard label="Medium" count={stats.medium} icon={<Zap size={16} />} color="text-amber-400" bg="bg-amber-500/10" />
                        <StatCard label="Hard" count={stats.hard} icon={<Trophy size={16} />} color="text-rose-400" bg="bg-rose-500/10" />
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="sticky top-4 z-20 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-2 mb-8 shadow-2xl shadow-black/20 ring-1 ring-white/5 mx-[-1rem] px-[1rem] lg:mx-0 lg:px-2">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <Input
                                type="text"
                                placeholder="Search by title, topic or tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 bg-zinc-900/50 border-white/5 text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-blue-500/50 rounded-xl transition-all"
                            />
                        </div>

                        {/* Difficulty Filter */}
                        <div className="flex p-1 bg-zinc-900/80 rounded-xl border border-white/5 gap-1 overflow-x-auto">
                            {["All", "Easy", "Medium", "Hard"].map(diff => (
                                <button
                                    key={diff}
                                    onClick={() => setDifficultyFilter(diff)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${difficultyFilter === diff
                                        ? "bg-zinc-800 text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                        }`}
                                >
                                    {diff}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Problems List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-zinc-500 text-sm animate-pulse">Loading challenges...</p>
                    </div>
                ) : filteredProblems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
                        <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                            <Search size={32} className="text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-300 mb-2">No problems found</h3>
                        <p className="text-zinc-500 max-w-sm">
                            We couldn't find any challenges matching your filters. Try adjusting your search query.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 px-6 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            <div className="col-span-1">Status</div>
                            <div className="col-span-6">Problem</div>
                            <div className="col-span-2">Difficulty</div>
                            <div className="col-span-2">Acceptance</div>
                            <div className="col-span-1 text-center">Action</div>
                        </div>

                        {/* List Items */}
                        <div className="space-y-2">
                            {filteredProblems.map((problem, index) => (
                                <ProblemRow
                                    key={problem.id}
                                    problem={problem}
                                    index={index}
                                    onDelete={handleDelete}
                                    userEmail={session?.user?.email}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function StatCard({ label, count, icon, color, bg }: any) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 min-w-[140px] ${bg}`}>
            <div className={`p-2 rounded-lg bg-black/20 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-xl font-bold text-white leading-none mb-1">{count}</p>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</p>
            </div>
        </div>
    );
}

function ProblemRow({ problem, index, onDelete, userEmail }: { problem: Problem; index: number; onDelete: (slug: string, e: React.MouseEvent) => void; userEmail?: string | null }) {
    const status = problem.status || "Unsolved";
    const acceptanceRate = 65 + (problem.title.length % 30); // Pseudo-random stable number

    return (
        <Link href={`/problem/${problem.slug}`} className="block group">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 hover:border-blue-500/20 rounded-xl transition-all duration-200 items-center relative overflow-hidden">

                {/* Status */}
                <div className="col-span-1 flex items-center">
                    {status === "Solved" ? (
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                            <CheckCircle size={14} className="text-green-500" />
                        </div>
                    ) : status === "Attempted" ? (
                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                            <Clock size={14} className="text-yellow-500" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center border border-white/5 group-hover:border-zinc-700 transition-colors">
                            <Circle size={14} className="text-zinc-600" />
                        </div>
                    )}
                </div>

                {/* Title */}
                <div className="col-span-11 md:col-span-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-medium text-zinc-200 group-hover:text-blue-400 transition-colors truncate">
                            {problem.title}
                        </span>
                        {problem.is_ai_generated && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                                <Sparkles size={10} className="animate-pulse" />
                                AI Generated
                            </div>
                        )}
                    </div>
                </div>

                {/* Difficulty - Hidden on mobile */}
                <div className="hidden md:flex col-span-2 items-center">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${difficultyStyles[problem.difficulty]}`}>
                        {problem.difficulty}
                    </span>
                </div>

                {/* Acceptance - Hidden on mobile */}
                <div className="hidden md:flex col-span-2 items-center text-zinc-400 text-sm font-medium">
                    <span className="group-hover:text-zinc-300 transition-colors">{acceptanceRate}%</span>
                </div>

                {/* Actions */}
                <div className="hidden md:flex col-span-1 items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-200">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                        onClick={(e) => onDelete(problem.slug, e)}
                        title="Delete Problem"
                    >
                        <Trash2 size={16} />
                    </Button>
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <ChevronLeft size={16} className="rotate-180" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
