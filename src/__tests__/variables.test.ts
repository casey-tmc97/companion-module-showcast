import { buildVariableValues, getVariableDefinitions } from '../variables'
import type { ShowCastState } from '../types'

function makeState(overrides: Partial<ShowCastState> = {}): ShowCastState {
  return {
    page: null,
    rundown: { pos: 0, total: 5, currentName: 'Opener' },
    audio: { playing: false, trackName: '', playlists: [] },
    scheduler: { running: false },
    outputs: [],
    ...overrides,
  }
}

describe('getVariableDefinitions', () => {
  test('exports definitions for all 8 variables', () => {
    const ids = Object.keys(getVariableDefinitions())
    expect(ids).toEqual(expect.arrayContaining([
      'live_page_name', 'live_page_id',
      'rundown_position', 'rundown_total', 'rundown_current_name',
      'audio_track_name', 'audio_playing',
      'scheduler_running',
    ]))
    expect(ids).toHaveLength(8)
  })
})

describe('buildVariableValues', () => {
  test('live_page_name is empty string when page is null', () => {
    expect(buildVariableValues(makeState()).live_page_name).toBe('')
  })

  test('live_page_name is page name when page is set', () => {
    const state = makeState({ page: { id: 'p1', name: 'Welcome' } })
    expect(buildVariableValues(state).live_page_name).toBe('Welcome')
  })

  test('live_page_id is empty string when page is null', () => {
    expect(buildVariableValues(makeState()).live_page_id).toBe('')
  })

  test('live_page_id is page id when page is set', () => {
    const state = makeState({ page: { id: 'abc-123', name: 'Slide' } })
    expect(buildVariableValues(state).live_page_id).toBe('abc-123')
  })

  test('rundown_position is 1-based string of pos', () => {
    const state = makeState({ rundown: { pos: 2, total: 10, currentName: 'Item' } })
    expect(buildVariableValues(state).rundown_position).toBe('3')
  })

  test('rundown_total is string of total', () => {
    expect(buildVariableValues(makeState()).rundown_total).toBe('5')
  })

  test('rundown_current_name matches state', () => {
    expect(buildVariableValues(makeState()).rundown_current_name).toBe('Opener')
  })

  test('audio_playing is "true" when playing', () => {
    const state = makeState({ audio: { playing: true, trackName: 'Song', playlists: [] } })
    expect(buildVariableValues(state).audio_playing).toBe('true')
  })

  test('audio_playing is "false" when not playing', () => {
    expect(buildVariableValues(makeState()).audio_playing).toBe('false')
  })

  test('audio_track_name is track name when playing', () => {
    const state = makeState({ audio: { playing: true, trackName: 'Amazing Grace', playlists: [] } })
    expect(buildVariableValues(state).audio_track_name).toBe('Amazing Grace')
  })

  test('scheduler_running is "true" when running', () => {
    const state = makeState({ scheduler: { running: true } })
    expect(buildVariableValues(state).scheduler_running).toBe('true')
  })

  test('scheduler_running is "false" when not running', () => {
    expect(buildVariableValues(makeState()).scheduler_running).toBe('false')
  })
})
