import { Logger } from 'tslog'
import { AssetPairService } from './common/assetPair.service'
import { DatabaseService } from './common/db/database.service'
import { WalletMutexService } from './common/mutex/walletMutex.service'
import { OrderService } from './orders/order.service'
import { SettlementService } from './settlement/settlement.service'
import { DarkSwapConfig, OrderDto } from './types'
import { WebSocket } from 'ws'

enum EventType {
  OrderMatchedAsBob = 1,
  OrderConfirmed = 2,
  OrderSettled = 3,
  AssetPairCreated = 4,
  orderCancelled = 5,
  Unknown = 0,
  OrderMatchedAsAlice = 6,
  OrderTriggered = 7
}

enum ProcessingState {
  Idle = 'idle',
  Processing = 'processing'
}

interface QueuedMessage {
  data: string
}

const HEARTBEAT_INTERVAL = 30000
const HEARTBEAT_TIMEOUT = HEARTBEAT_INTERVAL * 3

export class WebSocketClient {
  private settlementService: SettlementService
  private assetPairService: AssetPairService
  private orderService: OrderService
  private dbService: DatabaseService
  private walletMutexService: WalletMutexService
  private messageQueue: QueuedMessage[] = []
  private processingState: ProcessingState = ProcessingState.Idle
  private config: DarkSwapConfig

  private logger = new Logger({ name: WebSocketClient.name })

  constructor(
    config: DarkSwapConfig,
    settlementService: SettlementService,
    assetPairService: AssetPairService,
    orderService: OrderService,
    dbService: DatabaseService,
    walletMutexService: WalletMutexService
  ) {
    this.config = config
    this.settlementService = settlementService
    this.assetPairService = assetPairService
    this.orderService = orderService
    this.dbService = dbService
    this.walletMutexService = walletMutexService
  }

  private async processMessage(message: QueuedMessage): Promise<void> {
    try {
      const notificationEvent = JSON.parse(message.data)
      let orderInfo: OrderDto

      switch (notificationEvent.eventType) {
        case EventType.OrderMatchedAsBob:
          orderInfo = await this.dbService.getOrderByOrderId(
            notificationEvent.orderId
          )
          this.logger.info(
            'Event for order matched as Bob: ',
            notificationEvent.orderId
          )
          await this.walletMutexService
            .getMutex(orderInfo.chainId, orderInfo.wallet.toLowerCase())
            .runExclusive(async () => {
              await this.settlementService.bobConfirm(orderInfo)
            })
          break
        case EventType.OrderMatchedAsAlice:
          orderInfo = await this.dbService.getOrderByOrderId(
            notificationEvent.orderId
          )
          await this.walletMutexService
            .getMutex(orderInfo.chainId, orderInfo.wallet.toLowerCase())
            .runExclusive(async () => {
              this.logger.info(
                'Event for order matched as Alice: ',
                notificationEvent.orderId
              )
              await this.settlementService.matchedForAlice(orderInfo)
            })
          break
        case EventType.OrderConfirmed:
          orderInfo = await this.dbService.getOrderByOrderId(
            notificationEvent.orderId
          )
          await this.walletMutexService
            .getMutex(orderInfo.chainId, orderInfo.wallet.toLowerCase())
            .runExclusive(async () => {
              this.logger.info(
                'Event for order confirmed: ',
                notificationEvent.orderId
              )
              await this.settlementService.aliceSwap(orderInfo)
            })
          break
        case EventType.OrderSettled:
          orderInfo = await this.dbService.getOrderByOrderId(
            notificationEvent.orderId
          )
          await this.walletMutexService
            .getMutex(orderInfo.chainId, orderInfo.wallet.toLowerCase())
            .runExclusive(async () => {
              this.logger.info(
                'Event for order settled: ',
                notificationEvent.orderId
              )
              await this.settlementService.bobPostSettlement(
                orderInfo,
                notificationEvent.txHash || ''
              )
            })
          break
        case EventType.AssetPairCreated:
          await this.assetPairService.syncAssetPair(
            notificationEvent.assetPairId,
            notificationEvent.chainId
          )
          break
        case EventType.orderCancelled:
          orderInfo = await this.dbService.getOrderByOrderId(
            notificationEvent.orderId
          )
          await this.walletMutexService
            .getMutex(orderInfo.chainId, orderInfo.wallet.toLowerCase())
            .runExclusive(async () => {
              this.logger.info(
                'Event for order cancelled: ',
                notificationEvent.orderId
              )
              await this.orderService.cancelOrderByNotificaion(orderInfo)
            })
          break
        case EventType.OrderTriggered:
          orderInfo = await this.dbService.getOrderByOrderId(
            notificationEvent.orderId
          )
          await this.walletMutexService
            .getMutex(orderInfo.chainId, orderInfo.wallet.toLowerCase())
            .runExclusive(async () => {
              this.logger.info(
                'Event for order triggered: ',
                notificationEvent.orderId
              )
              await this.orderService.triggerOrder(orderInfo)
            })
          break
        default:
          this.logger.error('Unknown event:', notificationEvent)
          break
      }
    } catch (error: any) {
      this.logger.error('Invalid message:', message.data)
      if (error instanceof Error) {
        this.logger.error(
          'Caught error:',
          error.stack || error.message || error
        )
      } else {
        this.logger.error(
          'Caught non-standard error:',
          JSON.stringify(error, null, 2)
        )
      }
    }
  }

