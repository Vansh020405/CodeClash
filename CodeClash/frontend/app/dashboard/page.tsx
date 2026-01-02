"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, FileText, Code2, Plus } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

interface Problem {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    created_at: string;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (status === "authenticated") {
            fetchUserProblems();
        }
    }, [status, router]);

    const fetchUserProblems = async () => {
        try {
            // In a real app, you'd filter by user_email in the backend
            // For MVP, we'll fetch all and filter client-side or assume existing API needs update
            // Let's assume we create a new endpoint or use existing list
            // For now, let's just list all problems as a placeholder until we add the filter API
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/problems/`);
            setProblems(response.data);
        } catch (error) {
            console.error("Failed to fetch problems", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-zinc-400">
                Loading dashboard...
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-300">
            <Navbar />
            {/* Header */}
            <div className="bg-[#111] border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Code2 className="text-blue-500" size={24} />
                        <h1 className="text-xl font-bold text-white">My Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-zinc-400">
                            Welcome, {session.user?.name || session.user?.email}
                        </span>
                        <Link href="/admin/generate">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                                <Plus size={16} className="mr-2" />
                                Create Problem
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <h2 className="text-2xl font-bold text-white mb-6">My Problems</h2>

                {problems.length === 0 ? (
                    <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-12 text-center">
                        <FileText size={48} className="mx-auto text-zinc-600 mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No problems created yet</h3>
                        <p className="text-zinc-500 mb-6">Start using AI to generate your first coding challenge.</p>
                        <Link href="/admin/generate">
                            <Button className="bg-blue-600 hover:bg-blue-500">
                                <Sparkles size={16} className="mr-2" />
                                Generate Problem
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {problems.map((problem) => (
                            <Link
                                key={problem.id}
                                href={`/problem/${problem.slug}`}
                                className="block group"
                            >
                                <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-all h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                            {problem.title}
                                        </h3>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                            problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs text-zinc-500 mt-auto">
                                        <span>Created {new Date(problem.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
