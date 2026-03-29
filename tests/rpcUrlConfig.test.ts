import Database from 'better-sqlite3'

/**
 * Reimplement the merge logic from coreReloader.ts for testing purposes.
 * The original function is not exported, so we replicate the same DB query
 * pattern and merge algorithm here.
 */
function mergeChainRpcsWithDbOverrides(
  db: InstanceType<typeof Database>,
  yamlChainRpcs: Array<{ chainId: number; rpcUrl: string }>
): Array<{ chainId: number; rpcUrl: string }> {
  const dbRpcConfigs = db
    .prepare("SELECT key, value FROM configs WHERE key LIKE 'rpc_url_%'")
    .all() as Array<{ key: string; value: string }>

  if (dbRpcConfigs.length === 0) {
    return yamlChainRpcs
  }

  const overrideMap = new Map<number, string>()
  for (const row of dbRpcConfigs) {
    const chainIdStr = row.key.replace('rpc_url_', '')
    const chainId = Number(chainIdStr)
    if (!Number.isNaN(chainId) && row.value) {
      overrideMap.set(chainId, row.value)
    }
  }

  return yamlChainRpcs.map((entry) => {
    const override = overrideMap.get(entry.chainId)
    return override ? { ...entry, rpcUrl: override } : entry
  })
}

/**
 * Reimplement the getRpcUrl IPC handler logic for testing purposes.
 */
function getRpcUrl(
  db: InstanceType<typeof Database>,
  yamlChainRpcs: Array<{ chainId: number; rpcUrl: string }>,
  chainId: number
): { rpcUrl: string; isCustom: boolean } {
  const dbRow = db
    .prepare('SELECT value FROM configs WHERE key = ?')
    .get(`rpc_url_${chainId}`) as { value: string } | undefined

  if (dbRow) {
    return { rpcUrl: dbRow.value, isCustom: true }
  }

  const yamlEntry = yamlChainRpcs.find(
    (r: { chainId: number; rpcUrl: string }) => r.chainId === chainId
  )
  if (yamlEntry) {
    return { rpcUrl: yamlEntry.rpcUrl, isCustom: false }
  }

  return { rpcUrl: '', isCustom: false }
}

/**
 * Reimplement the setRpcUrl IPC handler logic for testing purposes.
 */
function setRpcUrl(
  db: InstanceType<typeof Database>,
  chainId: number,
  rpcUrl: string
): { success: boolean } {
  db.prepare('INSERT OR REPLACE INTO configs (key, value) VALUES (?, ?)').run(
    `rpc_url_${chainId}`,
    rpcUrl
  )
  return { success: true }
}

/**
 * Reimplement the resetRpcUrl IPC handler logic for testing purposes.
 */
function resetRpcUrl(
  db: InstanceType<typeof Database>,
  chainId: number
): { success: boolean } {
  db.prepare('DELETE FROM configs WHERE key = ?').run(`rpc_url_${chainId}`)
  return { success: true }
}

