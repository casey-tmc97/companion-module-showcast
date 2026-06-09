import { CompanionActionDefinitions } from '@companion-module/base'
import type { ShowCastState } from './types.js'

interface ActionInstance {
  state: ShowCastState | null
  sendCommand: (cmd: object) => void
}

export function getActions(instance: ActionInstance): CompanionActionDefinitions {
  const outputChoices = instance.state?.outputs.map((o) => ({ id: o.id, label: o.name })) ?? []
  const playlistChoices = instance.state?.audio.playlists.map((p) => ({ id: p.id, label: p.name })) ?? []

  return {
    page_advance: {
      name: 'Go Live & Advance',
      description: 'Sends the current queued page to the live display, then advances the queue to the next page. Primary action for stepping through content during a service or presentation.',
      options: [],
      callback: async () => instance.sendCommand({ type: 'page_advance' }),
    },

    page_back: {
      name: 'Page Back',
      description: 'Steps the queue backward one page without taking anything live. Use to back up after advancing too far.',
      options: [],
      callback: async () => instance.sendCommand({ type: 'page_back' }),
    },

    page_clear: {
      name: 'Clear All',
      description: 'Removes live content from every output simultaneously, leaving all displays blank.',
      options: [],
      callback: async () => instance.sendCommand({ type: 'page_clear' }),
    },

    output_clear: {
      name: 'Clear Output',
      description: 'Removes live content from a single selected output without affecting other outputs.',
      options: [
        {
          type: 'dropdown',
          id: 'outputId',
          label: 'Output',
          default: '',
          choices: outputChoices,
        },
      ],
      callback: async (action) =>
        instance.sendCommand({ type: 'output_clear', outputId: action.options['outputId'] as string }),
    },

    page_live: {
      name: 'Go Live: Specific Page',
      description: 'Takes a specific page live immediately by its UUID, bypassing the normal queue order. Use for dedicated shortcut buttons that always jump to a known page.',
      options: [
        {
          type: 'textinput',
          id: 'pageId',
          label: 'Page ID (UUID)',
          default: '',
        },
      ],
      callback: async (action) =>
        instance.sendCommand({ type: 'page_live', pageId: action.options['pageId'] as string }),
    },

    rundown_next: {
      name: 'Rundown: Next',
      description: 'Advances to the next item in the rundown. Use to step through the order of service — songs, segments, announcements.',
      options: [],
      callback: async () => instance.sendCommand({ type: 'rundown_next' }),
    },

    rundown_goto: {
      name: 'Rundown: Go To Index',
      description: 'Jumps the rundown to a specific position by index (0-based). Use for dedicated buttons that skip directly to a known segment.',
      options: [
        {
          type: 'number',
          id: 'index',
          label: 'Index (0-based; note variable rundown_position is 1-based for display)',
          default: 0,
          min: 0,
          max: 9999,
        },
      ],
      callback: async (action) =>
        instance.sendCommand({ type: 'rundown_goto', index: action.options['index'] as number }),
    },

    audio_play: {
      name: 'Audio: Play Playlist',
      description: 'Starts playback of a selected playlist. Use for pre-service background music, countdown audio, or transitional music between segments.',
      options: [
        {
          type: 'dropdown',
          id: 'playlistId',
          label: 'Playlist',
          default: '',
          choices: playlistChoices,
        },
      ],
      callback: async (action) =>
        instance.sendCommand({ type: 'audio_play', id: action.options['playlistId'] as string }),
    },

    audio_stop: {
      name: 'Audio: Stop All',
      description: 'Immediately stops all audio playback. Use as an emergency stop or to cut music when the service begins.',
      options: [],
      callback: async () => instance.sendCommand({ type: 'audio_stop' }),
    },

    scheduler_start: {
      name: 'Scheduler: Start',
      description: 'Activates the ShowCast scheduler so content runs automatically at pre-programmed times. Use to hand off control from manual operation to timed automation.',
      options: [],
      callback: async () => instance.sendCommand({ type: 'scheduler_start' }),
    },

    scheduler_stop: {
      name: 'Scheduler: Stop',
      description: 'Disables the scheduler and stops automated content progression. Use to take back manual control or override a running schedule.',
      options: [],
      callback: async () => instance.sendCommand({ type: 'scheduler_stop' }),
    },

    output_blank: {
      name: 'Output: Blank',
      description: 'Blacks out a specific output while preserving its current page, so it can be restored with Unblank. Use for per-screen kill switches in multi-display setups.',
      options: [
        {
          type: 'dropdown',
          id: 'outputId',
          label: 'Output',
          default: '',
          choices: outputChoices,
        },
      ],
      callback: async (action) =>
        instance.sendCommand({ type: 'output_blank', outputId: action.options['outputId'] as string }),
    },

    output_unblank: {
      name: 'Output: Unblank',
      description: 'Restores a blanked output to show its previously live content. Pair with Output: Blank on a toggle button for a per-screen confidence monitor kill switch.',
      options: [
        {
          type: 'dropdown',
          id: 'outputId',
          label: 'Output',
          default: '',
          choices: outputChoices,
        },
      ],
      callback: async (action) =>
        instance.sendCommand({ type: 'output_unblank', outputId: action.options['outputId'] as string }),
    },

    get_state: {
      name: 'Refresh State',
      description: 'Manually requests a fresh state snapshot from ShowCast. State is normally pushed automatically — use this as a diagnostic fallback if variables or feedbacks appear stale.',
      options: [],
      callback: async () => instance.sendCommand({ type: 'get_state' }),
    },
  }
}
