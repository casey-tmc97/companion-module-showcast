import { buildVariableValues, getVariableDefinitions } from '../variables'
import type { ShowCastState } from '../types'

function makeState(overrides: Partial<ShowCastState> = {}): ShowCastState {
  return {
    page: null,
    rundown: { pos: 0, total: 5, currentName: 'Opener' },
    audio: { playing: false, trackName: '', positionMs: 0, durationMs: 0, playlists: [] },
    video: { playing: false, trackName: '', positionMs: 0, durationMs: 0 },
    outputs: [],
    selectedOutputName: '',
    ...overrides,
  }
}

describe('getVariableDefinitions', () => {
  test('exports definitions for all expected variables', () => {
    const ids = Object.keys(getVariableDefinitions())
    expect(ids).toEqual(expect.arrayContaining([
      'live_page_name', 'live_page_id',
      'rundown_position', 'rundown_total', 'rundown_current_name',
      'audio_track_name', 'audio_playing', 'audio_position', 'audio_duration', 'audio_remaining',
      'video_track_name', 'video_playing', 'video_position', 'video_duration', 'video_remaining',
      'selected_output_name',
    ]))
    expect(ids).toHaveLength(16)
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
    const state = makeState({ audio: { playing: true, trackName: 'Song', positionMs: 0, durationMs: 0, playlists: [] } })
    expect(buildVariableValues(state).audio_playing).toBe('true')
  })

  test('audio_playing is "false" when not playing', () => {
    expect(buildVariableValues(makeState()).audio_playing).toBe('false')
  })

  test('audio_track_name matches state', () => {
    const state = makeState({ audio: { playing: true, trackName: 'Amazing Grace', positionMs: 0, durationMs: 0, playlists: [] } })
    expect(buildVariableValues(state).audio_track_name).toBe('Amazing Grace')
  })

  test('audio_position formats M:SS', () => {
    const state = makeState({ audio: { playing: true, trackName: '', positionMs: 75000, durationMs: 180000, playlists: [] } })
    expect(buildVariableValues(state).audio_position).toBe('1:15')
  })

  test('audio_remaining clamps to zero', () => {
    const state = makeState({ audio: { playing: false, trackName: '', positionMs: 0, durationMs: 0, playlists: [] } })
    expect(buildVariableValues(state).audio_remaining).toBe('0:00')
  })

  test('video_track_name matches state', () => {
    const state = makeState({ video: { playing: true, trackName: 'Countdown', positionMs: 0, durationMs: 10000 } })
    expect(buildVariableValues(state).video_track_name).toBe('Countdown')
  })

  test('video_playing is "true" when playing', () => {
    const state = makeState({ video: { playing: true, trackName: '', positionMs: 0, durationMs: 10000 } })
    expect(buildVariableValues(state).video_playing).toBe('true')
  })

  test('video_playing is "false" when not playing', () => {
    expect(buildVariableValues(makeState()).video_playing).toBe('false')
  })

  test('video_position formats M:SS', () => {
    const state = makeState({ video: { playing: true, trackName: '', positionMs: 90000, durationMs: 120000 } })
    expect(buildVariableValues(state).video_position).toBe('1:30')
  })

  test('video_remaining clamps to zero', () => {
    const state = makeState({ video: { playing: false, trackName: '', positionMs: 0, durationMs: 0 } })
    expect(buildVariableValues(state).video_remaining).toBe('0:00')
  })

  test('selected_output_name matches state', () => {
    const state = makeState({ selectedOutputName: 'Main Output' })
    expect(buildVariableValues(state).selected_output_name).toBe('Main Output')
  })
})
