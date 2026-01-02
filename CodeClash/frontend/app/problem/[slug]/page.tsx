"use client";
import { use, useEffect, useState } from "react";
import ProblemDescription from "@/components/ProblemDescription";
import CodeEditor from "@/components/CodeEditor";
import TestPanel from "@/components/TestPanel";
import { Button } from "@/components/ui/button";
import { Play, CloudUpload, ChevronLeft, List, Loader2 } from "lucide-react";
import axios from "axios";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
    // Unwrap the params Promise using React.use()
    const { slug } = use(params);

    const [problem, setProblem] = useState<any>(null);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("cpp");
    const [output, setOutput] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [activeTab, setActiveTab] = useState("testcases");
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    useEffect(() => {
        if (activeTab === "submissions" && problem) {
            setLoadingSubmissions(true);
            // Ideally use an axios instance with interceptors for auth
            axios.get(`${API_URL}/submissions/?problem_id=${problem.id}`)
                .then(res => setSubmissions(res.data))
                .catch(err => console.error("Failed to fetch submissions", err))
                .finally(() => setLoadingSubmissions(false));
        }
    }, [activeTab, problem]);

    useEffect(() => {
        axios.get(`${API_URL}/problems/${slug}/`)
            .then(res => {
                setProblem(res.data);
                const templates = res.data.template_code;
                if (templates && templates[language]) {
                    setCode(templates[language]);
                } else {
                    setCode("# Write your code here");
                }
            })
            .catch(err => console.error(err));
    }, [slug, language]);

    const handleRun = async () => {
        if (!problem) return;

        setIsRunning(true);
        setActiveTab("results");

        setOutput({
            verdict: "Running...",
            testcases: [],
            isLoading: true
        });

        try {
            const res = await axios.post(`${API_URL}/executor/submit/`, {
                problem_id: problem.id,
                code: code,
                language: language,
                mode: "run"
            });

            setOutput(res.data);
        } catch (error: any) {
            console.error(error);
            setOutput({
                verdict: "ERROR",
                error: error.response?.data?.error || error.message || "Execution failed",
                test_cases: []
            });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!problem) return;

        setIsRunning(true);
        setActiveTab("results");

        setOutput({
            verdict: "Judging...",
            testcases: [],
            isLoading: true
        });

        try {
            const res = await axios.post(`${API_URL}/executor/submit/`, {
                problem_id: problem.id,
                code: code,
                language: language,
                mode: "submit"
            });

            setOutput(res.data);
        } catch (error: any) {
            console.error(error);
            setOutput({
                verdict: "ERROR",
                error: error.response?.data?.error || "Submission failed",
                test_cases: []
            });
        } finally {
            setIsRunning(false);
            if (problem && problem.id) {
                axios.get(`${API_URL}/submissions/?problem_id=${problem.id}`)
                    .then(res => setSubmissions(res.data))
                    .catch(err => console.error("Failed to refresh submissions", err));
            }
        }
    };

    if (!problem) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#1a1a1a] text-zinc-400">
                <div className="animate-pulse">Loading problem...</div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#050505] text-zinc-300 font-sans overflow-hidden selection:bg-blue-500/30">
            {/* Navbar */}
            <div className="h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 z-20">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity flex items-center gap-2">
                        <ChevronLeft size={20} className="text-zinc-500" />
                        Code<span className="text-zinc-500">Clash</span>
                    </Link>

                    <div className="h-6 w-px bg-white/10"></div>

                    <Link href="/problems" className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                        <List size={16} />
                        Problem List
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRun}
                        disabled={isRunning}
                        className="h-9 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 border border-white/10 hover:border-white/20 gap-2 px-5 rounded-lg transition-all font-medium"
                    >
                        {isRunning && output?.verdict === "Running..." ? (
                            <Loader2 size={14} className="animate-spin text-blue-400" />
                        ) : (
                            <Play size={14} className="fill-current" />
                        )}
                        Run
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isRunning}
                        className="h-9 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-none gap-2 px-6 rounded-lg shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all font-medium"
                    >
                        {isRunning && output?.verdict === "Judging..." ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <CloudUpload size={14} />
                        )}
                        Submit
                    </Button>
                </div>
            </div>

            {/* Main Content - Floating Layout */}
            <div className="flex-1 flex overflow-hidden p-3 gap-3 bg-[#050505] relative">
                {/* Background Ambient Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
                    <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[100px]"></div>
                </div>

                {/* Left Panel: Description */}
                <div className="w-1/2 h-full z-10 flex flex-col">
                    <div className="flex-1 bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden shadow-2xl relative">
                        <ProblemDescription problem={problem} />
                    </div>
                </div>

                {/* Right Panel: Code + Console */}
                <div className="w-1/2 flex flex-col gap-3 h-full z-10">
                    {/* Code Editor */}
                    <div className="h-[60%] rounded-xl overflow-hidden border border-white/5 bg-[#0a0a0a] shadow-2xl relative">
                        <CodeEditor
                            language={language}
                            setLanguage={setLanguage}
                            code={code}
                            onChange={(val) => setCode(val || "")}
                        />
                    </div>

                    {/* Console Panel */}
                    <div className="flex-1 rounded-xl overflow-hidden border border-white/5 bg-[#0a0a0a] shadow-2xl relative">
                        <TestPanel
                            problem={problem}
                            output={output}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            submissions={submissions}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
