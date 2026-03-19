import { describe, it, expect, vi } from 'vitest'
import { mergeFiles, generateContextKit, downloadZip } from './generator'
import type { Tool } from '../data/tools'
import { TOOLS, PRESETS } from '../data/tools'
import type { Assistant, OutputFile } from '../data/assistants'
import { ASSISTANTS } from '../data/assistants'
import { getActiveCombos } from '../data/combos'

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeTool(overrides: Partial<Tool> = {}): Tool {
  return {
    id: 'test-tool',
    name: 'Test Tool',
    category: 'Frontend',
    emoji: '🔧',
    description: 'A test tool',
    tags: ['test'],
    bestPractices: ['Do the right thing'],
    adr: {
      title: 'Use Test Tool',
      context: 'We need to test things.',
      decision: 'Use Test Tool.',
      positives: ['Easy'],
      negatives: ['Slow'],
      alternatives: ['Other Tool'],
    },
    knowledge: {
      overview: 'Overview',
      patterns: 'Patterns',
      gotchas: 'Gotchas',
      quickstart: 'Quickstart',
    },
    ...overrides,
  }
}

function makeAssistant(id: string, files: OutputFile[]): Assistant {
  return {
    id,
    name: id,
    logo: '🤖',
    description: 'Test assistant',
    badge: 'test',
    usageSteps: ['Step 1', 'Step 2'],
    generate: () => files,
  }
}

// ─── mergeFiles ───────────────────────────────────────────────────────────────

describe('mergeFiles with options', () => {
  it('injects customRules into generated content', () => {
    const a = makeAssistant('claude-code', [{ path: 'CLAUDE.md', content: 'base content' }])
    // options are passed through to generate(); the assistant fixture ignores them,
    // so we verify the call itself doesn't throw and returns files
    const result = mergeFiles([], [a], 'proj', { customRules: 'use barrel files' })
    expect(result).toHaveLength(1)
  })

  it('passes selectedVersions through to generate without error', () => {
    const a = makeAssistant('a', [{ path: 'file.md', content: 'x' }])
    const result = mergeFiles([], [a], 'proj', { selectedVersions: { react: '19' } })
    expect(result).toHaveLength(1)
  })
})

describe('mergeFiles', () => {
  it('returns all files when there are no conflicts', () => {
    const a = makeAssistant('a', [{ path: 'CLAUDE.md', content: 'claude content' }])
    const b = makeAssistant('b', [{ path: '.cursorrules', content: 'cursor content' }])
    const result = mergeFiles([], [a, b], 'proj')
    expect(result).toHaveLength(2)
    expect(result.find(f => f.path === 'CLAUDE.md')?.content).toBe('claude content')
    expect(result.find(f => f.path === '.cursorrules')?.content).toBe('cursor content')
  })

  it('first writer wins on path conflicts', () => {
    const a = makeAssistant('a', [{ path: '.env.example', content: 'from-a' }])
    const b = makeAssistant('b', [{ path: '.env.example', content: 'from-b' }])
    const result = mergeFiles([], [a, b], 'proj')
    expect(result).toHaveLength(1)
    expect(result[0]?.content).toBe('from-a')
  })

  it('returns empty array when no assistants given', () => {
    const result = mergeFiles([makeTool()], [], 'proj')
    expect(result).toHaveLength(0)
  })

  it('returns empty array when assistant generates no files', () => {
    const a = makeAssistant('a', [])
    const result = mergeFiles([], [a], 'proj')
    expect(result).toHaveLength(0)
  })

  it('passes tools and projectName through to each assistant generate()', () => {
    const tool = makeTool()
    let capturedTools: Tool[] | null = null
    let capturedName: string | null = null
    const a: Assistant = {
      id: 'a', name: 'a', logo: '', description: '', badge: '', usageSteps: [],
      generate(tools, name) {
        capturedTools = tools
        capturedName = name
        return []
      },
    }
    mergeFiles([tool], [a], 'my-project')
    expect(capturedTools).toEqual([tool])
    expect(capturedName).toBe('my-project')
  })

  it('handles multiple files per assistant', () => {
    const a = makeAssistant('a', [
      { path: 'file1.md', content: 'c1' },
      { path: 'file2.md', content: 'c2' },
      { path: 'file3.md', content: 'c3' },
    ])
    const result = mergeFiles([], [a], 'proj')
    expect(result).toHaveLength(3)
  })
})

// ─── generateContextKit ───────────────────────────────────────────────────────

describe('generateContextKit', () => {
  it('returns a valid GenerateResult with summary', async () => {
    const tool = makeTool({ id: 'react', name: 'React' })
    const assistant = makeAssistant('claude-code', [{ path: 'CLAUDE.md', content: '# hello' }])
    const result = await generateContextKit([tool], [assistant], 'test-project')

    expect(result.files).toHaveLength(1)
    expect(result.summary.totalFiles).toBe(1)
    expect(result.summary.tools).toEqual(['React'])
    expect(result.summary.assistants).toEqual(['claude-code'])
    expect(result.zipBlob).toBeInstanceOf(Blob)
  })

  it('produces a non-empty zip blob', async () => {
    const assistant = makeAssistant('a', [{ path: 'README.md', content: 'hi' }])
    const result = await generateContextKit([], [assistant], 'proj')
    expect(result.zipBlob.size).toBeGreaterThan(0)
  })

  it('summary lists all tools and assistants', async () => {
    const tools = [makeTool({ id: 'react', name: 'React' }), makeTool({ id: 'node', name: 'Node.js' })]
    const assistants = [
      makeAssistant('claude-code', [{ path: 'CLAUDE.md', content: '' }]),
      makeAssistant('cursor', [{ path: '.cursorrules', content: '' }]),
    ]
    const result = await generateContextKit(tools, assistants, 'proj')
    expect(result.summary.tools).toEqual(['React', 'Node.js'])
    expect(result.summary.assistants).toEqual(['claude-code', 'cursor'])
  })
})

