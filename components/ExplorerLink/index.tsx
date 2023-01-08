import { getChainById, useEthers } from '@usedapp/core'
import { truncate } from '../../utils'
import TypeOut from '../TypeOut'

const ExplorerLink = ({ tx, label }: { tx: string; label?: string }) => {
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
            textOverflow: 'ellipsis',
            width: '100%',
            display: 'block',
            overflow: 'hidden',
          }}
        >
          <TypeOut>{label ? label : truncate(tx)}</TypeOut>
        </a>
      )}
    </>
  )
}

export default ExplorerLink
