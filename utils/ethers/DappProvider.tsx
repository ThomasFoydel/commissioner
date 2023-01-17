import React, { FC, PropsWithChildren } from 'react'
import { ChainId, DAppProvider } from '@usedapp/core'

const config = {
  readOnlyChainId: ChainId.Goerli,
  readOnlyUrls: {
    [ChainId.Mainnet]: 'https://mainnet.infura.io/v3/05588c95cd2845e79ecca2237548ecaf',
    [ChainId.Goerli]: 'https://goerli.infura.io/v3/05588c95cd2845e79ecca2237548ecaf',
  },
}

const DappProvider: FC = ({ children }: PropsWithChildren<{}>) => (
  <DAppProvider config={config}>{children}</DAppProvider>
)

export default DappProvider
