import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect
} from 'react'

interface ConfigContextType {
  apiKey?: string
  saveApiKey: (apiKey: string) => Promise<void>
  saveConfigs: (newConfig: { [key: string]: string }) => Promise<void>
}

export const ConfigContext = createContext<ConfigContextType>({
  apiKey: undefined,
  saveApiKey: async () => {},
  saveConfigs: async () => {}
})

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [config, setConfig] = useState<{ apiKey?: string }>({
    apiKey: undefined
  })

  const fetchConfigs = async () => {
    // @ts-ignore
    const configs = (await window.configAPI.getConfigs()) as [
      { key: string; value: string }
    ]
    console.log('Fetched configs:', configs)
    setConfig({
      apiKey: configs.find((config) => config.key === 'api_key')?.value
    })
  }

  const saveApiKey = async (apiKey: string) => {
    // @ts-ignore
    await window.configAPI.setConfigs({ api_key: apiKey })
    await fetchConfigs()
  }

  const saveConfigs = async (newConfig: { [key: string]: string }) => {
    // @ts-ignore
    await window.configAPI.setConfigs(newConfig)
    await fetchConfigs()
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  return (
    <ConfigContext.Provider
      value={{ apiKey: config.apiKey, saveApiKey, saveConfigs }}
    >
      {children}
    </ConfigContext.Provider>
  )
}
