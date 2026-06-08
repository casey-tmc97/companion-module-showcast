import { combineRgb } from '@companion-module/base'
import { getFeedbacks } from '../feedbacks'
import type { ShowCastState } from '../types'

function makeState(overrides: Partial<ShowCastState> = {}): ShowCastState {
  return {
    page: null,
    rundown: { pos: 0, total: 0, currentName: '' },
    audio: { playing: false, trackName: '', playlists: [] },
    scheduler: { running: false },
    outputs: [{ id: 'out-1', name: 'Main', blanked: false }],
    ...overrides,
  }
}

function makeInstance(state: ShowCastState | null) {
  return { state } as any
}

function evalFeedback(
  feedbacks: ReturnType<typeof getFeedbacks>,
  id: string,
  state: ShowCastState | null,
  options: Record<string, unknown> = {},
): boolean {
  const def = feedbacks[id] as any
  return def.callback({ options }, {})
}

describe('getFeedbacks', () => {
  test('page_is_live: true when state.page is not null', () => {
    const state = makeState({ page: { id: 'p1', name: 'Slide 1' } })
    const feedbacks = getFeedbacks(makeInstance(state))
    expect(evalFeedback(feedbacks, 'page_is_live', state)).toBe(true)
  })

  test('page_is_live: false when state.page is null', () => {
    const state = makeState({ page: null })
    const feedbacks = getFeedbacks(makeInstance(state))
    expect(evalFeedback(feedbacks, 'page_is_live', state)).toBe(false)
  })

  test('page_is_live: false when state is null', () => {
    const feedbacks = getFeedbacks(makeInstance(null))
    expect(evalFeedback(feedbacks, 'page_is_live', null)).toBe(false)
  })

  test('audio_is_playing: true when audio.playing is true', () => {
    const state = makeState({ audio: { playing: true, trackName: 'Track', playlists: [] } })
    const feedbacks = getFeedbacks(makeInstance(state))
    expect(evalFeedback(feedbacks, 'audio_is_playing', state)).toBe(true)
  })

  test('audio_is_playing: false when audio.playing is false', () => {
    const state = makeState()
    const feedbacks = getFeedbacks(makeInstance(state))
    expect(evalFeedback(feedbacks, 'audio_is_playing', state)).toBe(false)
  })

  test('scheduler_is_running: true when scheduler.running is true', () => {
    const state = makeState({ scheduler: { running: true } })
    const feedbacks = getFeedbacks(makeInstance(state))
    expect(evalFeedback(feedbacks, 'scheduler_is_running', state)).toBe(true)
  })

  test('scheduler_is_running: false when scheduler.running is false', () => {
    const state = makeState()
    const feedbacks = getFeedbacks(makeInstance(state))
    expect(evalFeedback(feedbacks, 'scheduler_is_running', state)).toBe(false)
  })

  test('output_is_blanked: true when matching output is blanked', () => {
    const state = makeState({ outputs: [{ id: 'out-1', name: 'Main', blanked: true }] })
    const feedbacks = getFeedbacks(makeInstance(state))
    expect(evalFeedback(feedbacks, 'output_is_blanked', state, { outputId: 'out-1' })).toBe(true)
  })

  test('output_is_blanked: false when matching output is not blanked', () => {
    const state = makeState({ outputs: [{ id: 'out-1', name: 'Main', blanked: false }] })
    const feedbacks = getFeedbacks(makeInstance(state))
    expect(evalFeedback(feedbacks, 'output_is_blanked', state, { outputId: 'out-1' })).toBe(false)
  })

  test('output_is_blanked: false when outputId does not match any output', () => {
    const state = makeState()
    const feedbacks = getFeedbacks(makeInstance(state))
    expect(evalFeedback(feedbacks, 'output_is_blanked', state, { outputId: 'no-such-id' })).toBe(false)
  })
})
