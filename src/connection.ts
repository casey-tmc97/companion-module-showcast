import { EventEmitter } from 'events'
import * as net from 'net'
import type { ShowCastState } from './types'

export class ShowCastConnection extends EventEmitter {
  private socket: net.Socket | null = null
  private lineBuffer = ''
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectDelay = 1000
  private readonly MAX_RECONNECT_DELAY = 30000
  private _destroyed = false

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly password: string,
  ) {
    super()
  }

  connect(): void {
    if (this._destroyed) return
    this._clearReconnectTimer()
    this.lineBuffer = ''

    const socket = new net.Socket()
    this.socket = socket

    socket.on('connect', () => {
      this.reconnectDelay = 1000
      this.emit('connected')
      this.sendCommand({ type: 'auth', password: this.password })
    })

    socket.on('data', (data: Buffer) => {
      this.lineBuffer += data.toString('utf8')
      const lines = this.lineBuffer.split('\n')
      this.lineBuffer = lines.pop()!
      for (const line of lines) {
        if (line.trim()) this._processLine(line)
      }
    })

    socket.on('close', () => {
      this.socket = null
      if (!this._destroyed) {
        this.emit('disconnected')
        this._scheduleReconnect()
      }
    })

    socket.on('error', () => {
      // 'close' fires after 'error'; reconnect is handled there
    })

    socket.connect(this.port, this.host)
  }

  destroy(): void {
    this._destroyed = true
    this._clearReconnectTimer()
    this.socket?.destroy()
    this.socket = null
  }

  sendCommand(cmd: object): void {
    if (this.socket && !this.socket.destroyed) {
      this.socket.write(JSON.stringify(cmd) + '\n')
    }
  }

  private _processLine(line: string): void {
    let msg: { type: string }
    try {
      msg = JSON.parse(line)
    } catch {
      return
    }

    if (msg.type === 'auth_ok') {
      this.sendCommand({ type: 'get_state' })
    } else if (msg.type === 'auth_fail') {
      this.emit('authFailed')
      this.destroy()
    } else if (msg.type === 'state') {
      this.emit('stateUpdate', msg as unknown as ShowCastState)
    }
  }

  private _scheduleReconnect(): void {
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.MAX_RECONNECT_DELAY)
      this.connect()
    }, this.reconnectDelay)
  }

  private _clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}
