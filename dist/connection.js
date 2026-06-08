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
        }
    }
    _processLine(line) {
        let msg;
        try {
            msg = JSON.parse(line);
        }
        catch {
            return;
        }
        if (msg.type === 'auth_fail') {
            this.emit('authFailed');
            this.destroy();
        }
        else if (msg.type === 'state') {
            this.emit('stateUpdate', msg);
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
