import { EventEmitter } from 'events';
import * as net from 'net';
export class ShowCastConnection extends EventEmitter {
    host;
    port;
    password;
    socket = null;
    lineBuffer = '';
    reconnectTimer = null;
    reconnectDelay = 1000;
    MAX_RECONNECT_DELAY = 5000;
    _destroyed = false;
    debugLog = null;
    constructor(host, port, password) {
        super();
        this.host = host;
        this.port = port;
        this.password = password;
    }
    connect() {
        if (this._destroyed)
            return;
        this._clearReconnectTimer();
        this.lineBuffer = '';
        const socket = new net.Socket();
        this.socket = socket;
        socket.on('connect', () => {
            this.reconnectDelay = 1000;
            this.emit('connected');
            this.sendCommand({ type: 'auth', password: this.password });
        });
        socket.on('data', (data) => {
            this.lineBuffer += data.toString('utf8');
            const lines = this.lineBuffer.split('\n');
            this.lineBuffer = lines.pop();
            for (const line of lines) {
                if (line.trim())
                    this._processLine(line);
            }
        });
        socket.on('close', () => {
            this.socket = null;
            if (!this._destroyed) {
                this.emit('disconnected');
                this._scheduleReconnect();
            }
        });
        socket.on('error', () => {
            // 'close' fires after 'error'; reconnect is handled there
        });
        socket.connect(this.port, this.host);
    }
    destroy() {
        this._destroyed = true;
        this._clearReconnectTimer();
        this.socket?.destroy();
        this.socket = null;
    }
    sendCommand(cmd) {
        if (this.socket && !this.socket.destroyed) {
            this.socket.write(JSON.stringify(cmd) + '\n');
            return true;
        }
        return false;
    }
    _processLine(line) {
        // Strip UTF-8 BOM if present (server prepends it to the stream)
        const stripped = line.charCodeAt(0) === 0xFEFF ? line.slice(1) : line;
        let msg;
        try {
            msg = JSON.parse(stripped);
        }
        catch {
            this.debugLog?.(`[SC] unparseable line: ${line.slice(0, 200)}`);
            return;
        }
        if (msg.type === 'state') {
            const s = msg;
            const audio = s['audio'];
            const page = s['page'];
            this.debugLog?.(`[SC] state: page=${JSON.stringify(page?.['name'] ?? null)} audio.playing=${audio?.['playing']} audio.pos=${audio?.['positionMs']} audio.track=${JSON.stringify(audio?.['trackName'] ?? null)}`);
        }
        else {
            this.debugLog?.(`[SC] recv type=${msg.type} keys=${Object.keys(msg).join(',')}`);
        }
        if (msg.type === 'auth_ok') {
            this.emit('authOk');
            this.sendCommand({ type: 'get_state' });
        }
        else if (msg.type === 'auth_fail') {
            this.emit('authFailed');
            this.destroy();
        }
        else if (msg.type === 'state') {
            this.emit('stateUpdate', msg);
        }
        else if (msg.type === 'ack') {
            const ack = msg;
            if (ack.status === 'error') {
                this.emit('commandError', ack.cmd, ack.message ?? 'Unknown error');
            }
            else {
                this.emit('commandOk', ack.cmd);
            }
        }
        else {
            this.debugLog?.(`[SC] unhandled type: ${JSON.stringify(msg).slice(0, 300)}`);
        }
    }
    _scheduleReconnect() {
        this.reconnectTimer = setTimeout(() => {
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.MAX_RECONNECT_DELAY);
            this.connect();
        }, this.reconnectDelay);
    }
    _clearReconnectTimer() {
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
}
