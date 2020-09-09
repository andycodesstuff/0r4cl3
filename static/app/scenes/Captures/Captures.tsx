import * as React from 'react'
import ReactResizeDetector from 'react-resize-detector'
import { PageHeader, Layout, Input, Row, Col } from 'antd'
import { CloseCircleTwoTone } from '@ant-design/icons'
const { Content } = Layout
const { Search } = Input
import './Captures.css'

import { PacketList } from '../../components/PacketList'
import { PacketDetails } from '../../components/PacketDetails'

import {
  IPacketNoPayload,
  IPacketWithPayload,
  requestPackets,
  requestPacketDetails,
  queryPacketsContent
} from '../../net/api'

// const PACKETS_UPDATE_INTERVAL_MS = 30000
const RESIZE_DETECTOR_REFRESH_RATE_MS = 1250

export class Captures extends React.Component<{}, IState> {
  private m_TimeoutID?: NodeJS.Timeout

  state = {
    query: '',
    tableHeight: 0,
    lastTimestamp: 0,
    packets: [],
    packetsProtocols: [],
    filteredPackets: [],
    filteredPacketsProtocols: [],
    focusedPacketLoading: false,
    focusedPacketDimensions: { height: 0, width: 0 },
    focusedPacket: null as IPacketWithPayload | null
  }

  render(): JSX.Element {
    const {
      query,
      tableHeight,
      packets,
      packetsProtocols,
      filteredPackets,
      filteredPacketsProtocols,
      focusedPacketLoading,
      focusedPacketDimensions,
      focusedPacket
    } = this.state

    return (
      <ReactResizeDetector
        handleHeight
        handleWidth
        refreshRate={RESIZE_DETECTOR_REFRESH_RATE_MS}
        refreshMode='throttle'
        onResize={this.updateTableHeight}
      >
        {() => (
          <Layout className='Captures-container'>
            <PageHeader title='0r4cl3'>
              <Search
                value={query}
                onChange={this.onSearchChange}
                placeholder='Search'
                onSearch={this.onSearchSubmit}
                enterButton
                suffix={<CloseCircleTwoTone onClick={this.onSearchReset} />}
              />
            </PageHeader>

            <Content className='Captures-content' id='Captures-content'>
              <Row>
                <Col span={9}>
                  <PacketList
                    height={tableHeight}
                    packets={filteredPackets.length > 0 ? filteredPackets : packets}
                    protocols={filteredPackets.length > 0 ? filteredPacketsProtocols : packetsProtocols}
                    onRowPress={this.fetchPacketDetails}
                  />
                </Col>
                <Col span={15} style={{ paddingLeft: 40 }}>
                  <PacketDetails
                    dimensions={focusedPacketDimensions}
                    loading={focusedPacketLoading}
                    packet={focusedPacket}
                  />
                </Col>
              </Row>
            </Content>
          </Layout>
        )}
      </ReactResizeDetector>
    )
  }

  async componentDidMount() {
    await this.fetchPackets()
    // this.m_TimeoutID = setInterval(async () => await this.fetchPackets(), PACKETS_UPDATE_INTERVAL_MS)
  }

  componentWillUnmount() {
    // Stop fetching packets
    if (this.m_TimeoutID) clearInterval(this.m_TimeoutID)
  }

  private updateTableHeight = (): void => {
    // TODO: use react refs
    const content = document.getElementById('Captures-content')

    if (content) {
      const newTableHeight = content.clientHeight
        - 48 // Top and bottom 'Captures-content' margins
        - 24 // Pagination height
        - 32 // Top and bottom pagination margins

      const newFocusedPacketHeight = content.clientHeight
        - 98 // Card header

      this.setState((_, __) => ({
        tableHeight: newTableHeight,
        focusedPacketDimensions: {
          height: newFocusedPacketHeight,
          width: content.clientWidth
        }
      }))
    }
  }

  private fetchPackets = async (): Promise<void> => {
    const { lastTimestamp } = this.state
    const {
      packets,
      unique_protocols: uniqueProtocols
    } = await requestPackets(lastTimestamp)

    // Find the timestamp of the latest packet
    const newTimestamp = packets.length > 0
      ? Math.max(...packets.map(packet => packet.start_time))
      : lastTimestamp

    this.setState((prevState, _) => ({
      lastTimestamp: newTimestamp,
      packets: [...prevState.packets, ...packets],
      packetsProtocols: uniqueProtocols
    }))
  }

  private fetchPacketDetails = (packet: IPacketNoPayload): void => {
    // Skip if details for the requested packet have already been rendered
    if (this.state.focusedPacket?.rowid === packet.rowid) return

    this.setState((_, __) => ({ focusedPacketLoading: true, focusedPacket: null }), () => {
      requestPacketDetails(packet.rowid)
        .then(packetDetails => {
          this.setState((_, __) => ({
            focusedPacketLoading: false,
            focusedPacket: packetDetails
          }))
        })
    })
  }

  /**
   * Search bar-related methods
   */
  private onSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const query = event.target.value
    this.setState(() => ({ query }))
  }

  private onSearchSubmit = (): void => {
    const { query } = this.state

    // Skip if query is empty
    if (query.length === 0) return;

    queryPacketsContent(query)
      .then(({ packets, unique_protocols: uniqueProtocols }) => {
        this.setState((_, __) => ({
          filteredPackets: packets,
          filteredPacketsProtocols: uniqueProtocols
        }))
      })
  }

  private onSearchReset = (): void => {
    this.setState((_, __) => ({
      query: '',
      filteredPackets: [],
      filteredPacketsProtocols: []
    }))
  }
}

interface IState {
  query: string
  tableHeight: number
  lastTimestamp: number
  packets: IPacketNoPayload[]
  packetsProtocols: string[]
  filteredPackets: IPacketNoPayload[]
  filteredPacketsProtocols: string[]
  focusedPacketLoading: boolean
  focusedPacketDimensions: { height: number, width: number }
  focusedPacket: IPacketWithPayload | null
}
