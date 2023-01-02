import React, { FC, PropsWithChildren } from 'react'
import { ChainId, DAppProvider } from '@usedapp/core'

const config = {
  readOnlyChainId: ChainId.Goerli,
  readOnlyUrls: {
    [ChainId.Mainnet]: 'https://mainnet.infura.io/v3/563a9f37ec0a4a9881189b07b785f77b',
    [ChainId.Goerli]: 'https://goerli.infura.io/v3/563a9f37ec0a4a9881189b07b785f77b',
  },
}

const DappProvider: FC = ({ children }: PropsWithChildren<{}>) => (
  <DAppProvider config={config}>{children}</DAppProvider>
)

export default DappProvider
