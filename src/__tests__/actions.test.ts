import { getActions } from '../actions'
import type { ShowCastState } from '../types'

function makeState(overrides: Partial<ShowCastState> = {}): ShowCastState {
  return {
    page: null,
    rundown: { pos: 0, total: 0, currentName: '' },
    audio: { playing: false, trackName: '', playlists: [{ id: 'pl-1', name: 'Set 1' }] },
    scheduler: { running: false },
    outputs: [{ id: 'out-1', name: 'Main', blanked: false }],
    ...overrides,
  }
}

function makeInstance(state: ShowCastState | null) {
  const sent: object[] = []
  return {
    state,
    sendCommand: (cmd: object) => sent.push(cmd),
    sent,
  } as any
}

async function fireAction(
  instance: ReturnType<typeof makeInstance>,
  actionId: string,
  options: Record<string, unknown> = {},
): Promise<void> {
  const actions = getActions(instance)
  const def = actions[actionId] as any
  await def.callback({ options })
}

describe('getActions', () => {
  test('page_advance sends {type:"page_advance"}', async () => {
    const inst = makeInstance(makeState())
    await fireAction(inst, 'page_advance')
    expect(inst.sent[0]).toEqual({ type: 'page_advance' })
  })

  test('page_back sends {type:"page_back"}', async () => {
    const inst = makeInstance(makeState())
    await fireAction(inst, 'page_back')
    expect(inst.sent[0]).toEqual({ type: 'page_back' })
  })

  test('page_clear sends {type:"page_clear"}', async () => {
    const inst = makeInstance(makeState())
    await fireAction(inst, 'page_clear')
    expect(inst.sent[0]).toEqual({ type: 'page_clear' })
  })

  test('page_live sends {type:"page_live", pageId}', async () => {
    const inst = makeInstance(makeState())
    await fireAction(inst, 'page_live', { pageId: 'abc-123' })
    expect(inst.sent[0]).toEqual({ type: 'page_live', pageId: 'abc-123' })
  })

  test('rundown_next sends {type:"rundown_next"}', async () => {
    const inst = makeInstance(makeState())
    await fireAction(inst, 'rundown_next')
    expect(inst.sent[0]).toEqual({ type: 'rundown_next' })
  })

  test('rundown_goto sends {type:"rundown_goto", index}', async () => {
    const inst = makeInstance(makeState())
    await fireAction(inst, 'rundown_goto', { index: 3 })
    expect(inst.sent[0]).toEqual({ type: 'rundown_goto', index: 3 })
  })

  test('audio_play sends {type:"audio_play", id}', async () => {
    const inst = makeInstance(makeState())
    await fireAction(inst, 'audio_play', { playlistId: 'pl-1' })
    expect(inst.sent[0]).toEqual({ type: 'audio_play', id: 'pl-1' })
  })

  test('audio_stop sends {type:"audio_stop"}', async () => {
    const inst = makeInstance(makeState())
    await fireAction(inst, 'audio_stop')
    expect(inst.sent[0]).toEqual({ type: 'audio_stop' })
  })

  test('scheduler_start sends {type:"scheduler_start"}', async () => {
    const inst = makeInstance(makeState())
    await fireAction(inst, 'scheduler_start')
    expect(inst.sent[0]).toEqual({ type: 'scheduler_start' })
  })

  test('scheduler_stop sends {type:"scheduler_stop"}', async () => {
    const inst = makeInstance(makeState())
    await fireAction(inst, 'scheduler_stop')
    expect(inst.sent[0]).toEqual({ type: 'scheduler_stop' })
  })

  test('output_blank sends {type:"output_blank", outputId}', async () => {
    const inst = makeInstance(makeState())
    await fireAction(inst, 'output_blank', { outputId: 'out-1' })
    expect(inst.sent[0]).toEqual({ type: 'output_blank', outputId: 'out-1' })
  })

  test('output_unblank sends {type:"output_unblank", outputId}', async () => {
    const inst = makeInstance(makeState())
    await fireAction(inst, 'output_unblank', { outputId: 'out-1' })
    expect(inst.sent[0]).toEqual({ type: 'output_unblank', outputId: 'out-1' })
  })

  test('get_state sends {type:"get_state"}', async () => {
    const inst = makeInstance(makeState())
    await fireAction(inst, 'get_state')
    expect(inst.sent[0]).toEqual({ type: 'get_state' })
  })

  test('output_blank dropdown choices come from state.outputs', () => {
    const state = makeState({ outputs: [{ id: 'out-2', name: 'Stage', blanked: false }] })
    const inst = makeInstance(state)
    const actions = getActions(inst)
    const opts = (actions['output_blank'] as any).options
    const dropdown = opts.find((o: any) => o.id === 'outputId')
    expect(dropdown.choices).toEqual([{ id: 'out-2', label: 'Stage' }])
  })

  test('audio_play dropdown choices come from state.audio.playlists', () => {
    const inst = makeInstance(makeState())
    const actions = getActions(inst)
    const opts = (actions['audio_play'] as any).options
    const dropdown = opts.find((o: any) => o.id === 'playlistId')
    expect(dropdown.choices).toEqual([{ id: 'pl-1', label: 'Set 1' }])
  })
})
