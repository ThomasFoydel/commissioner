import React, { FC, PropsWithChildren } from 'react'
import { ChainId, DAppProvider } from '@usedapp/core'

const config = {
  readOnlyChainId: ChainId.Goerli,
  readOnlyUrls: {
    [ChainId.Mainnet]: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    [ChainId.Goerli]: `https://goerli.infura.io/v3/${process.env.INFURA_KEY}`,
  },
}

const DappProvider: FC = ({ children }: PropsWithChildren<{}>) => (
  <DAppProvider config={config}>{children}</DAppProvider>
)

export default DappProvider
