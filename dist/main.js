import { InstanceBase, InstanceStatus } from '@companion-module/base';
import { ShowCastConnection } from './connection.js';
import { getActions } from './actions.js';
import { getFeedbacks } from './feedbacks.js';
import { getVariableDefinitions, buildVariableValues } from './variables.js';
class ShowCastInstance extends InstanceBase {
    state = null;
    connection = null;
    pollTimer = null;
    async init(config, _isFirstInit, _secrets) {
        this.setVariableDefinitions(getVariableDefinitions());
        await this.configUpdated(config, _secrets);
    }
    async destroy() {
        this._stopPolling();
        this.connection?.destroy();
        this.connection = null;
    }
    _startPolling() {
        this._stopPolling();
        this.pollTimer = setInterval(() => {
            this.connection?.sendCommand({ type: 'get_state' });
        }, 500);
    }
    _stopPolling() {
        if (this.pollTimer !== null) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }
    async configUpdated(config, _secrets) {
        const cfg = config;
        this.connection?.destroy();
        this.connection = new ShowCastConnection(cfg.host ?? '127.0.0.1', cfg.port ?? 5100, cfg.password ?? '');
        this.connection.debugLog = (msg) => this.log('info', msg);
        this.connection.on('connected', () => {
            this.updateStatus(InstanceStatus.Connecting, 'Authenticating...');
        });
        this.connection.on('authOk', () => {
            this._startPolling();
        });
        this.connection.on('authFailed', () => {
            this.updateStatus(InstanceStatus.AuthenticationFailure, 'Authentication failed');
        });
        this.connection.on('disconnected', () => {
            this._stopPolling();
            this.updateStatus(InstanceStatus.Connecting, 'Reconnecting...');
        });
        this.connection.on('commandError', (cmd, message) => {
            this.log('warn', `Command "${cmd}" failed: ${message}`);
        });
        this.connection.on('commandOk', (cmd) => {
            this.log('info', `Command "${cmd}" OK`);
        });
        this.connection.on('stateUpdate', (state) => {
            this.state = state;
            this.setVariableValues(buildVariableValues(state));
            this.setActionDefinitions(getActions(this));
            this.setFeedbackDefinitions(getFeedbacks(this));
            this.checkAllFeedbacks();
            this.updateStatus(InstanceStatus.Ok);
        });
        this.setActionDefinitions(getActions(this));
        this.setFeedbackDefinitions(getFeedbacks(this));
        this.connection.connect();
    }
    getConfigFields() {
        return [
            {
                type: 'textinput',
                id: 'host',
                label: 'Host',
                default: '127.0.0.1',
                width: 6,
            },
            {
                type: 'number',
                id: 'port',
                label: 'Port',
                default: 5100,
                min: 1,
                max: 65535,
                width: 3,
            },
            {
                type: 'textinput',
                id: 'password',
                label: 'Password (leave blank if none)',
                default: '',
                width: 6,
            },
        ];
    }
    sendCommand(cmd) {
        const sent = this.connection?.sendCommand(cmd);
        if (!sent)
            this.log('warn', `sendCommand: socket not connected (${cmd.type})`);
    }
}
export default ShowCastInstance;
