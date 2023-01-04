import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useEthers } from '@usedapp/core'
import { useQuery } from '@apollo/client'
import InterplanetaryContent from '../../components/InterplanetaryContent'
import CountDown from '../../components/CountDown'
import EntryForm from '../../components/EntryForm'
import { comDetails } from '../../apollo/queries'
import { formatEther } from 'ethers/lib/utils'
import { truncate } from '../../utils'

const CommissionDetails = () => {
  const {
    query: { comId },
  } = useRouter()
  const { account } = useEthers()

  const { data, refetch } = useQuery(comDetails, { variables: { comId } })
  const commission: Commission = data?.commission || {}
  const [enterFormOpen, setEnterFormOpen] = useState(false)

  const {
    submittedEntries: entries,
    winningAuthor,
    commissioner,
    entryCount,
    timestamp,
    minTime,
    prompt,
    reward,
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

  const userHasNotSubmittedEntry =
    account && entries.every((entry: Entry) => entry.author.id !== account.toLowerCase())
  const userCanEnter = account && active && commissioner.id !== account && userHasNotSubmittedEntry
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
      {entries.slice(0, 3).map((entry: Entry) => (
        <Entry key={entry.id} entry={entry} />
      ))}
      {entries.length > 3 && (
        <Link href={`/entries/${comId}`}>
          <button>see more entries</button>
        </Link>
      )}

      {userCanEnter && (
        <div>
          <button onClick={() => setEnterFormOpen((o) => !o)}>ENTER COMMISSION</button>
          {enterFormOpen && <EntryForm id={String(comId)} onComplete={refetch} />}
        </div>
      )}
    </div>
  )
}

const Entry = ({ entry }: { entry: Entry }) => (
  <Link href={`/entry/${entry.id}`}>
    <div className="m-2 p-2 border rounded-sm cursor-pointer">
      <p>ENTRY {truncate(entry.id)}</p>
      <p>AUTHOR {truncate(entry.author.id)}</p>
      <p>
        CONTENT <InterplanetaryContent path={entry.ipfsPath} />
      </p>
      <p>
        {entry.voteAmount} {Number(entry.voteAmount) === 1 ? 'VOTE' : 'VOTES'}
      </p>
    </div>
  </Link>
)

export default CommissionDetails
