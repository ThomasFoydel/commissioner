import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import InterplanetaryContent from '../../components/InterplanetaryContent'
import CountDown from '../../components/CountDown'
import { comDetails } from '../../apollo/queries'
import { truncate } from '../../utils'
import { formatEther } from 'ethers/lib/utils'

const CommissionDetails = () => {
  const {
    query: { comId },
  } = useRouter()

  const { data } = useQuery(comDetails, { variables: { comId } })
  const commission: Commission = data?.commission || {}

  let {
    submittedEntries,
    commissioner,
    winningAuthor,
    entryCount,
    prompt,
    reward,
    timestamp,
    minTime,
    active,
  } = commission

  const createdDate = new Date(+timestamp * 1000)
  const comTriggerTime = +timestamp + +minTime
  const nowSeconds = Date.now() / 1000

  const secondsLeftUntilComTrigger = comTriggerTime - nowSeconds
  const publicTriggerTime = comTriggerTime + 172800
  const secondsLeftUntilPublicTriggerOpens = publicTriggerTime - nowSeconds

  const [commissionerTriggerOpen, setCommissionerTriggerOpen] = useState(
    active && secondsLeftUntilComTrigger <= 0
  )
  const [publicTriggerOpen, setPublicTriggerOpen] = useState(
    active && secondsLeftUntilPublicTriggerOpens <= 0
  )
  if (!data?.commission) return <></>
  return (
    <div className="m-2 p-2 border rounded-sm">
      <p>COMMISSION {commission.id}</p>
      <p>COMMISSIONER {commissioner.id}</p>
      <p>REWARD: {formatEther(reward)} ETH</p>
      <p>CREATED {createdDate.toLocaleString().toUpperCase()}</p>
      <p>{active && 'ACTIVE'}</p>
      {publicTriggerOpen ? (
        <button>PUBLIC TRIGGER OPEN</button>
      ) : commissionerTriggerOpen ? (
        <div>
          <button>COMMISSIONER TRIGGER OPEN</button>
          <p>
            <CountDown endTimestamp={publicTriggerTime} onCompletion={() => setPublicTriggerOpen} />{' '}
            UNTIL PUBLIC TRIGGER OPENS
          </p>
        </div>
      ) : active ? (
        <div>
          <p>
            <CountDown
              endTimestamp={comTriggerTime}
              onCompletion={() => setCommissionerTriggerOpen(true)}
            />{' '}
            UNTIL COMMISSIONER TRIGGER OPENS
          </p>
          <p>
            <CountDown endTimestamp={publicTriggerTime} onCompletion={() => setPublicTriggerOpen} />{' '}
            UNTIL PUBLIC TRIGGER OPENS
          </p>
        </div>
      ) : (
        'COMPLETE'
      )}
      <p>
        PROMPT <InterplanetaryContent path={prompt} />
      </p>
      {winningAuthor && <p>WINNER: {winningAuthor.id}</p>}

      <p>
        {entryCount} {Number(entryCount) === 1 ? 'ENTRY' : 'ENTRIES'}
      </p>
      {submittedEntries.slice(0, 3).map((entry: Entry) => (
        <Entry key={entry.id} entry={entry} />
      ))}
      {submittedEntries.length > 3 && (
        <Link href={`/entries/${comId}`}>
          <button>see all entries</button>
        </Link>
      )}
    </div>
  )
}

const Entry = ({ entry }: { entry: Entry }) => (
  <div className="m-2 p-2 border rounded-sm">
    <p>ENTRY {truncate(entry.id)}</p>
    <p>AUTHOR {truncate(entry.author.id)}</p>
    <p>
      CONTENT <InterplanetaryContent path={entry.ipfsPath} />
    </p>
    <p>
      {entry.voteAmount} {Number(entry.voteAmount) === 1 ? 'VOTE' : 'VOTES'}
    </p>
    <Link href={`/entry/${entry.id}`}>details</Link>
  </div>
)

export default CommissionDetails
