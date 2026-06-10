import { CompanionVariableDefinitions, CompanionVariableValues } from '@companion-module/base'
import type { ShowCastState } from './types.js'

export function getVariableDefinitions(): CompanionVariableDefinitions {
  return {
    live_page_name:       { name: 'Live Page Name' },
    live_page_id:         { name: 'Live Page ID (UUID)' },
    rundown_position:     { name: 'Rundown Position (1-based)' },
    rundown_total:        { name: 'Rundown Total Items' },
    rundown_current_name: { name: 'Rundown Current Item Name' },
    audio_track_name:       { name: 'Audio Track Name' },
    audio_playing:          { name: 'Audio Playing (true/false)' },
    audio_position:         { name: 'Audio Position (M:SS)' },
    audio_duration:         { name: 'Audio Duration (M:SS)' },
    audio_remaining:        { name: 'Audio Remaining (M:SS)' },
    video_track_name:        { name: 'Video Track Name' },
    video_playing:          { name: 'Video Playing (true/false)' },
    video_position:         { name: 'Video Position (M:SS)' },
    video_duration:         { name: 'Video Duration (M:SS)' },
    video_remaining:        { name: 'Video Remaining (M:SS)' },
    selected_output_name:   { name: 'Selected Output Name' },
  }
}

function fmtMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function buildVariableValues(state: ShowCastState): CompanionVariableValues {
  const audioRemMs = Math.max(0, state.audio.durationMs - state.audio.positionMs)
  const videoRemMs = Math.max(0, state.video.durationMs - state.video.positionMs)
  return {
    live_page_name:       state.page?.name ?? '',
    live_page_id:         state.page?.id ?? '',
    rundown_position:     String(state.rundown.pos + 1),
    rundown_total:        String(state.rundown.total),
    rundown_current_name: state.rundown.currentName,
    audio_track_name:       state.audio.trackName,
    audio_playing:          String(state.audio.playing),
    audio_position:         fmtMs(state.audio.positionMs),
    audio_duration:         fmtMs(state.audio.durationMs),
    audio_remaining:        fmtMs(audioRemMs),
    video_track_name:        state.video.trackName,
    video_playing:          String(state.video.playing),
    video_position:         fmtMs(state.video.positionMs),
    video_duration:         fmtMs(state.video.durationMs),
    video_remaining:        fmtMs(videoRemMs),
    selected_output_name:   state.selectedOutputName,
  }
}
