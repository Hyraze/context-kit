import JSZip from 'jszip'
import type { Tool } from '../data/tools'
import type { Assistant, GenerateOptions, OutputFile } from '../data/assistants'

export type { GenerateOptions }

export interface GenerateResult {
  files: OutputFile[]
  zipBlob: Blob
  summary: {
    totalFiles: number
    tools: string[]
    assistants: string[]
  }
}

/** Merge files from multiple assistants — first writer wins on path conflicts */
export function mergeFiles(
  tools: Tool[],
  assistants: Assistant[],
  projectName: string,
  options?: GenerateOptions,
): OutputFile[] {
  const seen = new Map<string, string>()
  for (const assistant of assistants) {
    for (const file of assistant.generate(tools, projectName, options)) {
      if (!seen.has(file.path)) {
        seen.set(file.path, file.content)
      }
    }
  }
  return Array.from(seen.entries()).map(([path, content]) => ({ path, content }))
}

export async function generateContextKit(
  tools: Tool[],
  assistants: Assistant[],
  projectName: string,
  options?: GenerateOptions,
): Promise<GenerateResult> {
  const files = mergeFiles(tools, assistants, projectName, options)

  const zip = new JSZip()
  for (const file of files) {
    zip.file(file.path, file.content)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })

  return {
    files,
    zipBlob,
    summary: {
      totalFiles: files.length,
      tools: tools.map(t => t.name),
      assistants: assistants.map(a => a.name),
    },
  }
}

export function downloadZip(blob: Blob, projectName: string) {
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-context-kit.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function copyToClipboard(content: string): Promise<void> {
  return navigator.clipboard.writeText(content)
}
