export interface ShowCastPage {
  id: string
  name: string
}

export interface ShowCastPlaylist {
  id: string
  name: string
}

export interface ShowCastOutput {
  id: string
  name: string
  blanked: boolean
  livePage: ShowCastPage | null
}

export interface ShowCastAudio {
  playing: boolean
  trackName: string
  positionMs: number
  durationMs: number
  playlists: ShowCastPlaylist[]
}

export interface ShowCastVideo {
  playing: boolean
  trackName: string
  positionMs: number
  durationMs: number
}

export interface ShowCastRundown {
  pos: number
  total: number
  currentName: string
}

export interface ShowCastPageTimer {
  active: boolean
  remainingMs: number
  durationMs: number
}

export interface ShowCastState {
  page: ShowCastPage | null
  rundown: ShowCastRundown
  audio: ShowCastAudio
  video: ShowCastVideo
  outputs: ShowCastOutput[]
  selectedOutputName: string
  pageTimer: ShowCastPageTimer
}

export interface ShowCastConfig {
  host: string
  port: number
  password: string
}
