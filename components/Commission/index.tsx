import React from 'react'
import { H, Level } from 'react-accessible-headings'
import Link from 'next/link'
import InterplanetaryContent from '../InterplanetaryContent'
import type { CommissionType } from '../../utils/types/commission'
import { formatEther } from 'ethers/lib/utils'
import { shortenAddress } from '@usedapp/core'
interface props {
  commission: CommissionType
}

const Commission = (props: props) => {
  const { commission } = props
  const { id, prompt, entryCount, commissioner, winningAuthor, reward, timestamp } = commission
  const commissionerId = commissioner?.id
  return (
    <div className="card text-skin-muted m-4">
      <H>
        <Link href={`/commission/${id}`}>
          <p className="text-2xl  opacity-80">commission {shortenAddress(id)}</p>
        </Link>
      </H>
      <Level>
        <Link href={`/user/${commissionerId}`}>
          <p>commissioner: {shortenAddress(commissionerId)}</p>
        </Link>
        <p>
          prompt:{' '}
          <span className="text-skin-base">
            <InterplanetaryContent path={prompt} />
          </span>
        </p>
        <p>
          timestamp:
          {new Date(Number(timestamp) * 1000).toLocaleTimeString()}{' '}
          {new Date(Number(timestamp) * 1000).toLocaleDateString()}
        </p>
        <p>reward: {formatEther(reward)} ETH</p>
        <p>entryCount: {entryCount}</p>
        {winningAuthor && (
          <Link href={`/user/${winningAuthor.id}`}>
            <p>winningAuthorId: {shortenAddress(String(winningAuthor.id))}</p>
          </Link>
        )}
      </Level>
    </div>
  )
}

export default Commission
