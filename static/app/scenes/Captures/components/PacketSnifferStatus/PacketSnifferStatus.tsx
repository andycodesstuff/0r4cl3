import * as React from 'react'
import { Typography } from 'antd'
const { Text } = Typography
import './PacketSnifferStatus.css'

import { requestPacketSnifferStatus } from '../../../../net/api'

const STATUS_UPDATE_INTERVAL_MS = 10000

export class PacketSnifferStatus extends React.Component<{}, IState> {
  private m_TimeoutID?: NodeJS.Timeout

  state = {
    online: false
  }

  render(): JSX.Element {
    const { online } = this.state

    return (
      <div className='PacketSnifferStatus-container'>
        <Text type='secondary'>
          Status:
        </Text>

        <div className='PacketSnifferStatus-indicator_container'>
          {online ? (
            <Text type='success'>online</Text>
          ) : (
            <Text type='danger'>offline</Text>
          )}
        </div>
      </div>
    )
  }

  /**
   * Data fetching-related methods
   */
  async componentDidMount() {
    await this.fetchStatus()
    this.m_TimeoutID = setInterval(async () => await this.fetchStatus(), STATUS_UPDATE_INTERVAL_MS) as NodeJS.Timeout
  }

  componentWillUnmount() {
    // Stop fetching packets
    if (this.m_TimeoutID) clearInterval(this.m_TimeoutID)
  }

  private fetchStatus = async (): Promise<void> => {
    try {
      const { online } = await requestPacketSnifferStatus()
      this.setState((_, __) => ({ online }))
    } catch {
      this.setState((_, __) => ({ online: false }))
    }
  }
}

interface IState {
  online: boolean
}
