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
    selected_output_name:   { name: 'Selected Output Name' },
  }
}

export function buildVariableValues(state: ShowCastState): CompanionVariableValues {
  return {
    live_page_name:       state.page?.name ?? '',
    live_page_id:         state.page?.id ?? '',
    rundown_position:     String(state.rundown.pos + 1),
    rundown_total:        String(state.rundown.total),
    rundown_current_name: state.rundown.currentName,
    audio_track_name:       state.audio.trackName,
    audio_playing:          String(state.audio.playing),
    selected_output_name:   state.selectedOutputName,
  }
}
