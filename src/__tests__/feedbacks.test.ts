import { getFeedbacks } from '../feedbacks'
import type { ShowCastState } from '../types'

function makeState(overrides: Partial<ShowCastState> = {}): ShowCastState {
  return {
    page: null,
    rundown: { pos: 0, total: 0, currentName: '' },
    audio: { playing: false, trackName: '', positionMs: 0, durationMs: 0, playlists: [] },
    video: { playing: false, trackName: '', positionMs: 0, durationMs: 0 },
    outputs: [{ id: 'out-1', name: 'Main', blanked: false }],
    selectedOutputName: '',
    ...overrides,
  }
}

function makeInstance(state: ShowCastState | null) {
  return { state } as any
}

function evalFeedback(
  feedbacks: ReturnType<typeof getFeedbacks>,
  id: string,
  options: Record<string, unknown> = {},
): boolean {
  const def = feedbacks[id] as any
  return def.callback({ options }, {})
}

describe('getFeedbacks', () => {
  test('page_is_live: true when state.page is not null', () => {
    const state = makeState({ page: { id: 'p1', name: 'Slide 1' } })
    expect(evalFeedback(getFeedbacks(makeInstance(state)), 'page_is_live')).toBe(true)
  })

  test('page_is_live: false when state.page is null', () => {
    const state = makeState({ page: null })
    expect(evalFeedback(getFeedbacks(makeInstance(state)), 'page_is_live')).toBe(false)
  })

  test('page_is_live: false when state is null', () => {
    expect(evalFeedback(getFeedbacks(makeInstance(null)), 'page_is_live')).toBe(false)
  })

  test('page_name_is_live: true when page name matches', () => {
    const state = makeState({ page: { id: 'p1', name: 'Welcome' } })
    expect(evalFeedback(getFeedbacks(makeInstance(state)), 'page_name_is_live', { pageName: 'Welcome' })).toBe(true)
  })

  test('page_name_is_live: true when name match is case-insensitive', () => {
    const state = makeState({ page: { id: 'p1', name: 'Welcome' } })
    expect(evalFeedback(getFeedbacks(makeInstance(state)), 'page_name_is_live', { pageName: 'welcome' })).toBe(true)
  })

  test('page_name_is_live: false when page name does not match', () => {
    const state = makeState({ page: { id: 'p1', name: 'Welcome' } })
    expect(evalFeedback(getFeedbacks(makeInstance(state)), 'page_name_is_live', { pageName: 'Goodbye' })).toBe(false)
  })

  test('page_name_is_live: true when UUID matches', () => {
    const state = makeState({ page: { id: 'abc-123', name: 'Welcome' } })
    expect(evalFeedback(getFeedbacks(makeInstance(state)), 'page_name_is_live', { pageName: 'abc-123' })).toBe(true)
  })

  test('page_name_is_live: false when no page is live', () => {
    expect(evalFeedback(getFeedbacks(makeInstance(makeState())), 'page_name_is_live', { pageName: 'Welcome' })).toBe(false)
  })

  test('audio_is_playing: true when audio.playing is true', () => {
    const state = makeState({ audio: { playing: true, trackName: 'Track', positionMs: 0, durationMs: 0, playlists: [] } })
    expect(evalFeedback(getFeedbacks(makeInstance(state)), 'audio_is_playing')).toBe(true)
  })

  test('audio_is_playing: false when audio.playing is false', () => {
    expect(evalFeedback(getFeedbacks(makeInstance(makeState())), 'audio_is_playing')).toBe(false)
  })

  test('video_is_playing: true when video.playing is true', () => {
    const state = makeState({ video: { playing: true, trackName: 'Countdown', positionMs: 0, durationMs: 10000 } })
    expect(evalFeedback(getFeedbacks(makeInstance(state)), 'video_is_playing')).toBe(true)
  })

  test('video_is_playing: false when video.playing is false', () => {
    expect(evalFeedback(getFeedbacks(makeInstance(makeState())), 'video_is_playing')).toBe(false)
  })

  test('output_is_blanked: true when output with matching name is blanked', () => {
    const state = makeState({ outputs: [{ id: 'out-1', name: 'Main', blanked: true }] })
    expect(evalFeedback(getFeedbacks(makeInstance(state)), 'output_is_blanked', { outputName: 'Main' })).toBe(true)
  })

  test('output_is_blanked: true when name match is case-insensitive', () => {
    const state = makeState({ outputs: [{ id: 'out-1', name: 'Main', blanked: true }] })
    expect(evalFeedback(getFeedbacks(makeInstance(state)), 'output_is_blanked', { outputName: 'main' })).toBe(true)
  })

  test('output_is_blanked: false when matching output is not blanked', () => {
    const state = makeState({ outputs: [{ id: 'out-1', name: 'Main', blanked: false }] })
    expect(evalFeedback(getFeedbacks(makeInstance(state)), 'output_is_blanked', { outputName: 'Main' })).toBe(false)
  })

  test('output_is_blanked: false when name does not match any output', () => {
    expect(evalFeedback(getFeedbacks(makeInstance(makeState())), 'output_is_blanked', { outputName: 'Nonexistent' })).toBe(false)
  })

  test('output_is_blanked: false when state is null', () => {
    expect(evalFeedback(getFeedbacks(makeInstance(null)), 'output_is_blanked', { outputName: 'Main' })).toBe(false)
  })
})
