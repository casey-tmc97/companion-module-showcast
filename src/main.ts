import { InstanceBase, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import type { JsonObject } from '@companion-module/base'
import { ShowCastConnection } from './connection.js'
import { getActions } from './actions.js'
import { getFeedbacks } from './feedbacks.js'
import { getVariableDefinitions, buildVariableValues } from './variables.js'
import type { ShowCastConfig, ShowCastState } from './types.js'

class ShowCastInstance extends InstanceBase {
  state: ShowCastState | null = null
  private connection: ShowCastConnection | null = null

  async init(config: JsonObject, _isFirstInit: boolean, _secrets: unknown): Promise<void> {
    this.setVariableDefinitions(getVariableDefinitions())
    await this.configUpdated(config, _secrets)
  }

  async destroy(): Promise<void> {
    this.connection?.destroy()
    this.connection = null
  }

  async configUpdated(config: JsonObject, _secrets: unknown): Promise<void> {
    const cfg = config as unknown as ShowCastConfig
    this.connection?.destroy()

    this.connection = new ShowCastConnection(
      cfg.host ?? '127.0.0.1',
      cfg.port ?? 5100,
      cfg.password ?? '',
    )

    this.connection.on('connected', () => {
      this.updateStatus(InstanceStatus.Connecting, 'Authenticating...')
    })

    this.connection.on('authFailed', () => {
      this.updateStatus(InstanceStatus.AuthenticationFailure, 'Authentication failed')
    })

    this.connection.on('disconnected', () => {
      this.updateStatus(InstanceStatus.Connecting, 'Reconnecting...')
    })

    this.connection.on('commandError', (cmd: string, message: string) => {
      this.log('warn', `Command "${cmd}" failed: ${message}`)
    })

    this.connection.on('commandOk', (cmd: string) => {
      this.log('info', `Command "${cmd}" OK`)
    })

    this.connection.on('stateUpdate', (state: ShowCastState) => {
      this.state = state
      this.setVariableValues(buildVariableValues(state))
      this.setActionDefinitions(getActions(this))
      this.setFeedbackDefinitions(getFeedbacks(this))
      this.checkAllFeedbacks()
      this.updateStatus(InstanceStatus.Ok)
    })

    this.setActionDefinitions(getActions(this))
    this.setFeedbackDefinitions(getFeedbacks(this))
    this.connection.connect()
  }

  getConfigFields(): SomeCompanionConfigField[] {
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
    ]
  }

  sendCommand(cmd: object): void {
    const sent = this.connection?.sendCommand(cmd)
    if (!sent) this.log('warn', `sendCommand: socket not connected (${(cmd as any).type})`)
  }
}

export default ShowCastInstance