  private async processMessageQueue(): Promise<void> {
    if (
      this.processingState === ProcessingState.Processing ||
      this.messageQueue.length === 0
    ) {
      return
    }

    this.processingState = ProcessingState.Processing

    try {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift()
        if (message) {
          await this.processMessage(message)
        }
      }
    } catch (error) {
      this.logger.error('Error processing message:', error)
    } finally {
      this.processingState = ProcessingState.Idle
    }
  }

  private enqueueMessage(data: string): void {
    this.messageQueue.push({ data })
    if (this.processingState === ProcessingState.Idle) {
      setImmediate(() => this.processMessageQueue())
    }
  }

  public startWebSocket() {
    const booknodeUrl = this.config.bookNodeSocketUrl

    if (!booknodeUrl) {
      throw new Error('BOOKNODE_URL is not set')
    }

    let ws: WebSocket
    let isReconnecting = false
    let reconnectTimeout: NodeJS.Timeout

    let heartbeatInterval: NodeJS.Timeout
    let lastHeartbeatTime: number = Date.now()

    let isAuthenticated = true

    const updateLastHeartbeat = () => {
      lastHeartbeatTime = Date.now()
      this.logger.trace(
        'Heartbeat updated to:',
        new Date(lastHeartbeatTime).toUTCString()
      )
    }

    const startHeartbeatCheck = () => {
      heartbeatInterval = setInterval(() => {
        const currentTime = Date.now()
        if (currentTime - lastHeartbeatTime >= HEARTBEAT_TIMEOUT) {
          this.logger.trace('Heartbeat timeout, reconnecting...')
          cleanup()
          reconnect()
        }
      }, HEARTBEAT_INTERVAL)
    }

    const cleanup = () => {
      if (ws) {
        ws.removeAllListeners()
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      }
      clearInterval(heartbeatInterval)
    }

    const connect = () => {
      cleanup()

      ws = new WebSocket(booknodeUrl)

      ws.on('open', () => {
        this.logger.trace('Connected to BookNode server')
        isReconnecting = false
        const authMessage = JSON.stringify({
          type: 'auth',
          token: this.config.bookNodeApiKey
        })

        ws.send(authMessage)
        updateLastHeartbeat()
        startHeartbeatCheck()
      })

      ws.on('ping', () => {
        updateLastHeartbeat()
      })

      ws.on('error', (error) => {
        this.logger.error('WebSocket error:', error)
        clearInterval(heartbeatInterval)
        isReconnecting = false
        reconnect()
      })

      ws.on('close', (data) => {
        this.logger.trace('Disconnected from BookNode server')
        if (data === 4001) {
          this.logger.error('Authentication failed: Invalid API key')
          clearInterval(heartbeatInterval)
          isAuthenticated = false
          return
        }
        clearInterval(heartbeatInterval)
        reconnect()
      })

      ws.on('message', (data) => {
        this.logger.trace('Received message:', data.toString())
        updateLastHeartbeat()
        this.enqueueMessage(data.toString())
      })
    }

    const reconnect = () => {
      if (isReconnecting) {
        clearTimeout(reconnectTimeout)
      }
      isReconnecting = true
      this.logger.trace('Attempting to reconnect...')
      reconnectTimeout = setTimeout(() => {
        connect()
      }, 10000)
    }

    connect()

    // Return connection status object
    return {
      cleanup: () => {
        clearTimeout(reconnectTimeout)
        cleanup()
      },
      isAuthenticated: () => {
        // Sleep 2s wait for websocket to authenticate
        const sleep = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms))
        return sleep(2000).then(() => isAuthenticated)
      },
      isConnected: () => ws && ws.readyState === WebSocket.OPEN
    }
  }
}
