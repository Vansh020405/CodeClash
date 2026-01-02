"use client";
import { useState } from "react";
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
    { value: "cpp", label: "C++", icon: "" },
    { value: "python", label: "Python", icon: "" },
];

interface CodeEditorProps {
    language: string;
    code: string;
    onChange: (value: string | undefined) => void;
    setLanguage: (lang: string) => void;
    onReset?: () => void;
    toggleFullScreen?: () => void;
    isDarkMode?: boolean;
}

export default function CodeEditor({ language, code, onChange, setLanguage, onReset, toggleFullScreen, isDarkMode = true }: CodeEditorProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [fontSize, setFontSize] = useState(14);

    const bgColor = isDarkMode ? "bg-[#0a0a0a]" : "bg-white";
    const borderColor = isDarkMode ? "border-white/5" : "border-slate-200";
    const textColor = isDarkMode ? "text-zinc-400" : "text-slate-500";
    const iconHover = isDarkMode ? "hover:bg-zinc-800 hover:text-zinc-300" : "hover:bg-slate-100 hover:text-slate-700";
    const selectTriggerBg = isDarkMode ? "bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 border-white/10" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200";
    const dropdownBg = isDarkMode ? "bg-[#121212] border-zinc-800" : "bg-white border-slate-200";

    return (
        <div className={`h-full flex flex-col font-sans rounded-xl overflow-hidden relative border ${bgColor} ${textColor} ${borderColor}`}>
            {/* Header */}
            <div className={`h-10 min-h-[40px] flex items-center justify-between px-3 border-b select-none relative z-20 ${bgColor} ${borderColor}`}>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        <Code2 size={12} />
                        <span>Code Editor</span>
                    </div>

                    {/* Language Selector */}
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className={`h-7 w-auto border px-2 rounded text-xs focus:ring-0 gap-2 transition-all shadow-sm ${selectTriggerBg}`}>
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent className={`rounded-lg min-w-[140px] shadow-xl ${dropdownBg}`}>
                            {LANGUAGES.map(lang => (
                                <SelectItem
                                    key={lang.value}
                                    value={lang.value}
                                    className={`cursor-pointer text-xs rounded-md ${isDarkMode ? 'text-zinc-400 focus:bg-zinc-800 focus:text-white' : 'text-slate-600 focus:bg-slate-100 focus:text-slate-900'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{lang.icon}</span>
                                        <span>{lang.label}</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-1 relative">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-1.5 rounded-md transition-colors ${showSettings ? (isDarkMode ? 'bg-zinc-800 text-white' : 'bg-slate-200 text-slate-900') : (isDarkMode ? 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700')}`}
                        title="Settings"
                    >
                        <Settings size={14} />
                    </button>
                    {showSettings && (
                        <div className={`absolute top-8 right-0 border rounded-lg shadow-xl p-3 w-48 z-50 ${isDarkMode ? 'bg-[#151515] border-white/10' : 'bg-white border-slate-200'}`}>
                            <div className="text-xs font-bold text-zinc-500 uppercase mb-2">Editor Settings</div>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>Font Size</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setFontSize(Math.max(10, fontSize - 1))} className={`w-5 h-5 flex items-center justify-center rounded text-xs ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-slate-100 hover:bg-slate-200'}`}>-</button>
                                    <span className="text-xs min-w-[16px] text-center">{fontSize}</span>
                                    <button onClick={() => setFontSize(Math.min(24, fontSize + 1))} className={`w-5 h-5 flex items-center justify-center rounded text-xs ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-slate-100 hover:bg-slate-200'}`}>+</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onReset}
                        className={`p-1.5 rounded-md transition-colors ${iconHover}`}
                        title="Reset Code"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button
                        onClick={toggleFullScreen}
                        className={`p-1.5 rounded-md transition-colors ${iconHover}`}
                        title="Maximize"
                    >
                        <Maximize2 size={14} />
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className={`flex-1 relative ${bgColor}`}>
                <Editor
                    height="100%"
                    width="100%"
                    defaultLanguage="cpp"
                    language={language}
                    value={code}
                    theme={isDarkMode ? "vs-dark" : "light"}
                    onChange={onChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: fontSize,
                        lineHeight: 21,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontLigatures: true,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 },
                        renderLineHighlight: "all",
                        cursorBlinking: "smooth",
                        smoothScrolling: true,
                        contextmenu: true,
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                            useShadows: false
                        },
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                    }}
                    onMount={(editor, monaco) => {
                        monaco.editor.defineTheme('vs-dark', {
                            base: 'vs-dark',
                            inherit: true,
                            rules: [],
                            colors: {
                                'editor.background': '#0a0a0a',
                                'editor.lineHighlightBackground': '#ffffff0a',
                            }
                        });
                        // Allow resetting to light if needed by re-setting theme in prop update using effect?
                        // Monaco handles prop updates automatically for theme.
                    }}
                />
            </div>

            {/* Footer / Status Bar */}
            <div className={`h-6 min-h-[24px] border-t flex items-center justify-between px-3 text-[10px] select-none z-20 ${bgColor} ${borderColor} ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'}`}>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                        Ready
                    </span>
                    <span>UTF-8</span>
                </div>
                <div className="flex items-center gap-3">
                    <span>Spaces: 4</span>
                    <span>Ln 1, Col 1</span>
                </div>
            </div>
        </div>
    );
}
