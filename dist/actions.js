export function getActions(instance) {
    const outputChoices = instance.state?.outputs.map((o) => ({ id: o.id, label: o.name })) ?? [];
    const playlistChoices = instance.state?.audio.playlists.map((p) => ({ id: p.id, label: p.name })) ?? [];
    return {
        page_advance: {
            name: 'Go Live & Advance',
            options: [],
            callback: async () => instance.sendCommand({ type: 'page_advance' }),
        },
        page_back: {
            name: 'Page Back',
            options: [],
            callback: async () => instance.sendCommand({ type: 'page_back' }),
        },
        page_clear: {
            name: 'Clear Live',
            options: [],
            callback: async () => instance.sendCommand({ type: 'page_clear' }),
        },
        page_live: {
            name: 'Go Live: Specific Page',
            options: [
                {
                    type: 'textinput',
                    id: 'pageId',
                    label: 'Page ID (UUID)',
                    default: '',
                },
            ],
            callback: async (action) => instance.sendCommand({ type: 'page_live', pageId: action.options['pageId'] }),
        },
        rundown_next: {
            name: 'Rundown: Next',
            options: [],
            callback: async () => instance.sendCommand({ type: 'rundown_next' }),
        },
        rundown_goto: {
            name: 'Rundown: Go To Index',
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
            callback: async (action) => instance.sendCommand({ type: 'rundown_goto', index: action.options['index'] }),
        },
        audio_play: {
            name: 'Audio: Play Playlist',
            options: [
                {
                    type: 'dropdown',
                    id: 'playlistId',
                    label: 'Playlist',
                    default: '',
                    choices: playlistChoices,
                },
            ],
            callback: async (action) => instance.sendCommand({ type: 'audio_play', id: action.options['playlistId'] }),
        },
        audio_stop: {
            name: 'Audio: Stop All',
            options: [],
            callback: async () => instance.sendCommand({ type: 'audio_stop' }),
        },
        scheduler_start: {
            name: 'Scheduler: Start',
            options: [],
            callback: async () => instance.sendCommand({ type: 'scheduler_start' }),
        },
        scheduler_stop: {
            name: 'Scheduler: Stop',
            options: [],
            callback: async () => instance.sendCommand({ type: 'scheduler_stop' }),
        },
        output_blank: {
            name: 'Output: Blank',
            options: [
                {
                    type: 'dropdown',
                    id: 'outputId',
                    label: 'Output',
                    default: '',
                    choices: outputChoices,
                },
            ],
            callback: async (action) => instance.sendCommand({ type: 'output_blank', outputId: action.options['outputId'] }),
        },
        output_unblank: {
            name: 'Output: Unblank',
            options: [
                {
                    type: 'dropdown',
                    id: 'outputId',
                    label: 'Output',
                    default: '',
                    choices: outputChoices,
                },
            ],
            callback: async (action) => instance.sendCommand({ type: 'output_unblank', outputId: action.options['outputId'] }),
        },
        get_state: {
            name: 'Refresh State',
            options: [],
            callback: async () => instance.sendCommand({ type: 'get_state' }),
        },
    };
}
