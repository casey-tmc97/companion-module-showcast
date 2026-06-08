import * as net from 'net'
import { ShowCastConnection } from '../connection'
import type { ShowCastState } from '../types'

const EMPTY_STATE: ShowCastState = {
  page: null,
  rundown: { pos: 0, total: 0, currentName: '' },
  audio: { playing: false, trackName: '', playlists: [] },
  scheduler: { running: false },
  outputs: [],
}

function startMockServer(): Promise<{
  server: net.Server
  port: number
  received: string[]
  send: (line: string) => void
  sendRaw: (data: string) => void
  close: () => Promise<void>
}> {
  return new Promise((resolve) => {
    const received: string[] = []
    let clientSocket: net.Socket | null = null
    let buf = ''

    const server = net.createServer((socket) => {
      clientSocket = socket
      socket.on('data', (d) => {
        buf += d.toString('utf8')
        const parts = buf.split('\n')
        buf = parts.pop()!
        for (const l of parts) if (l.trim()) received.push(l)
      })
    })
    const _origClose = server.close.bind(server)
    server.close = (cb?: (err?: Error) => void) => {
      clientSocket?.destroy()
      return _origClose(cb)
    }

    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as net.AddressInfo).port
      resolve({
        server,
        port,
        received,
        send: (line) => clientSocket?.write(line + '\n'),
        sendRaw: (data) => clientSocket?.write(data),
        close: () =>
          new Promise((res) => {
            clientSocket?.destroy()
            server.close(() => res())
          }),
      })
    })
  })
}

describe('ShowCastConnection', () => {
  test('sends auth with password on connect', (done) => {
    startMockServer().then(({ port, received, send, close }) => {
      const conn = new ShowCastConnection('127.0.0.1', port, 'secret')
      conn.on('connected', () => {
        setTimeout(() => {
          const auth = JSON.parse(received[0])
          expect(auth.type).toBe('auth')
          expect(auth.password).toBe('secret')
          conn.destroy()
          close().then(done)
        }, 50)
      })
      conn.connect()
    })
  })

  test('sends get_state after auth_ok', (done) => {
    startMockServer().then(({ port, received, send, close }) => {
      const conn = new ShowCastConnection('127.0.0.1', port, '')
      conn.on('connected', () => {
        setTimeout(() => send('{"type":"auth_ok"}'), 20)
      })
      setTimeout(() => {
        const getState = received.find((l) => JSON.parse(l).type === 'get_state')
        expect(getState).toBeDefined()
        conn.destroy()
        close().then(done)
      }, 200)
      conn.connect()
    })
  })

  test('emits stateUpdate when state message received', (done) => {
    startMockServer().then(({ port, send, close }) => {
      const conn = new ShowCastConnection('127.0.0.1', port, '')
      conn.on('connected', () => setTimeout(() => send('{"type":"auth_ok"}'), 10))
      conn.on('stateUpdate', (state: ShowCastState) => {
        expect(state.page).toBeNull()
        expect(state.outputs).toEqual([])
        conn.destroy()
        close().then(done)
      })
      // Delay state send until after auth_ok has been processed
      setTimeout(() => send(JSON.stringify({ type: 'state', ...EMPTY_STATE })), 80)
      conn.connect()
    })
  })

  test('emits authFailed on auth_fail and does not reconnect', (done) => {
    startMockServer().then(({ port, send, close }) => {
      let reconnected = false
      const conn = new ShowCastConnection('127.0.0.1', port, 'wrong')
      conn.on('connected', () => {
        reconnected ? null : setTimeout(() => send('{"type":"auth_fail"}'), 10)
        reconnected = true
      })
      conn.on('authFailed', () => {
        setTimeout(() => {
          conn.destroy()
          close().then(done)
        }, 300)
      })
      conn.connect()
    })
  })

  test('emits disconnected when server closes', (done) => {
    startMockServer().then(({ port, server, send, close }) => {
      const conn = new ShowCastConnection('127.0.0.1', port, '')
      conn.on('connected', () => {
        setTimeout(() => server.close(), 30)
      })
      conn.on('disconnected', () => {
        conn.destroy()
        done()
      })
      conn.connect()
    })
  })

  test('handles partial lines across TCP packets', (done) => {
    startMockServer().then(({ port, send, sendRaw, close }) => {
      const conn = new ShowCastConnection('127.0.0.1', port, '')
      conn.on('stateUpdate', (state: ShowCastState) => {
        expect(state.page).toBeNull()
        conn.destroy()
        close().then(done)
      })
      conn.on('connected', () => {
        const stateJson = JSON.stringify({ type: 'state', ...EMPTY_STATE })
        setTimeout(() => {
          send('{"type":"auth_ok"}')
          setTimeout(() => {
            sendRaw(stateJson.slice(0, 20))
            setTimeout(() => send(stateJson.slice(20)), 10)
          }, 20)
        }, 10)
      })
      conn.connect()
    })
  })
})
