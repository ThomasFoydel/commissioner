import React from 'react'
import { getChainById, useEthers } from '@usedapp/core'

const ExplorerLink = ({ tx, label }: { tx: string; label: string }) => {
  const { chainId } = useEthers()
  const chain = getChainById(Number(chainId))

  return (
    <>
      {chain && (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={chain.getExplorerTransactionLink(tx)}
          style={{
            color: 'red',
            textOverflow: 'ellipsis',
            width: '100%',
            display: 'block',
            overflow: 'hidden',
          }}
        >
          {label ? label : tx}
        </a>
      )}
    </>
  )
}

export default ExplorerLink
