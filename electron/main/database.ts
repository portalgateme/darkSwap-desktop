import Database from 'better-sqlite3'
import * as path from 'path'
import * as fs from 'fs'
import { DarkSwapClientCore, DarkSwapConfig } from 'darkswap-client-core'
import { ConfigLoader } from '../utils/configUtil'
import { app } from 'electron'

const userDataPath = app.getPath('userData')
if (!fs.existsSync(userDataPath))
  fs.mkdirSync(userDataPath, { recursive: true })

export const dbPath = path.join(userDataPath, 'app.db')
console.log('SQLite path:', dbPath)
export const db = new Database(dbPath, { verbose: console.log })

// INITIALIZE DATABASE SCHEMA
// Initialize wallets table if it doesn't exist
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    address TEXT,
    privateKey TEXT,
    type TEXT
  )
`
).run()
// Initialize configs table if it doesn't exist
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT,
    value TEXT,
    UNIQUE(key)
  )
`
).run()

const wallets = db.prepare('SELECT * FROM wallets').all() as Array<{
  id: number
  name: string
  address: string
  privateKey: string
  type: 'privateKey' | 'fireblocks'
}>

const configs = db.prepare('SELECT * FROM configs').all() as Array<{
  id: number
  key: string
  value: string
}>

console.log('Loaded wallets from DB:', wallets)
console.log('Loaded configs from DB:', configs)

export const config = ConfigLoader.getInstance().getConfig()

if (!config) {
  throw new Error('Failed to load configuration')
}

const darkSwapConfig: DarkSwapConfig = {
  wallets: [...config.wallets, ...wallets],
  chainRpcs: config.chainRpcs || [],
  dbFilePath: dbPath,
  bookNodeSocketUrl: config.bookNodeSocketUrl || 'wss://socket.darknode.io',
  bookNodeApiUrl: config.bookNodeApiUrl || 'https://api.darknode.io/api',
  bookNodeApiKey: configs.find((c) => c.key === 'api_key')?.value || ''
  // config.bookNodeApiKey || '8f3f1f4e-6b3c-4f0a-9d3a-2e5b5e5e5e5e'
}
const instance = new DarkSwapClientCore(darkSwapConfig, db)

export default instance
