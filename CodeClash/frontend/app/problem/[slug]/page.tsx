"use client";
import { use, useEffect, useState, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import ProblemDescription from "@/components/ProblemDescription";
import CodeEditor from "@/components/CodeEditor";
import TestPanel from "@/components/TestPanel";
import { Button } from "@/components/ui/button";
import { Play, CloudUpload, ChevronLeft, List, Loader2, Sun, Moon } from "lucide-react";
import axios from "axios";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    const { isDarkMode, toggleTheme } = useTheme();

    useEffect(() => {
        if (activeTab === "submissions" && problem) {
            setLoadingSubmissions(true);
            // Ideally use an axios instance with interceptors for auth
            axios.get(`${API_BASE_URL}/api/submissions/?problem_id=${problem.id}`)
                .then(res => setSubmissions(res.data))
                .catch(err => console.error("Failed to fetch submissions", err))
                .finally(() => setLoadingSubmissions(false));
        }
    }, [activeTab, problem]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/problems/${slug}/`)
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
            const res = await axios.post(`${API_BASE_URL}/api/executor/submit/`, {
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
            const res = await axios.post(`${API_BASE_URL}/api/executor/submit/`, {
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
                axios.get(`${API_BASE_URL}/api/submissions/?problem_id=${problem.id}`)
                    .then(res => setSubmissions(res.data))
                    .catch(err => console.error("Failed to refresh submissions", err));
            }
        }
    };

    const handleSelectSubmission = (submission: any) => {
        if (!submission) return;

        // Load Code & Language
        if (submission.code) setCode(submission.code);
        if (submission.language) setLanguage(submission.language);

        // Load Results
        // Note: Historical submissions might not have detailed per-test-case data unless stored in backend
        setOutput({
            verdict: submission.verdict,
            runtime_ms: submission.runtime_ms,
            memory_kb: submission.memory_kb,
            error: submission.error,
            testcases: [], // Details not currently persisted in Submission model
            isHistory: true // Optional: Flag to valid UI that this is historical
        });

        // Switch Tab
        setActiveTab("results");
    };

    const [leftWidth, setLeftWidth] = useState(50);
    const [editorHeight, setEditorHeight] = useState(60);
    const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
    const [isDraggingVertical, setIsDraggingVertical] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);

    // Global Drag Handlers
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingHorizontal && containerRef.current) {
                e.preventDefault();
                const containerRect = containerRef.current.getBoundingClientRect();
                const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
                // constrain between 20% and 80%
                setLeftWidth(Math.min(Math.max(newWidth, 20), 80));
            }

            if (isDraggingVertical && rightPanelRef.current) {
                e.preventDefault();
                const panelRect = rightPanelRef.current.getBoundingClientRect();
                const newHeight = ((e.clientY - panelRect.top) / panelRect.height) * 100;
                // constrain between 20% and 80%
                setEditorHeight(Math.min(Math.max(newHeight, 20), 80));
            }
        };

        const handleMouseUp = () => {
            setIsDraggingHorizontal(false);
            setIsDraggingVertical(false);
            document.body.style.cursor = 'default';
        };

        if (isDraggingHorizontal || isDraggingVertical) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            // Prevent text selection while dragging
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.userSelect = '';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
        };
    }, [isDraggingHorizontal, isDraggingVertical]);

    if (!problem) {
        return (
            <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#1a1a1a] text-zinc-400' : 'bg-slate-50 text-slate-500'}`}>
                <div className="animate-pulse">Loading problem...</div>
            </div>
        );
    }

    const pageBg = isDarkMode ? "bg-[#050505]" : "bg-slate-50";
    const panelBg = isDarkMode ? "bg-[#0a0a0a]" : "bg-white";
    const textColor = isDarkMode ? "text-zinc-300" : "text-slate-700";
    const borderColor = isDarkMode ? "border-white/5" : "border-slate-200";
    const navbarBg = isDarkMode ? "bg-[#0a0a0a]/80" : "bg-white/80";

    return (
        <div className={`h-screen flex flex-col font-sans overflow-hidden selection:bg-blue-500/30 ${pageBg} ${textColor}`}>
            {/* Navbar */}
            <div className={`h-16 backdrop-blur-xl border-b flex items-center justify-between px-6 flex-shrink-0 z-20 ${navbarBg} ${borderColor}`}>
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity flex items-center gap-2">
                        <ChevronLeft size={20} className={isDarkMode ? "text-zinc-500" : "text-slate-400"} />
                        Code<span className={isDarkMode ? "text-zinc-500" : "text-slate-400"}>Clash</span>
                    </Link>

                    <div className={`h-6 w-px ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>

                    <Link href="/problems" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                        <List size={16} />
                        Problem List
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-lg transition-colors mr-2 ${isDarkMode ? 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'}`}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRun}
                        disabled={isRunning}
                        className={`h-9 gap-2 px-5 rounded-lg transition-all font-medium border ${isDarkMode ? 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 border-white/10 hover:border-white/20' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'}`}
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

            {/* Main Content - Resizable Layout */}
            <div
                ref={containerRef}
                className={`flex-1 flex overflow-hidden relative p-2 ${pageBg}`}
            >
                {/* Background Ambient Effects */}
                {isDarkMode && (
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
                        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[100px]"></div>
                    </div>
                )}

                {/* Left Panel: Description */}
                <div
                    className="h-full z-10 flex flex-col min-w-[20%]"
                    style={{ width: `${leftWidth}%` }}
                >
                    <div className={`flex-1 rounded-xl border overflow-hidden shadow-2xl relative ${panelBg} ${borderColor}`}>
                        <ProblemDescription problem={problem} isDarkMode={isDarkMode} />
                    </div>
                </div>

                {/* Horizontal Resizer Handle */}
                <div
                    className={`w-4 cursor-col-resize z-20 flex items-center justify-center group transition-colors flex-shrink-0 ${isDarkMode ? 'hover:bg-white/5 active:bg-blue-500/20' : 'hover:bg-slate-200 active:bg-blue-100'}`}
                    onMouseDown={() => {
                        setIsDraggingHorizontal(true);
                        document.body.style.cursor = 'col-resize';
                    }}
                >
                    <div className={`w-[1px] h-8 transition-colors ${isDarkMode ? 'bg-zinc-800 group-hover:bg-blue-500/50' : 'bg-slate-300 group-hover:bg-blue-400/50'}`}></div>
                </div>

                {/* Right Panel: Code + Console */}
                <div
                    ref={rightPanelRef}
                    className="flex-1 flex flex-col h-full z-10 min-w-[20%]"
                    style={{ width: `${100 - leftWidth}%` }}
                >
                    {/* Code Editor */}
                    <div
                        className={`rounded-xl overflow-hidden border shadow-2xl relative min-h-[10%] ${panelBg} ${borderColor}`}
                        style={{ height: `${editorHeight}%` }}
                    >
                        <CodeEditor
                            language={language}
                            setLanguage={setLanguage}
                            code={code}
                            onChange={(val) => setCode(val || "")}
                            onReset={() => {
                                const templates = problem.template_code;
                                if (templates && templates[language]) {
                                    setCode(templates[language]);
                                } else {
                                    setCode("# Write your code here");
                                }
                            }}
                            toggleFullScreen={() => {
                                alert("Fullscreen mode specific to the editor panel can be implemented here.");
                            }}
                            isDarkMode={isDarkMode}
                        />
                    </div>

                    {/* Vertical Resizer Handle */}
                    <div
                        className={`h-4 cursor-row-resize z-20 flex items-center justify-center group transition-colors flex-shrink-0 ${isDarkMode ? 'hover:bg-white/5 active:bg-blue-500/20' : 'hover:bg-slate-200 active:bg-blue-100'}`}
                        onMouseDown={() => {
                            setIsDraggingVertical(true);
                            document.body.style.cursor = 'row-resize';
                        }}
                    >
                        <div className={`h-[1px] w-8 transition-colors ${isDarkMode ? 'bg-zinc-800 group-hover:bg-blue-500/50' : 'bg-slate-300 group-hover:bg-blue-400/50'}`}></div>
                    </div>

                    {/* Console Panel */}
                    <div className={`flex-1 rounded-xl overflow-hidden border shadow-2xl relative min-h-[10%] ${panelBg} ${borderColor}`}>
                        <TestPanel
                            problem={problem}
                            output={output}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            submissions={submissions}
                            onSelectSubmission={handleSelectSubmission}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
