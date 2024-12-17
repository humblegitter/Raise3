'use client'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { createConfig, WagmiProvider } from 'wagmi'
import { mainnet, sepolia } from 'viem/chains'
import { http } from 'viem'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const { connectors } = getDefaultWallets({
  appName: 'Raise3',
  projectId: '41630be41ba42e75e99b1843053eff29', // Get from https://cloud.walletconnect.com
})

const config = createConfig({
  connectors,
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children as React.ReactElement<any, any>}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
