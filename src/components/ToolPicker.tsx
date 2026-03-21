import { useState, useMemo } from 'react'
import { Search, Check, X, ChevronDown, Zap } from 'lucide-react'
import { TOOLS, PRESETS, CATEGORIES, type Tool } from '../data/tools'

const ALL_CATEGORY = 'All'

interface Props {
  selected: Tool[]
  onChange: (tools: Tool[]) => void
  selectedVersions: Record<string, string>
  onVersionChange: (versions: Record<string, string>) => void
  customRules: string
  onCustomRulesChange: (rules: string) => void
}

export default function ToolPicker({
  selected,
  onChange,
  selectedVersions,
  onVersionChange,
  customRules,
  onCustomRulesChange,
}: Props) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY)
  const [showCustomRules, setShowCustomRules] = useState(!!customRules)

  const selectedIds = useMemo(() => new Set(selected.map(t => t.id)), [selected])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return TOOLS.filter(tool => {
      const matchesSearch =
        q === '' ||
        tool.name.toLowerCase().includes(q) ||
        tool.tags.some(tag => tag.includes(q))
      const matchesCategory = activeCategory === ALL_CATEGORY || tool.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  function toggle(tool: Tool): void {
    if (selectedIds.has(tool.id)) {
      onChange(selected.filter(t => t.id !== tool.id))
    } else {
      onChange([...selected, tool])
    }
  }

  function applyPreset(toolIds: string[]): void {
    const presetTools = toolIds
      .map(id => TOOLS.find(t => t.id === id))
      .filter((t): t is Tool => t !== undefined)
    onChange(presetTools)
  }

  function setVersion(toolId: string, version: string): void {
    onVersionChange({ ...selectedVersions, [toolId]: version })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Choose your stack</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">Select the tools and frameworks you use in this project</p>
      </div>

      {/* Presets */}
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.tools)}
              title={preset.description}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-violet-50 dark:hover:bg-violet-900/50 border border-zinc-300 dark:border-zinc-700 hover:border-violet-400 dark:hover:border-violet-600 text-zinc-700 dark:text-zinc-300 hover:text-violet-700 dark:hover:text-violet-200 text-sm rounded-lg transition-colors"
            >
              <Zap className="w-3 h-3" aria-hidden="true" />
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
        <input
          type="search"
          id="tool-search"
          aria-label="Search tools"
          placeholder="Search tools..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {[ALL_CATEGORY, ...CATEGORIES].map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat ? true : false}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-violet-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selected summary with version pickers */}
      {selected.length > 0 && (
        <div
          className="flex flex-wrap gap-2 p-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/40 rounded-lg"
          aria-label={`${selected.length} selected tools`}
        >
          <span className="text-sm text-violet-600 dark:text-violet-400 mr-1 self-center">Selected:</span>
          {selected.map(t => (
            <div key={t.id} className="flex items-center gap-0 bg-violet-100 dark:bg-violet-800/40 text-violet-700 dark:text-violet-200 text-sm rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(t)}
                aria-label={`Remove ${t.name}`}
                className="flex items-center gap-1 pl-2 py-1 hover:bg-violet-200 dark:hover:bg-violet-800/60 transition-colors"
              >
                {t.emoji} {t.name}
                <X className="w-3 h-3 text-violet-500 dark:text-violet-400 ml-1" aria-hidden="true" />
              </button>
              {t.versions && t.versions.length > 0 && (
                <div className="relative border-l border-violet-300 dark:border-violet-700/50">
                  <select
                    value={selectedVersions[t.id] ?? t.versions[t.versions.length - 1]}
                    onChange={e => setVersion(t.id, e.target.value)}
                    aria-label={`${t.name} version`}
                    className="appearance-none bg-transparent text-violet-600 dark:text-violet-300 text-sm pl-1.5 pr-4 py-1 cursor-pointer focus:outline-none"
                  >
                    {t.versions.map(v => (
                      <option key={v} value={v} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                        v{v}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-violet-500 dark:text-violet-400 pointer-events-none" aria-hidden="true" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tool grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" role="group" aria-label="Available tools">
        {filtered.map(tool => {
          const isSelected = selectedIds.has(tool.id)
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => toggle(tool)}
              aria-pressed={isSelected ? true : false}
              aria-label={`${isSelected ? 'Remove' : 'Add'} ${tool.name}`}
              className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 shadow-lg shadow-violet-200/40 dark:shadow-violet-900/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/80'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center" aria-hidden="true">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
              <span className="text-2xl" aria-hidden="true">{tool.emoji}</span>
              <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tool.name}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">{tool.description}</div>
              </div>
              <span className="text-sm px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-full">
                {tool.category}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-12 text-zinc-500 dark:text-zinc-400" role="status">
          No tools found for &quot;{search}&quot;
        </p>
      )}

      {/* Custom rules */}
      <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 pt-6">
        <button
          type="button"
          onClick={() => setShowCustomRules(v => !v)}
          className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          aria-expanded={showCustomRules ? true : false}
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showCustomRules ? '' : '-rotate-90'}`} aria-hidden="true" />
          Add team-specific rules <span className="text-zinc-400 dark:text-zinc-500">(optional)</span>
        </button>
        {showCustomRules && (
          <div className="mt-3">
            <textarea
              value={customRules}
              onChange={e => onCustomRulesChange(e.target.value)}
              placeholder={`- Always use barrel files (index.ts) in every directory\n- API responses always follow { data, error, meta } shape\n- Use feature flags from LaunchDarkly before rolling out new UI`}
              rows={5}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono resize-y"
              aria-label="Custom team rules"
            />
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
              These rules are appended verbatim to every generated config file under a &quot;Team Rules&quot; section.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
