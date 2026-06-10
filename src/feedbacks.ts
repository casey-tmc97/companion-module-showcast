import { combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import type { ShowCastState } from './types.js'

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

    page_name_is_live: {
      type: 'boolean',
      name: 'Specific Page Is Live',
      description: 'Active when the specified page is currently live on the selected output (match by name or UUID)',
      defaultStyle: {
        bgcolor: combineRgb(0, 180, 0),
        color: combineRgb(255, 255, 255),
      },
      options: [
        {
          type: 'textinput',
          id: 'pageName',
          label: 'Page Name or UUID',
          default: '',
        },
      ],
      callback: (feedback) => {
        const input = (feedback.options['pageName'] as string).trim().toLowerCase()
        const page = instance.state?.page
        if (!page) return false
        return page.name.toLowerCase() === input || page.id.toLowerCase() === input
      },
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

    video_is_playing: {
      type: 'boolean',
      name: 'Video Playing',
      description: 'Active when a video is currently playing on the selected output',
      defaultStyle: {
        bgcolor: combineRgb(0, 180, 0),
        color: combineRgb(255, 255, 255),
      },
      options: [],
      callback: () => instance.state?.video.playing === true,
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
          type: 'textinput',
          id: 'outputName',
          label: 'Output Name',
          default: '',
        },
      ],
      callback: (feedback) => {
        const outputName = (feedback.options['outputName'] as string).trim().toLowerCase()
        const output = instance.state?.outputs.find((o) => o.name.toLowerCase() === outputName)
        return output?.blanked === true
      },
    },
  }
}
