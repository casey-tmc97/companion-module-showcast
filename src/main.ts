import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { ShowCastConnection } from './connection'
import { getActions } from './actions'
import { getFeedbacks } from './feedbacks'
import { getVariableDefinitions, buildVariableValues } from './variables'
import type { ShowCastConfig, ShowCastState } from './types'

class ShowCastInstance extends InstanceBase<ShowCastConfig> {
  state: ShowCastState | null = null
  private connection: ShowCastConnection | null = null

  async init(config: ShowCastConfig, _isFirstInit: boolean): Promise<void> {
    this.setVariableDefinitions(getVariableDefinitions())
    await this.configUpdated(config)
  }

  async destroy(): Promise<void> {
    this.connection?.destroy()
    this.connection = null
  }

  async configUpdated(config: ShowCastConfig): Promise<void> {
    this.connection?.destroy()

    this.connection = new ShowCastConnection(
      config.host ?? '127.0.0.1',
      config.port ?? 5100,
      config.password ?? '',
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

    this.connection.on('stateUpdate', (state: ShowCastState) => {
      this.state = state
      this.setVariableValues(buildVariableValues(state))
      this.setActionDefinitions(getActions(this))
      this.setFeedbackDefinitions(getFeedbacks(this))
      this.checkFeedbacks()
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
    this.connection?.sendCommand(cmd)
  }
}

runEntrypoint(ShowCastInstance, [])