// ─── downloadZip ─────────────────────────────────────────────────────────────

describe('downloadZip', () => {
  it('creates a temporary anchor and triggers a download', () => {
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    }
    vi.spyOn(document, 'createElement').mockReturnValueOnce(mockAnchor as unknown as HTMLAnchorElement)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as unknown as Node)
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as unknown as Node)
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')

    const blob = new Blob(['test'], { type: 'application/zip' })
    downloadZip(blob, 'My Project')

    expect(mockAnchor.download).toBe('my-project-context-kit.zip')
    expect(mockAnchor.click).toHaveBeenCalled()
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock-url')
  })
})

// ─── Real data smoke tests ────────────────────────────────────────────────────

describe('real data: TOOLS + ASSISTANTS', () => {
  it('every TOOL has required fields', () => {
    for (const tool of TOOLS) {
      expect(tool.id, `${tool.name} missing id`).toBeTruthy()
      expect(tool.name, `${tool.id} missing name`).toBeTruthy()
      expect(tool.bestPractices.length, `${tool.id} has no bestPractices`).toBeGreaterThan(0)
      expect(tool.knowledge.overview, `${tool.id} missing knowledge.overview`).toBeTruthy()
    }
  })

  it('all TOOL ids are unique', () => {
    const ids = TOOLS.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every ASSISTANT generates files for a minimal tool set', () => {
    const tool = TOOLS[0]!
    for (const assistant of ASSISTANTS) {
      const files = assistant.generate([tool], 'smoke-test')
      expect(files.length, `${assistant.id} generated no files`).toBeGreaterThan(0)
      for (const file of files) {
        expect(file.path, `${assistant.id} file missing path`).toBeTruthy()
        expect(file.content, `${assistant.id} file ${file.path} has empty content`).toBeTruthy()
      }
    }
  })

  it('assistants include version in stack header when selectedVersions provided', () => {
    const reactTool = TOOLS.find(t => t.id === 'react')!
    const claudeCode = ASSISTANTS.find(a => a.id === 'claude-code')!
    const files = claudeCode.generate([reactTool], 'proj', { selectedVersions: { react: '19' } })
    const main = files.find(f => f.path === 'CLAUDE.md')
    expect(main?.content).toContain('v19')
  })

  it('assistants inject customRules into generated config', () => {
    const tool = TOOLS[0]!
    const claudeCode = ASSISTANTS.find(a => a.id === 'claude-code')!
    const files = claudeCode.generate([tool], 'proj', { customRules: '- use barrel files everywhere' })
    const main = files.find(f => f.path === 'CLAUDE.md')
    expect(main?.content).toContain('use barrel files everywhere')
    expect(main?.content).toContain('Team Rules')
  })

  it('generateContextKit with all TOOLS and all ASSISTANTS produces valid output', async () => {
    const result = await generateContextKit(TOOLS, ASSISTANTS, 'full-smoke-test')
    expect(result.files.length).toBeGreaterThan(0)
    expect(result.zipBlob.size).toBeGreaterThan(0)
    expect(result.summary.totalFiles).toBe(result.files.length)
    for (const file of result.files) {
      expect(file.content, `file ${file.path} has empty content`).toBeTruthy()
    }
  })

  it('generateContextKit threads options through to generated files', async () => {
    const reactTool = TOOLS.find(t => t.id === 'react')!
    const claudeCode = ASSISTANTS.find(a => a.id === 'claude-code')!
    const result = await generateContextKit(
      [reactTool],
      [claudeCode],
      'proj',
      { selectedVersions: { react: '19' }, customRules: '- no class components ever' },
    )
    const main = result.files.find(f => f.path === 'CLAUDE.md')
    expect(main?.content).toContain('v19')
    expect(main?.content).toContain('no class components ever')
  })
})

// ─── Combos ───────────────────────────────────────────────────────────────────

describe('getActiveCombos', () => {
  it('returns no combos when no tools selected', () => {
    expect(getActiveCombos([])).toHaveLength(0)
  })

  it('returns no combos for tools with no matching combination', () => {
    expect(getActiveCombos(['react'])).toHaveLength(0)
  })

  it('activates next+supabase combo when both selected', () => {
    const combos = getActiveCombos(['nextjs', 'supabase'])
    expect(combos.some(c => c.label === 'Next.js + Supabase')).toBe(true)
  })

  it('does not activate combo when only one of the required tools is selected', () => {
    const combos = getActiveCombos(['nextjs'])
    expect(combos.some(c => c.label === 'Next.js + Supabase')).toBe(false)
  })

  it('activates multiple combos when multiple matching pairs selected', () => {
    const combos = getActiveCombos(['nextjs', 'supabase', 'prisma'])
    const labels = combos.map(c => c.label)
    expect(labels).toContain('Next.js + Supabase')
    expect(labels).toContain('Next.js + Prisma')
  })
})

// ─── Presets ──────────────────────────────────────────────────────────────────

describe('PRESETS', () => {
  it('every preset tool id exists in TOOLS', () => {
    const toolIds = new Set(TOOLS.map(t => t.id))
    for (const preset of PRESETS) {
      for (const id of preset.tools) {
        expect(toolIds.has(id), `Preset "${preset.name}" references unknown tool id "${id}"`).toBe(true)
      }
    }
  })
})
