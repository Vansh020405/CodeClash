"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, ArrowRight, CheckCircle2, AlertCircle, FileText, Code2, Database, Layout, Rocket, Loader2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProblemParserPage() {
    const router = useRouter();
    const [rawInput, setRawInput] = useState("");
    const [parsedData, setParsedData] = useState<any>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { isDarkMode } = useTheme();

    // Enhanced Parsing Logic
    const handleParse = () => {
        setIsParsing(true);

        setTimeout(() => {
            const text = rawInput.trim();
            const lines = text.split('\n').map(l => l.trimStart()); // keep trailing for formatting if needed, but trim start

            // 1. Title (First non-empty line)
            const title = lines.find(l => l.trim() !== "") || "Untitled Problem";

            // Helper to extract section content - robust version
            const extractSection = (startMarker: string, endMarkers: string[]) => {
                const startIndex = lines.findIndex(l => l.toLowerCase().startsWith(startMarker.toLowerCase()));
                if (startIndex === -1) return "";

                let endIndex = lines.length;
                for (const marker of endMarkers) {
                    // Search for end marker *after* the start marker
                    const idx = lines.findIndex((l, i) => i > startIndex && l.toLowerCase().startsWith(marker.toLowerCase()));
                    if (idx !== -1 && idx < endIndex) {
                        endIndex = idx;
                    }
                }

                // Exclude the header line itself
                return lines.slice(startIndex + 1, endIndex).join('\n').trim();
            };

            // 2. Extracted Sections
            const inputFormat = extractSection("Input Format", ["Constraints", "Output Format", "Sample Input", "Explanation", "ANSWER"]);
            const constraintsRaw = extractSection("Constraints", ["Output Format", "Sample Input", "Input Format", "Explanation", "ANSWER"]);
            const outputFormat = extractSection("Output Format", ["Sample Input", "Explanation", "ANSWER", "Constraints"]);

            // 3. Description parsing (Everything before "Input Format" or "Constraints")
            let descriptionEndIndex = lines.length;
            ["Input Format:", "Input Format", "Constraints:", "Constraints", "Output Format", "Sample Input"].forEach(keyword => {
                const idx = lines.findIndex((l, i) => i > 0 && l.toLowerCase().startsWith(keyword.toLowerCase()));
                if (idx !== -1 && idx < descriptionEndIndex) descriptionEndIndex = idx;
            });
            // Skip title line for description
            const description = lines.slice(lines.indexOf(title) + 1, descriptionEndIndex).join('\n').trim();

            // 4. Parsing Test Cases
            const testCases = [];

            // 4a. Parse Sample Cases (e.g. "Sample Input 1", "Sample Output 1", "Explanation 1")
            // BETTER STRATEGY: Scan for ALL "Sample Input" blocks
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].toLowerCase().startsWith("sample input")) {
                    // Found a sample case start
                    let inputLines = [];
                    let outputLines = [];
                    let explanationLines = [];
                    let stage = 'input'; // input, output, explanation

                    let j = i + 1;
                    while (j < lines.length) {
                        const line = lines[j];
                        const lower = line.toLowerCase();

                        // Stop if we hit new section
                        if (lower.startsWith("answer:") || lower.startsWith("test case") || lower.startsWith("sample input")) {
                            break;
                        }

                        if (lower.startsWith("sample output") || lower.startsWith("output:")) {
                            stage = 'output';
                            j++;
                            continue;
                        }
                        if (lower.startsWith("explanation")) {
                            stage = 'explanation';
                            j++;
                            continue;
                        }

                        if (stage === 'input') inputLines.push(line);
                        else if (stage === 'output') outputLines.push(line);
                        else if (stage === 'explanation') explanationLines.push(line);

                        j++;
                    }

                    if (inputLines.length > 0 && outputLines.length > 0) {
                        testCases.push({
                            input: inputLines.join('\n').trim(),
                            output: outputLines.join('\n').trim(),
                            explanation: explanationLines.join('\n').trim()
                        });
                    }
                }
            }

            // 4b. Parse "ANSWER:" section
            const answerSectionIndex = lines.findIndex(l => l.includes("ANSWER:") || l.includes("Test case 1"));

            if (answerSectionIndex !== -1) {
                let currentInputLines: string[] = [];
                let currentOutputLines: string[] = [];
                let currentExplanationLines: string[] = [];
                let state: 'idle' | 'input' | 'output' | 'explanation' = 'idle';

                for (let i = answerSectionIndex; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line || line.toLowerCase() === "answer:") continue; // Skip empty lines and "ANSWER:" header

                    // Check for new test case start
                    if (line.toLowerCase().startsWith("test case")) {
                        // Save previous case
                        if (currentInputLines.length > 0 && currentOutputLines.length > 0) {
                            testCases.push({
                                input: currentInputLines.join('\n').trim(),
                                output: currentOutputLines.join('\n').trim(),
                                explanation: currentExplanationLines.join('\n').trim()
                            });
                            currentInputLines = [];
                            currentOutputLines = [];
                            currentExplanationLines = [];
                        }
                        state = 'idle';
                        continue;
                    }

                    if (line.toLowerCase() === "input:") {
                        state = 'input';
                        continue;
                    }
                    if (line.toLowerCase() === "output:") {
                        state = 'output';
                        continue;
                    }
                    // Detect "Explanation" or "Explanation 1"
                    if (line.toLowerCase().startsWith("explanation")) {
                        state = 'explanation';
                        continue;
                    }

                    if (state === 'input') {
                        currentInputLines.push(line);
                    } else if (state === 'output') {
                        currentOutputLines.push(line);
                    } else if (state === 'explanation') {
                        currentExplanationLines.push(line);
                    }
                }
                // Push last case
                if (currentInputLines.length > 0 && currentOutputLines.length > 0) {
                    testCases.push({
                        input: currentInputLines.join('\n').trim(),
                        output: currentOutputLines.join('\n').trim(),
                        explanation: currentExplanationLines.join('\n').trim()
                    });
                }
            }

            setParsedData({
                title,
                description,
                inputFormat,
                outputFormat,
                constraints: constraintsRaw.split('\n').filter(c => c.trim().length > 0),
                testCases: testCases,
                tags: [] // remove static tags
            });
            setIsParsing(false);
        }, 800);
    };

    const handlePushToProblems = async () => {
        if (!parsedData) return;
        setIsSaving(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/ai/save/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    problem_data: {
                        title: parsedData.title,
                        description: parsedData.description,
                        input_format: parsedData.inputFormat,
                        output_format: parsedData.outputFormat,
                        constraints: Array.isArray(parsedData.constraints) ? parsedData.constraints.join('\n') : parsedData.constraints,
                        difficulty: "Medium",
                        test_cases: parsedData.testCases.map((tc: any) => ({
                            input: tc.input,
                            output: tc.output,
                            explanation: tc.explanation || "" // Use parsed explanation
                        }))
                    }
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to save problem");
            }

            // Success - Redirect
            router.push("/problems");
        } catch (error) {
            console.error("Failed to push problem:", error);
            alert("Failed to save problem. See console for details.");
        } finally {
            setIsSaving(false);
        }
    };

    const pageBg = isDarkMode ? "bg-[#050505]" : "bg-slate-50";
    const textColor = isDarkMode ? "text-zinc-100" : "text-slate-900";
    const panelBg = isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200";
    const headerBg = isDarkMode ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50/50";
    const inputBg = isDarkMode ? "bg-zinc-900 border-white/5 text-zinc-300" : "bg-slate-50 border-slate-200 text-slate-800";
    const mutedText = isDarkMode ? "text-zinc-400" : "text-slate-500";
    const labelColor = isDarkMode ? "text-zinc-500" : "text-slate-400";

    return (
        <div className={`min-h-screen font-sans selection:bg-blue-500/30 transition-colors duration-300 ${pageBg} ${textColor}`}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Raw Problem Parser
                    </h1>
                    <p className={`max-w-2xl mx-auto text-lg ${mutedText}`}>
                        Paste unstructured problem text below. Our engine will smartly segregate it into
                        title, description, constraints, and test cases.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 h-[800px]">
                    {/* Left Column: Raw Input */}
                    <div className={`flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl border ${panelBg}`}>
                        <div className={`flex items-center justify-between px-4 py-3 border-b ${headerBg}`}>
                            <div className={`flex items-center gap-2 font-medium text-sm ${mutedText}`}>
                                <FileText size={16} className="text-blue-400" />
                                Raw Input Text
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRawInput("")}
                                className={`h-8 text-xs hover:bg-white/5 ${isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                            >
                                Clear
                            </Button>
                        </div>
                        <div className="flex-1 p-0 relative">
                            <textarea
                                value={rawInput}
                                onChange={(e) => setRawInput(e.target.value)}
                                placeholder="Paste your problem text here..."
                                className={`w-full h-full bg-transparent p-5 text-sm font-mono resize-none focus:outline-none custom-scrollbar ${isDarkMode ? 'text-zinc-300 placeholder:text-zinc-700' : 'text-slate-700 placeholder:text-slate-400'}`}
                                spellCheck={false}
                            />
                            {rawInput && !parsedData && !isParsing && (
                                <div className="absolute bottom-6 right-6">
                                    <Button
                                        onClick={handleParse}
                                        className="rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20"
                                    >
                                        Parse Content <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Structured Output */}
                    <div className={`flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl border relative ${panelBg}`}>
                        {/* Loading Overlay */}
                        {isParsing && (
                            <div className={`absolute inset-0 backdrop-blur-sm z-20 flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]/90' : 'bg-white/90'}`}>
                                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                                <div className={`font-mono text-sm animate-pulse ${mutedText}`}>Analyzing text structure...</div>
                            </div>
                        )}

                        <div className={`flex items-center justify-between px-4 py-3 border-b ${headerBg}`}>
                            <div className={`flex items-center gap-2 font-medium text-sm ${mutedText}`}>
                                <Layout size={16} className="text-green-400" />
                                Structured Data
                            </div>
                            <div className="flex items-center gap-3">
                                {parsedData && (
                                    <>
                                        <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                            <CheckCircle2 size={12} />
                                            Parsed Successfully
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={handlePushToProblems}
                                            disabled={isSaving}
                                            className="h-7 text-xs bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/50 shadow-lg shadow-blue-500/20"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 size={12} className="mr-1.5 animate-spin" />
                                                    Pushing...
                                                </>
                                            ) : (
                                                <>
                                                    <Rocket size={12} className="mr-1.5" />
                                                    Push to Problems
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-8">
                            {!parsedData ? (
                                <div className={`h-full flex flex-col items-center justify-center space-y-4 ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'}`}>
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-zinc-900 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
                                        <Database size={24} className="opacity-50" />
                                    </div>
                                    <p className="text-sm">Waiting for input...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Title Section */}
                                    <div className="group relative">
                                        <div className="absolute -left-3 top-0 bottom-0 w-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <label className={`text-[10px] uppercase font-bold tracking-widest mb-1.5 block ${labelColor}`}>Problem Title</label>
                                        <div className={`text-xl font-bold p-3 rounded-lg border ${isDarkMode ? 'text-white bg-white/5 border-white/5' : 'text-slate-900 bg-slate-50 border-slate-200'}`}>
                                            {parsedData.title}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className={`text-[10px] uppercase font-bold tracking-widest mb-1.5 block ${labelColor}`}>Description</label>
                                        <div className={`text-sm leading-relaxed p-4 rounded-xl border font-serif whitespace-pre-wrap ${isDarkMode ? 'text-zinc-300 bg-zinc-900/50 border-white/5' : 'text-slate-700 bg-slate-50 border-slate-200'}`}>
                                            {parsedData.description}
                                        </div>
                                    </div>

                                    {/* IO Format & Constraints Grid */}
                                    <div className="grid grid-cols-1 gap-6">
                                        {parsedData.inputFormat && (
                                            <div>
                                                <label className={`text-[10px] uppercase font-bold tracking-widest mb-1.5 block ${labelColor}`}>Input Format</label>
                                                <div className={`text-xs p-3 rounded-lg border whitespace-pre-wrap ${inputBg}`}>
                                                    {parsedData.inputFormat}
                                                </div>
                                            </div>
                                        )}
                                        {parsedData.outputFormat && (
                                            <div>
                                                <label className={`text-[10px] uppercase font-bold tracking-widest mb-1.5 block ${labelColor}`}>Output Format</label>
                                                <div className={`text-xs p-3 rounded-lg border whitespace-pre-wrap ${inputBg}`}>
                                                    {parsedData.outputFormat}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Constraints */}
                                    {parsedData.constraints && parsedData.constraints.length > 0 && (
                                        <div>
                                            <label className={`text-[10px] uppercase font-bold tracking-widest mb-1.5 block ${labelColor}`}>Constraints</label>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {parsedData.constraints.map((c: string, i: number) => (
                                                    <li key={i} className={`text-xs px-3 py-2 rounded border font-mono flex items-center gap-2 ${inputBg}`}>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                        {c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Test Cases */}
                                    {parsedData.testCases && parsedData.testCases.length > 0 && (
                                        <div>
                                            <label className={`text-[10px] uppercase font-bold tracking-widest mb-1.5 block ${labelColor}`}>Extracted Test Cases ({parsedData.testCases.length})</label>
                                            <div className="space-y-3">
                                                {parsedData.testCases.map((tc: any, i: number) => (
                                                    <div key={i} className={`flex flex-col border rounded-lg text-xs font-mono overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
                                                        <div className={`flex gap-4 p-3 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                                            <div className="flex-1">
                                                                <span className={`text-[10px] uppercase font-bold mb-1 block ${labelColor}`}>Input</span>
                                                                <div className="text-blue-200 bg-blue-500/5 p-2 rounded border border-blue-500/10 whitespace-pre-wrap" style={{ color: isDarkMode ? '#BFDBFE' : '#1e40af' }}>{tc.input}</div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <span className={`text-[10px] uppercase font-bold mb-1 block ${labelColor}`}>Output</span>
                                                                <div className="text-green-200 bg-green-500/5 p-2 rounded border border-green-500/10 whitespace-pre-wrap" style={{ color: isDarkMode ? '#BBF7D0' : '#166534' }}>{tc.output}</div>
                                                            </div>
                                                        </div>
                                                        {tc.explanation && (
                                                            <div className={`p-3 border-t ${isDarkMode ? 'bg-[#121212] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <div className="w-0.5 h-2 bg-blue-500 rounded-full"></div>
                                                                    <span className={`text-[10px] uppercase font-bold ${labelColor}`}>Explanation</span>
                                                                </div>
                                                                <div className={`pl-3 leading-relaxed opacity-90 whitespace-pre-wrap ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                                                                    {tc.explanation}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
