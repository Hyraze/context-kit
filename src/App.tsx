import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ArrowLeft, Package, Sun, Moon } from 'lucide-react'
import ToolPicker from './components/ToolPicker'
import AssistantPicker from './components/AssistantPicker'
import Preview from './components/Preview'
import type { Tool } from './data/tools'
import { TOOLS } from './data/tools'
import type { Assistant } from './data/assistants'
import { ASSISTANTS } from './data/assistants'

const STEPS = ['Stack', 'Assistant', 'Download'] as const

function readUrlState(): {
  tools: Tool[]
  assistants: Assistant[]
  projectName: string
  step: number
  selectedVersions: Record<string, string>
  customRules: string
} {
  const params = new URLSearchParams(window.location.search)
  const toolIds = params.get('stack')?.split(',').filter(Boolean) ?? []
  const assistantIds = params.get('assistants')?.split(',').filter(Boolean) ?? []
  const projectName = params.get('project') ?? 'my-project'
  const stepParam = parseInt(params.get('step') ?? '0', 10)
  const customRules = params.get('custom') ? decodeURIComponent(params.get('custom')!) : ''

  // Parse versions: "react:19,nextjs:15"
  const selectedVersions: Record<string, string> = {}
  const versionsParam = params.get('versions') ?? ''
  for (const pair of versionsParam.split(',').filter(Boolean)) {
    const [id, ver] = pair.split(':')
    if (id && ver) selectedVersions[id] = ver
  }

  const tools = toolIds.map(id => TOOLS.find(t => t.id === id)).filter((t): t is Tool => t !== undefined)
  const assistants = assistantIds.map(id => ASSISTANTS.find(a => a.id === id)).filter((a): a is Assistant => a !== undefined)
  const step = Number.isNaN(stepParam) ? 0 : Math.min(Math.max(stepParam, 0), STEPS.length - 1)

  return { tools, assistants, projectName, step, selectedVersions, customRules }
}

function writeUrlState(
  tools: Tool[],
  assistants: Assistant[],
  projectName: string,
  step: number,
  selectedVersions: Record<string, string>,
  customRules: string,
) {
  const params = new URLSearchParams()
  if (tools.length > 0) params.set('stack', tools.map(t => t.id).join(','))
  if (assistants.length > 0) params.set('assistants', assistants.map(a => a.id).join(','))
  if (projectName !== 'my-project') params.set('project', projectName)
  if (step > 0) params.set('step', String(step))

  const versionPairs = Object.entries(selectedVersions)
    .filter(([id]) => tools.some(t => t.id === id))
    .map(([id, ver]) => `${id}:${ver}`)
  if (versionPairs.length > 0) params.set('versions', versionPairs.join(','))

  if (customRules.trim()) params.set('custom', encodeURIComponent(customRules.trim()))

  const query = params.toString()
  const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname
  window.history.replaceState(null, '', newUrl)
}

function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const initial = useMemo(() => readUrlState(), [])
  const [step, setStep] = useState(initial.step)
  const [selectedTools, setSelectedTools] = useState<Tool[]>(initial.tools)
  const [selectedAssistants, setSelectedAssistants] = useState<Assistant[]>(initial.assistants)
  const [projectName, setProjectName] = useState(initial.projectName)
  const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>(initial.selectedVersions)
  const [customRules, setCustomRules] = useState(initial.customRules)
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    writeUrlState(selectedTools, selectedAssistants, projectName, step, selectedVersions, customRules)
  }, [selectedTools, selectedAssistants, projectName, step, selectedVersions, customRules])

  const canProceed = useMemo(() => {
    if (step === 0) return selectedTools.length > 0
    if (step === 1) return selectedAssistants.length > 0
    return true
  }, [step, selectedTools.length, selectedAssistants.length])

  const stepHint = useMemo(() => {
    if (step === 0 && selectedTools.length > 0)
      return `${selectedTools.length} tool${selectedTools.length !== 1 ? 's' : ''} selected`
    if (step === 1 && selectedAssistants.length > 0)
      return `${selectedAssistants.length} assistant${selectedAssistants.length !== 1 ? 's' : ''} selected`
    return null
  }, [step, selectedTools.length, selectedAssistants.length])

  function handleReset(): void {
    setStep(0)
    setSelectedTools([])
    setSelectedAssistants([])
    setProjectName('my-project')
    setSelectedVersions({})
    setCustomRules('')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-violet-500 dark:text-violet-400" aria-hidden="true" />
            <span className="font-bold text-zinc-900 dark:text-white tracking-tight">context-kit</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:inline">
              — AI context for your dev stack
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Step indicator */}
            <ol className="flex items-center gap-2" aria-label="Progress">
              {STEPS.map((label, i) => (
                <li key={label} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      i === step
                        ? 'text-violet-600 dark:text-violet-300'
                        : i < step
                        ? 'text-zinc-500 dark:text-zinc-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                    aria-current={i === step ? 'step' : undefined}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        i === step
                          ? 'bg-violet-600 text-white'
                          : i < step
                          ? 'bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                      aria-hidden="true"
                    >
                      {i < step ? '✓' : i + 1}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <span className="text-zinc-400 dark:text-zinc-500 text-xs" aria-hidden="true">›</span>
                  )}
                </li>
              ))}
            </ol>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4" aria-hidden="true" />
                : <Moon className="w-4 h-4" aria-hidden="true" />
              }
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Project name input (step 0 only) */}
        {step === 0 && (
          <div className="mb-8 flex items-center gap-3">
            <label htmlFor="project-name" className="text-sm text-zinc-600 dark:text-zinc-400 shrink-0">
              Project name:
            </label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value || 'my-project')}
              className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors w-48"
              placeholder="my-project"
              aria-describedby="project-name-hint"
            />
            <span id="project-name-hint" className="sr-only">
              Used as the filename for your downloaded zip
            </span>
          </div>
        )}

        {/* Step content */}
        {step === 0 && (
          <ToolPicker
            selected={selectedTools}
            onChange={setSelectedTools}
            selectedVersions={selectedVersions}
            onVersionChange={setSelectedVersions}
            customRules={customRules}
            onCustomRulesChange={setCustomRules}
          />
        )}
        {step === 1 && (
          <AssistantPicker selected={selectedAssistants} onChange={setSelectedAssistants} />
        )}
        {step === 2 && selectedAssistants.length > 0 && (
          <Preview
            tools={selectedTools}
            assistants={selectedAssistants}
            projectName={projectName}
            selectedVersions={selectedVersions}
            customRules={customRules}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            aria-label="Go to previous step"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-0 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </button>

          {stepHint && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">{stepHint}</p>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed}
              aria-label={`Continue to ${STEPS[step + 1]}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg transition-colors"
            >
              Start over
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <span>context-kit — open source</span>
          <span>Works with Claude Code · Cursor · Windsurf · GitHub Copilot · any LLM</span>
        </div>
      </footer>
    </div>
  )
}
