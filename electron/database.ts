import Database from 'better-sqlite3'
import * as path from 'path'
import * as fs from 'fs'
import { DarkSwapClientCore, DarkSwapConfig } from 'darkswap-client-core'
import yaml from 'js-yaml'
import { app } from 'electron'
import { ConfigLoader } from './utils/configUtil'

const dbPath = path.join(process.cwd(), 'app.db')

// Nếu chưa có file DB thì tạo
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '')
}

const db = new Database(dbPath)

const config = ConfigLoader.getInstance().getConfig()

if (!config) {
  throw new Error('Failed to load configuration')
}

const darkSwapConfig: DarkSwapConfig = {
  wallets: config.wallets,
  chainRpcs: config.chainRpcs || [],
  dbFilePath: dbPath,
  bookNodeSocketUrl: config.bookNodeSocketUrl || 'wss://socket.darknode.io',
  bookNodeApiUrl: config.bookNodeApiUrl || 'https://api.darknode.io/api',
  bookNodeApiKey:
    config.bookNodeApiKey || '8f3f1f4e-6b3c-4f0a-9d3a-2e5b5e5e5e5e'
}
const instance = new DarkSwapClientCore(darkSwapConfig, db)

export default instance
