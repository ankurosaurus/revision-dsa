import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Code2,
  Cloud,
} from 'lucide-react';
import { SupportedLanguage } from '../../types';
import {
  SUPPORTED_LANGUAGES,
  executeCode,
  ExecutionResult,
  ExecutionStatus,
} from '../../lib/pistonService';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { track } from '../../lib/analytics';

interface CodeCompilerProps {
  problemId: string;
  problemTitle?: string;
  initialLanguage?: SupportedLanguage;
  onSuccess?: () => void;
}

const STORAGE_KEY_PREFIX = 'revision_dsa_code_';

export const CodeCompiler: React.FC<CodeCompilerProps> = ({
  problemId,
  problemTitle,
  initialLanguage = 'python',
}) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [code, setCode] = useState<string>('');
  const [stdin, setStdin] = useState<string>('');
  const [isStdinOpen, setIsStdinOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  const editorRef = useRef<any>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load saved code on mount or when language/problem changes ───────────────
  useEffect(() => {
    let isMounted = true;
    const localKey = `${STORAGE_KEY_PREFIX}${problemId}_${language}`;
    const savedLocal = localStorage.getItem(localKey);

    if (savedLocal) {
      setCode(savedLocal);
    } else {
      // Default to starter template
      setCode(SUPPORTED_LANGUAGES[language].starterTemplate);
    }

    // Attempt to load latest code from Supabase if logged in
    if (isSupabaseConfigured && supabase && user) {
      (async () => {
        try {
          const { data } = await supabase
            .from('code_submissions')
            .select('code, last_stdout, last_stderr')
            .eq('problem_id', problemId)
            .eq('language', language)
            .maybeSingle();

          if (isMounted && data && data.code) {
            setCode(data.code);
            localStorage.setItem(localKey, data.code);
            if (data.last_stdout || data.last_stderr) {
              setResult({
                status: data.last_stderr ? 'COMPILE_ERROR' : 'SUCCESS',
                stdout: data.last_stdout || '',
                stderr: data.last_stderr || '',
                durationMs: 0,
                language,
              });
            }
          }
        } catch {
          // ignore network or fetch errors on initial load
        }
      })();
    }

    return () => {
      isMounted = false;
    };
  }, [problemId, language, user]);

  // ── Debounced Autosave (2s after last keystroke) ──────────────────────────
  const triggerAutosave = useCallback(
    (newCode: string, currentLang: SupportedLanguage) => {
      setSaveStatus('saving');
      const localKey = `${STORAGE_KEY_PREFIX}${problemId}_${currentLang}`;
      localStorage.setItem(localKey, newCode);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        // Sync to Supabase
        if (isSupabaseConfigured && supabase && user && !user.is_anonymous) {
          try {
            await supabase.from('code_submissions').upsert(
              {
                user_id: user.id,
                problem_id: problemId,
                language: currentLang,
                code: newCode,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,problem_id,language' }
            );
          } catch (e) {
            console.warn('Autosave to Supabase notice:', e);
          }
        }
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 2000);
    },
    [problemId, user]
  );

  const handleEditorChange = (value: string | undefined) => {
    const val = value ?? '';
    setCode(val);
    triggerAutosave(val, language);
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom dark theme to blend with RevisionDSA dark mode
    monaco.editor.defineTheme('revisionDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818cf8', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fbbf24' },
      ],
      colors: {
        'editor.background': '#0e0e11',
        'editor.foreground': '#f3f4f6',
        'editorLineNumber.foreground': '#4b5563',
        'editorLineNumber.activeForeground': '#9ca3af',
        'editor.selectionBackground': '#374151',
        'editor.lineHighlightBackground': '#18181b',
        'editorCursor.foreground': '#6366f1',
      },
    });

    monaco.editor.setTheme('revisionDark');

    // Add keyboard shortcut for Run Code: Ctrl+Enter or Cmd+Enter
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });
  };

  // ── Run Code via Piston API ────────────────────────────────────────────────
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);

    try {
      const res = await executeCode({
        language,
        code,
        stdin,
        timeoutMs: 10000,
      });

      setResult(res);

      track('compiler_code_run', {
        language,
        status: res.status,
        duration_ms: res.durationMs,
      });

      // Save last output to Supabase if logged in
      if (isSupabaseConfigured && supabase && user && !user.is_anonymous) {
        supabase
          .from('code_submissions')
          .upsert(
            {
              user_id: user.id,
              problem_id: problemId,
              language,
              code,
              last_stdout: res.stdout,
              last_stderr: res.stderr,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,problem_id,language' }
          )
          .then();
      }
    } catch (err: any) {
      setResult({
        status: 'ERROR',
        stdout: '',
        stderr: err?.message || 'Failed to run code',
        durationMs: 0,
        language,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // ── Reset Code to Starter Template ─────────────────────────────────────────
  const handleResetCode = () => {
    const starter = SUPPORTED_LANGUAGES[language].starterTemplate;
    setCode(starter);
    triggerAutosave(starter, language);
  };

  // ── Copy Code ─────────────────────────────────────────────────────────────
  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // ── Status Badge Renderer ──────────────────────────────────────────────────
  const renderStatusBadge = (status: ExecutionStatus) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5A9367] bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-[10px] border border-emerald-200 dark:border-emerald-900/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Success</span>
          </span>
        );
      case 'COMPILE_ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C25B5B] bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-[10px] border border-rose-200 dark:border-rose-900/40">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Compile error</span>
          </span>
        );
      case 'RUNTIME_ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C25B5B] bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-[10px] border border-rose-200 dark:border-rose-900/40">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Runtime error</span>
          </span>
        );
      case 'TIMEOUT':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C4923A] bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-[10px] border border-amber-200 dark:border-amber-900/40">
            <Clock className="w-3.5 h-3.5" />
            <span>Time limit exceeded</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted bg-surface-subtle px-2 py-0.5 rounded-[10px] border border-line">
            <span>Finished</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full rounded-[10px] border border-line bg-surface overflow-hidden">
      {/* ── Top Bar / Controls ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-line bg-surface-subtle">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-ink-secondary" />
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="text-xs font-medium bg-surface border border-line rounded-[10px] px-2.5 py-1.5 text-ink focus:outline-none focus:border-[#2D5A6B] cursor-pointer"
          >
            {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((langKey) => (
              <option key={langKey} value={langKey}>
                {SUPPORTED_LANGUAGES[langKey].label}
              </option>
            ))}
          </select>

          {/* Autosave Status */}
          {saveStatus === 'saving' && (
            <span className="text-xs text-ink-muted flex items-center gap-1">
              <Cloud className="w-3 h-3 animate-pulse" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-[#5A9367] flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Saved</span>
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-[10px] border border-line text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors"
            title="Copy Code"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-[#5A9367]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetCode}
            className="p-1.5 rounded-[10px] border border-line text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors"
            title="Reset to Starter Template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Run Code Button */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 font-medium disabled:opacity-50"
            title="Run Code (Ctrl+Enter / Cmd+Enter)"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isRunning ? 'Running…' : 'Run code'}</span>
          </button>
        </div>
      </div>

      {/* ── Monaco Editor Workspace ────────────────────────────────────────── */}
      <div className="flex-1 min-h-[280px] max-h-[420px] relative">
        <Editor
          height="100%"
          language={SUPPORTED_LANGUAGES[language].monacoLang}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: 'Geist Mono, JetBrains Mono, Menlo, Monaco, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbersMinChars: 3,
            tabSize: 4,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* ── Collapsible Custom Stdin Panel ─────────────────────────────────── */}
      <div className="border-t border-line bg-surface-subtle">
        <button
          type="button"
          onClick={() => setIsStdinOpen((prev) => !prev)}
          className="w-full px-4 py-2 flex items-center justify-between text-xs font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>Custom input (stdin)</span>
            {stdin.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-ink inline-block" />
            )}
          </span>
          {isStdinOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {isStdinOpen && (
          <div className="px-4 pb-3">
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter test inputs passed to stdin (e.g. 5, array elements, strings)..."
              rows={3}
              className="w-full font-mono text-xs p-2.5 rounded-[10px] border border-line bg-surface text-ink placeholder:text-ink-muted focus:outline-none focus:border-[#2D5A6B] resize-none"
            />
          </div>
        )}
      </div>

      {/* ── Output Panel ───────────────────────────────────────────────────── */}
      {result && (
        <div className="border-t border-line bg-surface-subtle text-ink p-4 space-y-2">
          <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-muted">Verdict</span>
              {renderStatusBadge(result.status)}
            </div>
            {result.durationMs > 0 && (
              <span className="text-xs text-ink-muted font-mono">
                {result.durationMs}ms
              </span>
            )}
          </div>

          {/* Standard Output */}
          {result.stdout && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-ink-muted">stdout:</span>
              <pre className="font-mono text-xs bg-surface p-2.5 rounded-[10px] border border-line overflow-x-auto text-ink whitespace-pre-wrap">
                {result.stdout}
              </pre>
            </div>
          )}

          {/* Stderr / Compile / Runtime Errors */}
          {result.stderr && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-[#C25B5B]">stderr / error:</span>
              <pre className="font-mono text-xs bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-[10px] border border-rose-200 dark:border-rose-900/40 overflow-x-auto text-[#C25B5B] whitespace-pre-wrap">
                {result.stderr}
              </pre>
            </div>
          )}

          {!result.stdout && !result.stderr && (
            <p className="text-xs text-ink-muted italic">Program executed with empty output.</p>
          )}
        </div>
      )}
    </div>
  );
};
