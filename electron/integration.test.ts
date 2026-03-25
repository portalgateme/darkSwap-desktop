import * as fs from 'fs'
import * as path from 'path'

describe('Project integration checks', () => {
  const projectRoot = path.resolve(__dirname, '..')

  describe('electron/core imports are relative (not package imports)', () => {
    const filesToCheck = [
      'electron/preload/preload.ts',
      'electron/main/utils/coreReloader.ts',
      'electron/main/handlers/configHandler.ts',
      'electron/utils/configUtil.ts',
      'renderer/types.ts',
      'renderer/hooks/useGetAssets.ts',
      'renderer/components/Table/UserAssetTable.tsx',
      'renderer/components/Form/LimitOrderForm.tsx',
      'renderer/components/OrderContent/index.tsx',
      'renderer/components/Form/TriggerOrderForm.tsx',
      'renderer/components/HistoryContent/index.tsx',
      'renderer/components/MainContent/index.tsx'
    ]

    it.each(filesToCheck)('%s should import from electron/core via relative path', (filePath) => {
      const fullPath = path.join(projectRoot, filePath)
      const content = fs.readFileSync(fullPath, 'utf-8')
      // Should NOT have bare package imports
      expect(content).not.toMatch(/from\s+['"]darkswap-client-core['"]/)
      // Should NOT have old darkSwap-client-core path imports
      expect(content).not.toMatch(/from\s+['"].*darkSwap-client-core\/src['"]/)
      // Should have relative path imports to electron/core
      expect(content).toMatch(/from\s+['"].*\/core['"]/)
    })
  })

  describe('Auto Orders is hidden from sidebar', () => {
    it('should have Auto Orders menu item commented out', () => {
      const sidebarPath = path.join(projectRoot, 'renderer/components/Sidebar/index.tsx')
      const content = fs.readFileSync(sidebarPath, 'utf-8')

      // The Auto Orders link should be commented out
      expect(content).not.toMatch(/^\s*\{\s*\n?\s*title:\s*['"]Auto Orders['"]/m)
      // But should still exist as a comment
      expect(content).toMatch(/\/\/.*Auto Orders/)
    })
  })

  describe('package.json has no darkswap-client-core dependency', () => {
    it('should not reference darkswap-client-core as a local dependency', () => {
      const pkgPath = path.join(projectRoot, 'package.json')
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      expect(pkg.dependencies['darkswap-client-core']).toBeUndefined()
    })

    it('should have darkswap-sdk dependency in root package.json', () => {
      const pkgPath = path.join(projectRoot, 'package.json')
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      expect(pkg.dependencies['@thesingularitynetwork/darkswap-sdk']).toBeDefined()
    })
  })

  describe('tsconfig includes electron source', () => {
    it('should include electron/**/* in compilation', () => {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json')
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'))
      expect(tsconfig.include).toContain('electron/**/*')
    })

    it('should exclude test files from main compilation', () => {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json')
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'))
      expect(tsconfig.exclude).toContain('**/*.test.ts')
    })
  })
})
