import { useState, useCallback, useEffect, useRef } from 'react'
import { Download, Copy, Check, FileText, ChevronDown, ChevronRight, Sparkles, AlertCircle, X } from 'lucide-react'
import type { Tool } from '../data/tools'
import type { Assistant, OutputFile } from '../data/assistants'
import { generateContextKit, mergeFiles, downloadZip, copyToClipboard } from '../lib/generator'
import type { GenerateOptions } from '../lib/generator'

/** Render a step string, converting `backtick` tokens to <code> elements */
function renderStep(step: string): React.ReactNode {
  const parts = step.split(/(`[^`]+`)/)
  return parts.map((part, i) =>
    part.startsWith('`') && part.endsWith('`')
      ? <code key={i} className="text-violet-400">{part.slice(1, -1)}</code>
      : part
  )
}

interface Props {
  tools: Tool[]
  assistants: Assistant[]
  projectName: string
  selectedVersions?: Record<string, string>
  customRules?: string
}

export default function Preview({ tools, assistants, projectName, selectedVersions, customRules }: Props) {
  const options: GenerateOptions = { selectedVersions, customRules }
  const [files] = useState<OutputFile[]>(() => mergeFiles(tools, assistants, projectName, options))
  const [expandedFile, setExpandedFile] = useState<string>(files[0]?.path ?? '')
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [copyFailed, setCopyFailed] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current)
    }
  }, [])

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    setDownloadError(null)
    try {
      const result = await generateContextKit(tools, assistants, projectName, { selectedVersions, customRules })
      downloadZip(result.zipBlob, projectName)
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }, [tools, assistants, projectName, selectedVersions, customRules])

  const handleCopy = useCallback(async (path: string, content: string) => {
    setCopyFailed(false)
    try {
      await copyToClipboard(content)
      setCopied(path)
      if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(null), 2000)
    } catch {
      setCopyFailed(true)
      if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopyFailed(false), 3000)
    }
  }, [])

  const activeFile = files.find(f => f.path === expandedFile)
  const assistantNames = assistants.map(a => a.name).join(', ')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-400" aria-hidden="true" />
            Your context kit is ready
          </h2>
          <p className="text-zinc-400 mt-1">
            {files.length} files &middot; <span className="text-violet-400">{assistantNames}</span>
            &nbsp;&middot;&nbsp;
            <span aria-label={`Tools: ${tools.map(t => t.name).join(', ')}`}>
              {tools.map(t => t.emoji).join(' ')}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          aria-busy={downloading ? true : false}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shrink-0"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          {downloading ? 'Zipping...' : 'Download .zip'}
        </button>
      </div>

      {/* Download error */}
      {downloadError && (
        <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-sm text-red-300" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {downloadError}
        </div>
      )}

      {/* Usage instructions */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm space-y-3">
        <p className="text-zinc-400 font-medium">How to use</p>
        {assistants.map(a => (
          <div key={a.id}>
            {assistants.length > 1 && (
              <p className="text-xs text-violet-400 mb-1" aria-label={`Instructions for ${a.name}`}>
                {a.logo} {a.name}
              </p>
            )}
            <ol className="list-decimal list-inside space-y-1 text-zinc-300">
              {a.usageSteps.map((step, i) => (
                <li key={i}>{renderStep(step)}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* File explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[400px]">
        {/* File list */}
        <nav className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden" aria-label="Generated files">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Files</p>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {files.map(file => (
              <button
                key={file.path}
                type="button"
                onClick={() => setExpandedFile(file.path)}
                aria-current={expandedFile === file.path ? 'true' : undefined}
                aria-label={`View ${file.path}`}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  expandedFile === file.path
                    ? 'bg-violet-950/40 text-violet-300'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                {expandedFile === file.path ? (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                )}
                <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="text-xs font-mono truncate">{file.path}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* File content */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
          {activeFile && (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <span className="text-xs font-mono text-zinc-400">{activeFile.path}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(activeFile.path, activeFile.content)}
                  aria-label={copied === activeFile.path ? 'Copied to clipboard' : copyFailed ? 'Copy failed — select text manually' : `Copy ${activeFile.path} to clipboard`}
                  aria-live="polite"
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                >
                  {copied === activeFile.path ? (
                    <><Check className="w-3 h-3 text-green-400" aria-hidden="true" /><span className="text-green-400">Copied</span></>
                  ) : copyFailed ? (
                    <><X className="w-3 h-3 text-red-400" aria-hidden="true" /><span className="text-red-400">Select manually</span></>
                  ) : (
                    <><Copy className="w-3 h-3" aria-hidden="true" />Copy</>
                  )}
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {activeFile.content}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

