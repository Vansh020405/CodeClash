"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, AlertCircle, RefreshCw, Copy, Check, Terminal, Save, ArrowRight } from "lucide-react";
import ProblemDescription from "@/components/ProblemDescription";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function GeneratorPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [rawDescription, setRawDescription] = useState("");
    const [sampleInput, setSampleInput] = useState("");
    const [sampleOutput, setSampleOutput] = useState("");
    const [constraints, setConstraints] = useState("");
    const [inputFormat, setInputFormat] = useState("");
    const [outputFormat, setOutputFormat] = useState("");
    const [extraTestCases, setExtraTestCases] = useState<{ input: string; output: string }[]>([]);
    const [generatedProblem, setGeneratedProblem] = useState<any>(null);
    const [error, setError] = useState("");
    const { isDarkMode } = useTheme();

    const handleAddTestCase = () => {
        if (extraTestCases.length < 10) {
            setExtraTestCases([...extraTestCases, { input: "", output: "" }]);
        }
    };

    const handleRemoveTestCase = (index: number) => {
        const newCases = [...extraTestCases];
        newCases.splice(index, 1);
        setExtraTestCases(newCases);
    };

    const handleTestCaseChange = (index: number, field: 'input' | 'output', value: string) => {
        const newCases = [...extraTestCases];
        newCases[index][field] = value;
        setExtraTestCases(newCases);
    };

    const handleNormalize = async () => {
        if (!title.trim() || !rawDescription.trim()) {
            setError("Title and Description are required");
            return;
        }

        setIsLoading(true);
        setError("");
        setGeneratedProblem(null);

        try {
            const response = await fetch("http://127.0.0.1:8000/api/ai/normalize/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    description: rawDescription,
                    input_format: inputFormat,
                    output_format: outputFormat,
                    sample_input: sampleInput,
                    sample_output: sampleOutput,
                    constraints: constraints,
                    // Only send non-empty test cases
                    extra_test_cases: extraTestCases.filter(tc => tc.input.trim() || tc.output.trim())
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to normalize problem");
            }

            setGeneratedProblem(data.problem);

            // Populate fields with declared/parsed data so user can edit them
            if (data.problem) {
                setTitle(data.problem.title || title);
                setInputFormat(data.problem.input_format || inputFormat);
                setOutputFormat(data.problem.output_format || outputFormat);

                // Handle constraints - if it's a string, use it, if object (rare from updated backend format), ignore
                if (typeof data.problem.constraints === 'string') {
                    setConstraints(data.problem.constraints);
                }

                // If the backend parsed different test cases, we might want to update sampleInput/Output
                // But let's keep the user's sample input/output as is, unless they are empty
                if (data.problem.test_cases && data.problem.test_cases.length > 0) {
                    // Check if we gained new extraction info
                    // For now, we leave the sample input/output fields alone to avoid confusing overwrite
                }
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!generatedProblem) return;

        setIsSaving(true);

        // Merge current form state into the problem data to ensure edits are saved
        const finalProblemData = {
            ...generatedProblem,
            title: title,
            description: rawDescription, // Use the current raw description from textarea
            input_format: inputFormat,
            output_format: outputFormat,
            constraints: constraints,
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/api/ai/save/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    problem_data: finalProblemData
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to save problem");
            }

            // Redirect to the new problem page
            if (data.problem && data.problem.slug) {
                router.push(`/problem/${data.problem.slug}`);
            } else {
                router.push("/problems");
            }

        } catch (err: any) {
            setError(err.message);
            setIsSaving(false);
        }
    };

    const handleLoadTemplate = () => {
        setTitle("Delete Nodes Greater Than X");
        setRawDescription(`Imagine you have a chain (a linked list) of individual quiz scores. You are giving out a special prize, but only for scores less than or equal to a specific limit X.
Throw out (delete) any score that is too high (greater than X).`);
        setInputFormat("The first line contains an integer T (number of test cases). For each test case:\nThe first line contains N (number of nodes) and X (limit).\nThe second line contains N space-separated integers representing the list values.");
        setOutputFormat("For each test case, print the space-separated values of the modified linked list.");
        setSampleInput("6\n3\n2\n4\n3\n6\n5\n1");
        setSampleOutput("2 3 1");
        setConstraints("1 <= N <= 10^5\n1 <= X <= 1000");
        setExtraTestCases([]);
    };

    const pageBg = isDarkMode ? "bg-[#0a0a0a]" : "bg-slate-50";
    const panelBg = isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-slate-200 shadow-xl";
    const inputBg = isDarkMode ? "bg-[#262626] border-zinc-700 text-zinc-300 placeholder:text-zinc-600" : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400";
    const labelColor = isDarkMode ? "text-zinc-300" : "text-slate-600";
    const textColor = isDarkMode ? "text-zinc-100" : "text-slate-900";

    return (
        <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${pageBg} ${textColor}`}>
            <Navbar />

            <div className="flex-1 max-w-7xl mx-auto w-full p-6 flex gap-6 overflow-hidden">
                {/* Left Panel - Input */}
                <div className={`w-1/2 flex flex-col gap-4 p-6 rounded-xl border overflow-y-auto custom-scrollbar ${panelBg}`}>
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                            Problem Standardizer
                        </h1>
                        <Button variant="outline" size="sm" onClick={handleLoadTemplate} className={`text-xs h-8 bg-transparent border hover:bg-opacity-20 ${isDarkMode ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-400' : 'border-slate-300 hover:bg-slate-100 text-slate-500'}`}>
                            <RefreshCw size={12} className="mr-2" />
                            Load Template
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className={`text-sm font-medium ${labelColor}`}>Problem Title <span className="text-red-500">*</span></label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Remove Elements Greater Than X"
                                className={`border ${inputBg}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className={`text-sm font-medium ${labelColor}`}>Problem Description <span className="text-red-500">*</span></label>
                            <textarea
                                value={rawDescription}
                                onChange={(e) => setRawDescription(e.target.value)}
                                placeholder="Paste your raw problem statement here..."
                                className={`w-full min-h-[150px] border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-green-500/50 font-mono text-sm resize-none ${inputBg}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className={`text-sm font-medium ${labelColor}`}>Constraints (Optional)</label>
                            <textarea
                                value={constraints}
                                onChange={(e) => setConstraints(e.target.value)}
                                placeholder="e.g. 1 <= N <= 10^5"
                                className={`w-full min-h-[80px] border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-green-500/50 font-mono text-sm resize-none ${inputBg}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className={`text-sm font-medium ${labelColor}`}>Input Format (Optional)</label>
                            <textarea
                                value={inputFormat}
                                onChange={(e) => setInputFormat(e.target.value)}
                                placeholder="e.g. The first line contains an integer T..."
                                className={`w-full min-h-[80px] border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-green-500/50 font-mono text-sm resize-none ${inputBg}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className={`text-sm font-medium ${labelColor}`}>Output Format (Optional)</label>
                            <textarea
                                value={outputFormat}
                                onChange={(e) => setOutputFormat(e.target.value)}
                                placeholder="e.g. Print the maximum sum..."
                                className={`w-full min-h-[80px] border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-green-500/50 font-mono text-sm resize-none ${inputBg}`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${labelColor}`}>Sample Input</label>
                                <textarea
                                    value={sampleInput}
                                    onChange={(e) => setSampleInput(e.target.value)}
                                    placeholder="Input..."
                                    className={`w-full border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-green-500/50 font-mono text-xs h-32 resize-none ${inputBg}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${labelColor}`}>Sample Output</label>
                                <textarea
                                    value={sampleOutput}
                                    onChange={(e) => setSampleOutput(e.target.value)}
                                    placeholder="Output..."
                                    className={`w-full border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-green-500/50 font-mono text-xs h-32 resize-none ${inputBg}`}
                                />
                            </div>
                        </div>

                        {/* Extra Test Cases UI */}
                        <div className={`space-y-3 pt-2 border-t ${isDarkMode ? 'border-zinc-800' : 'border-slate-200'}`}>
                            <div className="flex items-center justify-between">
                                <label className={`text-sm font-medium ${labelColor}`}>
                                    Extra Test Cases (Optional, Max 10)
                                </label>
                                {extraTestCases.length < 10 && (
                                    <Button
                                        onClick={handleAddTestCase}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                    >
                                        + Add Case
                                    </Button>
                                )}
                            </div>

                            {extraTestCases.map((tc, idx) => (
                                <div key={idx} className={`grid grid-cols-2 gap-2 p-2 rounded-md relative group ${isDarkMode ? 'bg-[#262626]/50' : 'bg-slate-100'}`}>
                                    <textarea
                                        value={tc.input}
                                        onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                                        placeholder={`Test Case ${idx + 1} Input`}
                                        className={`w-full border rounded p-2 text-xs h-20 resize-none ${inputBg}`}
                                    />
                                    <textarea
                                        value={tc.output}
                                        onChange={(e) => handleTestCaseChange(idx, 'output', e.target.value)}
                                        placeholder={`Test Case ${idx + 1} Output`}
                                        className={`w-full border rounded p-2 text-xs h-20 resize-none ${inputBg}`}
                                    />
                                    <button
                                        onClick={() => handleRemoveTestCase(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleNormalize}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium py-6 shadow-lg shadow-green-500/20 transition-all border-none relative overflow-hidden"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                    Standardizing & Generating Cases...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Terminal size={18} />
                                    Standardize & Generate Test Cases
                                </div>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Right Panel - Preview */}
                <div className={`w-1/2 flex flex-col rounded-xl border overflow-hidden relative ${panelBg}`}>
                    {generatedProblem ? (
                        <div className="flex flex-col h-full">
                            <div className={`h-14 border-b flex items-center justify-between px-4 ${isDarkMode ? 'bg-[#262626] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                                <span className="text-sm font-medium text-green-400 flex items-center gap-2">
                                    <Check size={14} /> Ready for Compiler
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button onClick={handleSave} disabled={isSaving} size="sm" className="h-8 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs">
                                        {isSaving ? (
                                            "Saving..."
                                        ) : (
                                            <>
                                                <Save size={14} className="mr-2" /> Save & Go to Compiler <ArrowRight size={14} className="ml-1" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className={`flex-1 overflow-auto custom-scrollbar ${isDarkMode ? 'bg-[#262626]' : 'bg-white'}`}>
                                <div className="p-2 h-full">
                                    <ProblemDescription problem={generatedProblem} previewMode={true} isDarkMode={isDarkMode} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`h-full flex flex-col items-center justify-center p-8 text-center ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-slate-100 border-slate-200'}`}>
                                <Terminal size={24} className="opacity-20" />
                            </div>
                            <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>No problem standardized yet</h3>
                            <p className="max-w-xs text-sm">
                                Submit your raw problem to convert it into a compiler-ready format with hidden test cases.
                            </p>
                        </div>
                    )}

                    {/* Overlay Loader Effect */}
                    {isLoading && (
                        <div className={`absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-10 ${isDarkMode ? 'bg-[#0a0a0a]/80' : 'bg-white/80'}`}>
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-green-500/20 rounded-full"></div>
                                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                            </div>
                            <div className="mt-4 text-green-400 font-medium animate-pulse">Running Test Case Engine...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
