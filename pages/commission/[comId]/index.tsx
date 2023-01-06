import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useEthers } from '@usedapp/core'
import { useQuery } from '@apollo/client'
import { formatEther } from 'ethers/lib/utils'
import { H, Level } from 'react-accessible-headings'
import InterplanetaryContent from '../../../components/InterplanetaryContent'
import EntrySummary from '../../../components/EntrySummary'
import CountDown from '../../../components/CountDown'
import EntryForm from '../../../components/EntryForm'
import { comDetails } from '../../../apollo/queries'

const CommissionDetails = () => {
  const router = useRouter()
  const comId = String(router.query.comId).toLowerCase()
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
      <H>COMMISSION {commission.id}</H>
      <Level>
        <Link href={`/user/${commissioner.id}`}>
          <p>COMMISSIONER {commissioner.id}</p>
        </Link>
        <p>REWARD: {formatEther(reward)} ETH</p>
        <p>CREATED {createdDate.toLocaleString().toUpperCase()}</p>
        <p>{active && 'ACTIVE'}</p>
        {publicTriggerOpen ? (
          <button>PUBLIC TRIGGER OPEN</button>
        ) : commissionerTriggerOpen ? (
          <div>
            <button>COMMISSIONER TRIGGER OPEN</button>
            <p>
              <CountDown
                endTimestamp={publicTriggerTime}
                onCompletion={() => setPublicTriggerOpen}
              />{' '}
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
              <CountDown
                endTimestamp={publicTriggerTime}
                onCompletion={() => setPublicTriggerOpen}
              />{' '}
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
          <EntrySummary key={entry.id} entry={entry} />
        ))}
        {entries.length > 3 && (
          <Link href={`/commission/${comId}/entries/`}>
            <button>see more entries</button>
          </Link>
        )}

        {userCanEnter && (
          <div>
            <button onClick={() => setEnterFormOpen((o) => !o)}>ENTER COMMISSION</button>
            {enterFormOpen && <EntryForm id={String(comId)} onComplete={refetch} />}
          </div>
        )}
      </Level>
    </div>
  )
}

export default CommissionDetails
