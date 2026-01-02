"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, ArrowRight, CheckCircle2, AlertCircle, FileText, Code2, Database, Layout, Rocket, Loader2 } from "lucide-react";

export default function ProblemParserPage() {
    const router = useRouter();
    const [rawInput, setRawInput] = useState("");
    const [parsedData, setParsedData] = useState<any>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
            ["Input Format:", "Input Format", "Constraints:", "Constraints", "Output Format"].forEach(keyword => {
                const idx = lines.findIndex((l, i) => i > 0 && l.toLowerCase().startsWith(keyword.toLowerCase()));
                if (idx !== -1 && idx < descriptionEndIndex) descriptionEndIndex = idx;
            });
            // Skip title line for description
            const description = lines.slice(lines.indexOf(title) + 1, descriptionEndIndex).join('\n').trim();

            // 4. Parsing Test Cases from "ANSWER:" section
            const testCases = [];

            // Find where "ANSWER:" or similar test case section starts
            const answerSectionIndex = lines.findIndex(l => l.includes("ANSWER:") || l.includes("Test case 1"));

            if (answerSectionIndex !== -1) {
                let currentInputLines: string[] = [];
                let currentOutputLines: string[] = [];
                let state: 'idle' | 'input' | 'output' = 'idle';

                for (let i = answerSectionIndex; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    if (line.toLowerCase().startsWith("test case")) {
                        // If we were parsing a previous case, save it
                        if (currentInputLines.length > 0 && currentOutputLines.length > 0) {
                            testCases.push({
                                input: currentInputLines.join('\n').trim(),
                                output: currentOutputLines.join('\n').trim()
                            });
                            currentInputLines = [];
                            currentOutputLines = [];
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

                    if (state === 'input') {
                        currentInputLines.push(line);
                    } else if (state === 'output') {
                        currentOutputLines.push(line);
                    }
                }
                // Push last case
                if (currentInputLines.length > 0 && currentOutputLines.length > 0) {
                    testCases.push({
                        input: currentInputLines.join('\n').trim(),
                        output: currentOutputLines.join('\n').trim()
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
                tags: [] // remove static tags as they aren't in input
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
                            explanation: "Parsed from raw input"
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

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-blue-500/30">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Raw Problem Parser
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                        Paste unstructured problem text below. Our engine will smartly segregate it into
                        title, description, constraints, and test cases.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 h-[800px]">
                    {/* Left Column: Raw Input */}
                    <div className="flex flex-col h-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-2 text-zinc-400 font-medium text-sm">
                                <FileText size={16} className="text-blue-400" />
                                Raw Input Text
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRawInput("")}
                                className="h-8 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                            >
                                Clear
                            </Button>
                        </div>
                        <div className="flex-1 p-0 relative">
                            <textarea
                                value={rawInput}
                                onChange={(e) => setRawInput(e.target.value)}
                                placeholder="Paste your problem text here..."
                                className="w-full h-full bg-transparent p-5 text-sm font-mono text-zinc-300 resize-none focus:outline-none placeholder:text-zinc-700 custom-scrollbar"
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
                    <div className="flex flex-col h-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
                        {/* Loading Overlay */}
                        {isParsing && (
                            <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                                <div className="text-zinc-400 font-mono text-sm animate-pulse">Analyzing text structure...</div>
                            </div>
                        )}

                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-2 text-zinc-400 font-medium text-sm">
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
                                <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                                        <Database size={24} className="opacity-50" />
                                    </div>
                                    <p className="text-sm">Waiting for input...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Title Section */}
                                    <div className="group relative">
                                        <div className="absolute -left-3 top-0 bottom-0 w-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1.5 block">Problem Title</label>
                                        <div className="text-xl font-bold text-white bg-white/5 p-3 rounded-lg border border-white/5">
                                            {parsedData.title}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1.5 block">Description</label>
                                        <div className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-4 rounded-xl border border-white/5 font-serif whitespace-pre-wrap">
                                            {parsedData.description}
                                        </div>
                                    </div>

                                    {/* IO Format & Constraints Grid */}
                                    <div className="grid grid-cols-1 gap-6">
                                        {parsedData.inputFormat && (
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1.5 block">Input Format</label>
                                                <div className="text-xs text-zinc-400 bg-zinc-900 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                                                    {parsedData.inputFormat}
                                                </div>
                                            </div>
                                        )}
                                        {parsedData.outputFormat && (
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1.5 block">Output Format</label>
                                                <div className="text-xs text-zinc-400 bg-zinc-900 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                                                    {parsedData.outputFormat}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Constraints */}
                                    {parsedData.constraints && parsedData.constraints.length > 0 && (
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1.5 block">Constraints</label>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {parsedData.constraints.map((c: string, i: number) => (
                                                    <li key={i} className="text-xs text-zinc-300 bg-zinc-900 px-3 py-2 rounded border border-white/5 font-mono flex items-center gap-2">
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
                                            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1.5 block">Extracted Test Cases ({parsedData.testCases.length})</label>
                                            <div className="space-y-3">
                                                {parsedData.testCases.map((tc: any, i: number) => (
                                                    <div key={i} className="flex gap-4 p-3 bg-zinc-900 border border-white/5 rounded-lg text-xs font-mono">
                                                        <div className="flex-1">
                                                            <span className="text-zinc-500 text-[10px] uppercase font-bold mb-1 block">Input</span>
                                                            <div className="text-blue-200 bg-blue-500/5 p-2 rounded border border-blue-500/10 whitespace-pre-wrap">{tc.input}</div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="text-zinc-500 text-[10px] uppercase font-bold mb-1 block">Output</span>
                                                            <div className="text-green-200 bg-green-500/5 p-2 rounded border border-green-500/10 whitespace-pre-wrap">{tc.output}</div>
                                                        </div>
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
