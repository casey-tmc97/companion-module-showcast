import { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import type { ShowCastState } from './types'

export function getVariableDefinitions(): CompanionVariableDefinition[] {
  return [
    { variableId: 'live_page_name',       name: 'Live Page Name' },
    { variableId: 'live_page_id',         name: 'Live Page ID (UUID)' },
    { variableId: 'rundown_position',     name: 'Rundown Position (1-based)' },
    { variableId: 'rundown_total',        name: 'Rundown Total Items' },
    { variableId: 'rundown_current_name', name: 'Rundown Current Item Name' },
    { variableId: 'audio_track_name',     name: 'Audio Track Name' },
    { variableId: 'audio_playing',        name: 'Audio Playing (true/false)' },
    { variableId: 'scheduler_running',    name: 'Scheduler Running (true/false)' },
  ]
}

export function buildVariableValues(state: ShowCastState): CompanionVariableValues {
  return {
    live_page_name:       state.page?.name ?? '',
    live_page_id:         state.page?.id ?? '',
    rundown_position:     String(state.rundown.pos + 1),
    rundown_total:        String(state.rundown.total),
    rundown_current_name: state.rundown.currentName,
    audio_track_name:     state.audio.trackName,
    audio_playing:        String(state.audio.playing),
    scheduler_running:    String(state.scheduler.running),
  }
}
