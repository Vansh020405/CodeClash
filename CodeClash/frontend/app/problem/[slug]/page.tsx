"use client";
import { use, useEffect, useState } from "react";
import ProblemDescription from "@/components/ProblemDescription";
import CodeEditor from "@/components/CodeEditor";
import TestPanel from "@/components/TestPanel";
import { Button } from "@/components/ui/button";
import { Play, CloudUpload, ChevronLeft, List, Loader2 } from "lucide-react";
import axios from "axios";
import Link from "next/link";

const API_URL = "http://localhost:8000/api";

export default function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
    // Unwrap the params Promise using React.use()
    const { slug } = use(params);

    const [problem, setProblem] = useState<any>(null);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("python");
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
        <div className="h-screen flex flex-col bg-[#1a1a1a] text-zinc-300 font-sans overflow-hidden">
            {/* Navbar */}
            <div className="h-12 bg-[#0a0a0a] border-b border-zinc-800 flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-bold text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-2">
                        <ChevronLeft size={18} />
                        <span>Code<span className="text-zinc-400">Clash</span></span>
                    </Link>

                    <div className="h-6 w-px bg-zinc-700"></div>

                    <div className="flex items-center gap-2">
                        <List size={14} className="text-zinc-500" />
                        <Link href="/problems" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                            Problem List
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRun}
                        disabled={isRunning}
                        className="h-8 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 border-none gap-2 px-3 rounded"
                    >
                        {isRunning && output?.verdict === "Running..." ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : (
                            <Play size={12} className="fill-current" />
                        )}
                        Run
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isRunning}
                        className="h-8 bg-green-600 hover:bg-green-500 text-white border-none gap-2 px-3 rounded shadow-[0_0_10px_rgba(22,163,74,0.4)]"
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
            <div className="flex-1 flex overflow-hidden p-2 gap-2 bg-[#0a0a0a]">
                {/* Left Panel: Description */}
                <div className="w-1/2 h-full">
                    <ProblemDescription problem={problem} />
                </div>

                {/* Right Panel: Code + Console */}
                <div className="w-1/2 flex flex-col gap-2 h-full">
                    {/* Code Editor */}
                    <div className="h-[60%] rounded-lg overflow-hidden border border-zinc-800 bg-[#1e1e1e]">
                        <CodeEditor
                            language={language}
                            setLanguage={setLanguage}
                            code={code}
                            onChange={(val) => setCode(val || "")}
                        />
                    </div>

                    {/* Console Panel */}
                    <div className="h-[40%] rounded-lg overflow-hidden border border-zinc-800 bg-[#262626]">
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
