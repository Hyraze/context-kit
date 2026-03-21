import { useMemo } from 'react'
import { Check } from 'lucide-react'
import { ASSISTANTS, type Assistant } from '../data/assistants'

interface Props {
  selected: Assistant[]
  onChange: (assistants: Assistant[]) => void
}

export default function AssistantPicker({ selected, onChange }: Props) {
  const selectedIds = useMemo(() => new Set(selected.map(a => a.id)), [selected])

  function toggle(assistant: Assistant): void {
    if (selectedIds.has(assistant.id)) {
      onChange(selected.filter(a => a.id !== assistant.id))
    } else {
      onChange([...selected, assistant])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Choose your AI assistant(s)</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Pick one or more — we&apos;ll include the right config files for each
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="group" aria-label="AI assistants">
        {ASSISTANTS.map(assistant => {
          const isSelected = selectedIds.has(assistant.id)
          return (
            <button
              key={assistant.id}
              type="button"
              onClick={() => toggle(assistant)}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Deselect' : 'Select'} ${assistant.name}`}
              className={`flex flex-col gap-3 p-5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 shadow-lg shadow-violet-200/40 dark:shadow-violet-900/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl" aria-hidden="true">{assistant.logo}</span>
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-violet-500 border-violet-500' : 'border-zinc-400 dark:border-zinc-600'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </span>
              </div>
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">{assistant.name}</div>
                <div className="text-sm text-violet-600 dark:text-violet-400 mt-0.5">{assistant.badge}</div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{assistant.description}</p>
            </button>
          )
        })}
      </div>

      {selected.length > 1 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3" role="note">
          Shared files (like <code className="text-violet-600 dark:text-violet-400">.env.example</code>) are included once.
          Each assistant gets its own config file — no conflicts.
        </p>
      )}
    </div>
  )
}
