"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Save, Copy, FileText, TestTube, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";
import Navbar from "@/components/Navbar";

const API_URL = "http://localhost:8000/api";

export default function AdminGeneratorPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Hooks must be at the top level
    const [sampleProblem, setSampleProblem] = useState("");
    const [sampleTestCases, setSampleTestCases] = useState("");
    const [generating, setGenerating] = useState(false);
    const [generatedProblem, setGeneratedProblem] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

    const exampleProblem = `Find the sum of two numbers.

Given two integers a and b, write a program that returns their sum.

Input: 
First line contains integer a
Second line contains integer b

Output:
Print the sum a + b

Constraints:
-1000 <= a, b <= 1000`;

    const exampleTestCases = `Test 1:
Input: 5, 3
Output: 8

Test 2:
Input: -10, 5
Output: -5`;

    // Protect route - redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    const handleGenerate = async () => {
        setGenerating(true);
        setMessage(null);
        setGeneratedProblem(null);

        // Input validation (client-side only)
        if (!sampleProblem.trim()) {
            setMessage({ type: "error", text: "Please enter a sample problem." });
            setGenerating(false);
            return;
        }

        if (sampleProblem.trim().length < 20) {
            setMessage({ type: "error", text: "Sample problem must be at least 20 characters long." });
            setGenerating(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/ai/generate-similar/`, {
                sample_problem: sampleProblem,
                sample_test_cases: sampleTestCases || ""
            });

            const data = response.data;

            // Backend ALWAYS returns success now
            if (data.success && data.problem) {
                setGeneratedProblem(data.problem);
                setMessage({ type: "success", text: "Problem generated successfully! 🎉" });
            } else if (!data.success && data.type === "validation_error") {
                // Only validation errors are shown
                setMessage({ type: "error", text: data.message });
            } else if (!data.success && data.type === "rate_limit") {
                // Rate limit
                setMessage({ type: "error", text: data.message });
            } else {
                // This should never happen with fail-safe backend
                setMessage({ type: "error", text: "Unexpected response. Please try again." });
            }

        } catch (error: any) {
            console.error("Generator Error:", error);

            // Network errors only (not AI errors)
            let errorMsg = "Network error. Please check your connection.";
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = error.message;
            }

            setMessage({
                type: "error",
                text: errorMsg
            });
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedProblem) return;

        setSaving(true);
        setMessage(null);

        try {
            const response = await axios.post(`${API_URL}/ai/save/`, {
                problem_data: generatedProblem,
                user_email: session?.user?.email
            });

            setMessage({
                type: "success",
                text: `Problem '${response.data.problem.title}' saved! Visit /problem/${response.data.problem.slug}`
            });

            // Clear after successful save
            setTimeout(() => {
                setSampleProblem("");
                setSampleTestCases("");
                setGeneratedProblem(null);
            }, 3000);
        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.response?.data?.error || "Failed to save problem"
            });
        } finally {
            setSaving(false);
        }
    };

    const loadExample = () => {
        setSampleProblem(exampleProblem);
        setSampleTestCases(exampleTestCases);
    };

    // Show loading while checking auth
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
                <div className="text-zinc-400">Loading...</div>
            </div>
        );
    }

    // Don't render content if not authenticated (redirect handled by useEffect)
    if (status === "unauthenticated") {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-zinc-300">
            <Navbar />
            {/* Header */}
            <div className="bg-[#0a0a0a] border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-blue-500" size={24} />
                        <div>
                            <h1 className="text-2xl font-bold text-white">AI Problem Generator</h1>
                            <p className="text-sm text-zinc-500">Transform college problems into LeetCode-style challenges</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Message Bar */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === "success"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                        {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Input */}
                    <div className="space-y-6">
                        <div className="bg-[#262626] rounded-lg border border-zinc-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <FileText size={18} className="text-blue-500" />
                                    Paste Your College Problem
                                </h2>
                                <Button
                                    onClick={loadExample}
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-zinc-400 hover:text-zinc-200"
                                >
                                    Load Example
                                </Button>
                            </div>

                            {/* Problem Input */}
                            <div className="space-y-2 mb-4">
                                <label className="text-sm font-medium text-zinc-400">
                                    Problem Statement <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={sampleProblem}
                                    onChange={(e) => setSampleProblem(e.target.value)}
                                    placeholder={`Paste your college problem here...\n\nExample:\n"Find the maximum element in an array...\nInput: Array of integers\nOutput: Maximum value"`}
                                    className="w-full h-64 bg-zinc-800 border border-zinc-700 rounded-md p-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none console-scrollbar"
                                />
                                <p className="text-xs text-zinc-500">
                                    {sampleProblem.length} characters
                                </p>
                            </div>

                            {/* Test Cases Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                    <TestTube size={14} />
                                    Sample Test Cases <span className="text-zinc-600">(Optional)</span>
                                </label>
                                <textarea
                                    value={sampleTestCases}
                                    onChange={(e) => setSampleTestCases(e.target.value)}
                                    placeholder={`Example test cases (optional):\n\nInput: [1,2,3,4,5]\nOutput: 5\n\nInput: [-1,-5,0]\nOutput: 0`}
                                    className="w-full h-32 bg-zinc-800 border border-zinc-700 rounded-md p-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none console-scrollbar"
                                />
                            </div>

                            {/* Generate Button */}
                            <Button
                                onClick={handleGenerate}
                                disabled={generating || !sampleProblem.trim()}
                                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-6"
                            >
                                {generating ? (
                                    <>
                                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Generating a fresh problem...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} className="mr-2" />
                                        Generate LeetCode-Style Problem
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-zinc-500 mt-3 text-center">
                                AI will analyze your problem and generate a similar one with professional formatting
                            </p>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="space-y-6">
                        {generatedProblem ? (
                            <div className="bg-[#262626] rounded-lg border border-zinc-800 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-white">Generated Problem</h2>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-green-600 hover:bg-green-500"
                                    >
                                        {saving ? "Saving..." : (
                                            <>
                                                <Save size={16} className="mr-2" />
                                                Save to Platform
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Title */}
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-white mb-2">{generatedProblem.title}</h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${generatedProblem.difficulty === "Easy" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                                            generatedProblem.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                                                "bg-red-500/20 text-red-400 border border-red-500/30"
                                            }`}>
                                            {generatedProblem.difficulty}
                                        </span>
                                        {generatedProblem.topics?.map((t: string) => (
                                            <span key={t} className="px-2 py-1 rounded text-xs bg-zinc-700/50 text-zinc-300 border border-zinc-600">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Concept Analysis */}
                                {generatedProblem.concept_analysis && (
                                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                        <p className="text-xs font-semibold text-blue-400 mb-1">AI Analysis:</p>
                                        <p className="text-sm text-zinc-300">{generatedProblem.concept_analysis}</p>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-zinc-400 mb-2">Description</h4>
                                    <div className="text-sm text-zinc-300 whitespace-pre-wrap bg-zinc-800/50 p-3 rounded max-h-64 overflow-auto console-scrollbar">
                                        {generatedProblem.description}
                                    </div>
                                </div>

                                {/* Test Cases */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-zinc-400 mb-2">
                                        Test Cases ({generatedProblem.test_cases?.length || 0})
                                    </h4>
                                    <div className="space-y-2 max-h-48 overflow-auto console-scrollbar">
                                        {generatedProblem.test_cases?.slice(0, 3).map((tc: any, idx: number) => (
                                            <div key={idx} className="bg-zinc-800/50 p-2 rounded text-xs">
                                                <div className="flex gap-2">
                                                    <span className="text-green-400 font-mono">Input:</span>
                                                    <span className="text-zinc-300">{tc.input}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-blue-400 font-mono">Output:</span>
                                                    <span className="text-zinc-300">{tc.output}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {generatedProblem.test_cases?.length > 3 && (
                                            <p className="text-xs text-zinc-500 italic">
                                                +{generatedProblem.test_cases.length - 3} more hidden test cases
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Complexity */}
                                {generatedProblem.time_complexity && (
                                    <div className="flex gap-4 text-xs">
                                        <div>
                                            <span className="text-zinc-500">Time:</span>{" "}
                                            <span className="text-zinc-300 font-mono">{generatedProblem.time_complexity}</span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-500">Space:</span>{" "}
                                            <span className="text-zinc-300 font-mono">{generatedProblem.space_complexity}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-[#262626] rounded-lg border border-zinc-800 border-dashed p-12 text-center h-full flex flex-col items-center justify-center">
                                <Sparkles size={48} className="mx-auto mb-4 text-zinc-600" />
                                <p className="text-zinc-500 font-medium mb-2">No problem generated yet</p>
                                <p className="text-sm text-zinc-600 max-w-md">
                                    Paste your college problem on the left and click "Generate" to see an AI-created LeetCode-style version
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* How It Works */}
                <div className="mt-12 bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Copy className="text-blue-400" size={20} />
                            </div>
                            <p className="text-sm font-medium text-zinc-300 mb-1">1. Paste</p>
                            <p className="text-xs text-zinc-500">Your college problem</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Sparkles className="text-purple-400" size={20} />
                            </div>
                            <p className="text-sm font-medium text-zinc-300 mb-1">2. AI Analyzes</p>
                            <p className="text-xs text-zinc-500">Concepts & difficulty</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <FileText className="text-green-400" size={20} />
                            </div>
                            <p className="text-sm font-medium text-zinc-300 mb-1">3. Generates</p>
                            <p className="text-xs text-zinc-500">Similar LeetCode problem</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Save className="text-yellow-400" size={20} />
                            </div>
                            <p className="text-sm font-medium text-zinc-300 mb-1">4. Save</p>
                            <p className="text-xs text-zinc-500">To your platform</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