describe('RPC URL Config', () => {
  let db: InstanceType<typeof Database>

  const yamlChainRpcs = [
    { chainId: 1, rpcUrl: 'https://eth-mainnet.example.com' },
    { chainId: 8453, rpcUrl: 'https://base-mainnet.example.com' },
    { chainId: 42161, rpcUrl: 'https://arbitrum-mainnet.example.com' },
  ]

  beforeEach(() => {
    db = new Database(':memory:')
    db.exec(
      'CREATE TABLE IF NOT EXISTS configs (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE NOT NULL, value TEXT NOT NULL)'
    )
  })

  afterEach(() => {
    db.close()
  })

  describe('Overlay Merge Logic', () => {
    test('returns yaml chainRpcs unchanged when no DB overrides exist', () => {
      const result = mergeChainRpcsWithDbOverrides(db, yamlChainRpcs)
      expect(result).toEqual(yamlChainRpcs)
    })

    test('overrides yaml rpcUrl with DB value when rpc_url_{chainId} exists', () => {
      db.prepare('INSERT INTO configs (key, value) VALUES (?, ?)').run(
        'rpc_url_8453',
        'https://custom-base.example.com'
      )

      const result = mergeChainRpcsWithDbOverrides(db, yamlChainRpcs)

      expect(result).toEqual([
        { chainId: 1, rpcUrl: 'https://eth-mainnet.example.com' },
        { chainId: 8453, rpcUrl: 'https://custom-base.example.com' },
        { chainId: 42161, rpcUrl: 'https://arbitrum-mainnet.example.com' },
      ])
    })

    test('only overrides matching chainIds, leaves others unchanged', () => {
      db.prepare('INSERT INTO configs (key, value) VALUES (?, ?)').run(
        'rpc_url_1',
        'https://custom-eth.example.com'
      )

      const result = mergeChainRpcsWithDbOverrides(db, yamlChainRpcs)

      expect(result[0]).toEqual({
        chainId: 1,
        rpcUrl: 'https://custom-eth.example.com',
      })
      expect(result[1]).toEqual({
        chainId: 8453,
        rpcUrl: 'https://base-mainnet.example.com',
      })
      expect(result[2]).toEqual({
        chainId: 42161,
        rpcUrl: 'https://arbitrum-mainnet.example.com',
      })
    })

    test('handles multiple DB overrides', () => {
      const insert = db.prepare(
        'INSERT INTO configs (key, value) VALUES (?, ?)'
      )
      insert.run('rpc_url_1', 'https://custom-eth.example.com')
      insert.run('rpc_url_42161', 'https://custom-arb.example.com')

      const result = mergeChainRpcsWithDbOverrides(db, yamlChainRpcs)

      expect(result).toEqual([
        { chainId: 1, rpcUrl: 'https://custom-eth.example.com' },
        { chainId: 8453, rpcUrl: 'https://base-mainnet.example.com' },
        { chainId: 42161, rpcUrl: 'https://custom-arb.example.com' },
      ])
    })

    test('ignores invalid DB keys (non-numeric chainId)', () => {
      db.prepare('INSERT INTO configs (key, value) VALUES (?, ?)').run(
        'rpc_url_not_a_number',
        'https://invalid.example.com'
      )

      const result = mergeChainRpcsWithDbOverrides(db, yamlChainRpcs)

      expect(result).toEqual(yamlChainRpcs)
    })

    test('ignores empty DB values', () => {
      db.prepare('INSERT INTO configs (key, value) VALUES (?, ?)').run(
        'rpc_url_8453',
        ''
      )

      // Empty value rows are still returned by the LIKE query, so
      // dbRpcConfigs.length > 0, but the row.value check filters them out.
      const result = mergeChainRpcsWithDbOverrides(db, yamlChainRpcs)

      expect(result).toEqual(yamlChainRpcs)
    })
  })

  describe('getRpcUrl Logic', () => {
    test('returns yaml default when no DB override exists', () => {
      const result = getRpcUrl(db, yamlChainRpcs, 8453)
      expect(result).toEqual({
        rpcUrl: 'https://base-mainnet.example.com',
        isCustom: false,
      })
    })

    test('returns DB value with isCustom=true when override exists', () => {
      db.prepare('INSERT INTO configs (key, value) VALUES (?, ?)').run(
        'rpc_url_8453',
        'https://custom-base.example.com'
      )

      const result = getRpcUrl(db, yamlChainRpcs, 8453)
      expect(result).toEqual({
        rpcUrl: 'https://custom-base.example.com',
        isCustom: true,
      })
    })

    test('returns empty string when chainId not in yaml or DB', () => {
      const result = getRpcUrl(db, yamlChainRpcs, 99999)
      expect(result).toEqual({ rpcUrl: '', isCustom: false })
    })
  })

  describe('setRpcUrl Logic', () => {
    test('saves rpc_url_{chainId} to configs table', () => {
      const result = setRpcUrl(db, 8453, 'https://custom-base.example.com')

      expect(result).toEqual({ success: true })

      const row = db
        .prepare('SELECT value FROM configs WHERE key = ?')
        .get('rpc_url_8453') as { value: string }
      expect(row.value).toBe('https://custom-base.example.com')
    })

    test('overwrites existing DB value', () => {
      setRpcUrl(db, 8453, 'https://first.example.com')
      setRpcUrl(db, 8453, 'https://second.example.com')

      const row = db
        .prepare('SELECT value FROM configs WHERE key = ?')
        .get('rpc_url_8453') as { value: string }
      expect(row.value).toBe('https://second.example.com')

      const count = db
        .prepare("SELECT COUNT(*) as cnt FROM configs WHERE key = 'rpc_url_8453'")
        .get() as { cnt: number }
      expect(count.cnt).toBe(1)
    })
  })

  describe('resetRpcUrl Logic', () => {
    test('removes rpc_url_{chainId} from configs table', () => {
      setRpcUrl(db, 8453, 'https://custom-base.example.com')

      const result = resetRpcUrl(db, 8453)

      expect(result).toEqual({ success: true })

      const row = db
        .prepare('SELECT value FROM configs WHERE key = ?')
        .get('rpc_url_8453')
      expect(row).toBeUndefined()
    })

    test('no error when key does not exist', () => {
      const result = resetRpcUrl(db, 99999)
      expect(result).toEqual({ success: true })
    })
  })
})
