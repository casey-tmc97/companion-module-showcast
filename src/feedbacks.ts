import { combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import type { ShowCastState } from './types'

interface FeedbackInstance {
  state: ShowCastState | null
}

export function getFeedbacks(instance: FeedbackInstance): CompanionFeedbackDefinitions {
  return {
    page_is_live: {
      type: 'boolean',
      name: 'Page Is Live',
      description: 'Active when a page is currently live on the selected output',
      defaultStyle: {
        bgcolor: combineRgb(0, 180, 0),
        color: combineRgb(255, 255, 255),
      },
      options: [],
      callback: () => instance.state?.page !== null && instance.state?.page !== undefined,
    },

    audio_is_playing: {
      type: 'boolean',
      name: 'Audio Playing',
      description: 'Active when any audio channel is playing',
      defaultStyle: {
        bgcolor: combineRgb(0, 180, 0),
        color: combineRgb(255, 255, 255),
      },
      options: [],
      callback: () => instance.state?.audio.playing === true,
    },

    scheduler_is_running: {
      type: 'boolean',
      name: 'Scheduler Running',
      description: 'Active when the ShowCast scheduler is running',
      defaultStyle: {
        bgcolor: combineRgb(0, 100, 200),
        color: combineRgb(255, 255, 255),
      },
      options: [],
      callback: () => instance.state?.scheduler.running === true,
    },

    output_is_blanked: {
      type: 'boolean',
      name: 'Output Blanked',
      description: 'Active when the specified output is blanked',
      defaultStyle: {
        bgcolor: combineRgb(200, 0, 0),
        color: combineRgb(255, 255, 255),
      },
      options: [
        {
          type: 'dropdown',
          id: 'outputId',
          label: 'Output',
          default: '',
          choices: instance.state?.outputs.map((o) => ({ id: o.id, label: o.name })) ?? [],
        },
      ],
      callback: (feedback) => {
        const outputId = feedback.options['outputId'] as string
        const output = instance.state?.outputs.find((o) => o.id === outputId)
        return output?.blanked === true
      },
    },
  }
}
