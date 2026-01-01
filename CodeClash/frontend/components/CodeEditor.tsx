"use client";
import { Editor } from "@monaco-editor/react";
import { Code2, Settings, RotateCcw, Maximize2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
    { value: "python", label: "Python", icon: "🐍" },
    { value: "cpp", label: "C++", icon: "⚡" },
    { value: "c", label: "C", icon: "🔧" },
    { value: "java", label: "Java", icon: "☕" },
];

interface CodeEditorProps {
    language: string;
    code: string;
    onChange: (value: string | undefined) => void;
    setLanguage: (lang: string) => void;
}

export default function CodeEditor({ language, code, onChange, setLanguage }: CodeEditorProps) {
    return (
        <div className="h-full flex flex-col bg-[#262626] text-zinc-400 font-sans">
            {/* Header */}
            <div className="h-9 min-h-[36px] bg-zinc-800/50 flex items-center justify-between px-3 border-b border-zinc-700/50 select-none">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-green-500 font-medium text-xs">
                        <Code2 size={14} />
                        <span>Code</span>
                    </div>

                    {/* Language Selector */}
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-6 w-auto border-none bg-transparent p-0 text-xs focus:ring-0 gap-1 text-zinc-300 hover:text-white transition-colors shadow-none data-[placeholder]:text-zinc-500">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700 min-w-[120px]">
                            {LANGUAGES.map(lang => (
                                <SelectItem
                                    key={lang.value}
                                    value={lang.value}
                                    className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer text-xs"
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{lang.icon}</span>
                                        <span>{lang.label}</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1 text-xs hover:text-white cursor-pointer transition-colors text-zinc-500">
                        <span>Auto</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="hover:text-white transition-colors"><Settings size={14} /></button>
                    <button className="hover:text-white transition-colors"><RotateCcw size={14} /></button>
                    <button className="hover:text-white transition-colors"><Maximize2 size={14} /></button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 relative bg-[#1e1e1e]">
                <Editor
                    height="100%"
                    width="100%"
                    defaultLanguage="python"
                    language={language}
                    value={code}
                    theme="vs-dark"
                    onChange={onChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineHeight: 21,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontLigatures: true,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 12, bottom: 12 },
                        renderLineHighlight: "all",
                        cursorBlinking: "expand",
                        smoothScrolling: true,
                        contextmenu: true,
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10,
                        },
                    }}
                />
            </div>

            {/* Footer / Status Bar */}
            <div className="h-7 min-h-[28px] bg-[#1e1e1e] border-t border-zinc-800 flex items-center justify-between px-3 text-[10px] text-zinc-500 select-none">
                <div className="flex items-center gap-2">
                    <span>Saved</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Ln 1, Col 1</span>
                </div>
            </div>
        </div>
    );
}
