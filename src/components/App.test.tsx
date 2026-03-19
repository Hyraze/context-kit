import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import App from '../App'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function currentStepLabel(): string {
  const el = document.querySelector('[aria-current="step"]')
  if (!el) throw new Error('No element with aria-current="step" found')
  return el.textContent ?? ''
}

/** Tool toggle buttons have aria-label "Add {name}" when unselected */
function clickFirstTool(): void {
  const btn = screen.getAllByRole('button').find(
    b => b.getAttribute('aria-label')?.startsWith('Add '),
  )
  if (!btn) throw new Error('No unselected tool button found')
  fireEvent.click(btn)
}

/** Assistant toggle buttons use aria-label "Select {name}" when unselected */
function clickFirstAssistant(): void {
  const btn = screen.getAllByRole('button').find(
    b => b.getAttribute('aria-label')?.startsWith('Select '),
  )
  if (!btn) throw new Error('No unselected assistant button found')
  fireEvent.click(btn)
}

function getContinueButton(): HTMLElement {
  const btn = screen.getAllByRole('button').find(
    b => b.getAttribute('aria-label')?.startsWith('Continue to'),
  )
  if (!btn) throw new Error('No Continue button found')
  return btn
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// ─── Wizard navigation ───────────────────────────────────────────────────────

describe('App wizard navigation', () => {
  it('renders step 1 (Stack) on initial load', () => {
    render(<App />)
    expect(currentStepLabel()).toContain('Stack')
  })

  it('Continue button is disabled when no tools are selected', () => {
    render(<App />)
    expect(getContinueButton()).toBeDisabled()
  })

  it('Continue button enables after selecting a tool', () => {
    render(<App />)
    clickFirstTool()
    expect(getContinueButton()).not.toBeDisabled()
  })

  it('navigates from step 1 to step 2 after selecting a tool', () => {
    render(<App />)
    clickFirstTool()
    fireEvent.click(getContinueButton())
    expect(currentStepLabel()).toContain('Assistant')
  })

  it('Back button is disabled on step 1', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /previous step/i })).toBeDisabled()
  })

  it('Back button returns to step 1 from step 2', () => {
    render(<App />)
    clickFirstTool()
    fireEvent.click(getContinueButton())
    expect(currentStepLabel()).toContain('Assistant')
    fireEvent.click(screen.getByRole('button', { name: /previous step/i }))
    expect(currentStepLabel()).toContain('Stack')
  })

  it('shows step hint when one tool is selected', () => {
    render(<App />)
    clickFirstTool()
    const live = document.querySelector('[aria-live="polite"]')
    expect(live?.textContent).toMatch(/1 tool selected/)
  })
})

// ─── Project name ─────────────────────────────────────────────────────────────

describe('App project name', () => {
  it('renders the project name input on step 1', () => {
    render(<App />)
    expect(screen.getByLabelText(/project name/i)).toBeTruthy()
  })

  it('updates project name when typed', () => {
    render(<App />)
    const input = screen.getByLabelText(/project name/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'my-app' } })
    expect(input.value).toBe('my-app')
  })

  it('defaults to my-project when cleared', () => {
    render(<App />)
    const input = screen.getByLabelText(/project name/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: '' } })
    expect(input.value).toBe('my-project')
  })
})

// ─── Step 2: Assistant picker ─────────────────────────────────────────────────

describe('App step 2', () => {
  function advanceToStep2() {
    render(<App />)
    clickFirstTool()
    fireEvent.click(getContinueButton())
  }

  it('Continue button is disabled when no assistants selected', () => {
    advanceToStep2()
    expect(getContinueButton()).toBeDisabled()
  })

  it('Continue enables after selecting an assistant', () => {
    advanceToStep2()
    clickFirstAssistant()
    expect(getContinueButton()).not.toBeDisabled()
  })

  it('shows assistant step hint when one assistant is selected', () => {
    advanceToStep2()
    clickFirstAssistant()
    const live = document.querySelector('[aria-live="polite"]')
    expect(live?.textContent).toMatch(/1 assistant selected/)
  })
})

// ─── Reset ───────────────────────────────────────────────────────────────────

describe('App reset', () => {
  it('reaches the Download step after selecting tool + assistant', () => {
    render(<App />)
    clickFirstTool()
    fireEvent.click(getContinueButton())
    clickFirstAssistant()
    fireEvent.click(getContinueButton())
    expect(currentStepLabel()).toContain('Download')
  })

  it('Start over returns to step 1', () => {
    render(<App />)
    clickFirstTool()
    fireEvent.click(getContinueButton())
    clickFirstAssistant()
    fireEvent.click(getContinueButton())
    fireEvent.click(screen.getByRole('button', { name: /start over/i }))
    expect(currentStepLabel()).toContain('Stack')
    // Project name input reappears on step 1
    expect(screen.getByLabelText(/project name/i)).toBeTruthy()
  })
})

// ─── URL persistence ─────────────────────────────────────────────────────────

describe('App URL state', () => {
  it('writes selected tool id to URL', async () => {
    render(<App />)
    await act(async () => { clickFirstTool() })
    expect(window.location.search).toContain('stack=')
  })

  it('writes step to URL when navigating', async () => {
    render(<App />)
    await act(async () => { clickFirstTool() })
    await act(async () => { fireEvent.click(getContinueButton()) })
    expect(window.location.search).toContain('step=1')
  })

  it('reads step from URL on initial load', () => {
    window.history.replaceState(null, '', '/?step=1&stack=react&assistants=cursor')
    render(<App />)
    expect(currentStepLabel()).toContain('Assistant')
  })

  it('reads tool selection from URL on initial load', () => {
    window.history.replaceState(null, '', '/?stack=react')
    render(<App />)
    // React tool should be selected (aria-label "Remove React")
    expect(
      screen.getAllByRole('button').some(b => b.getAttribute('aria-label') === 'Remove React')
    ).toBe(true)
  })
})
