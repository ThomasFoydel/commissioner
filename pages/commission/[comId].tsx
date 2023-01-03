import { useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { comDetails } from '../../apollo/queries'
import CountDown from '../../components/CountDown'
import InterplanetaryContent from '../../components/InterplanetaryContent'
import { timeStringFromSeconds } from '../terminal/utils'

const CommissionDetails = () => {
  const {
    query: { comId },
  } = useRouter()

  const { data } = useQuery(comDetails, { variables: { comId } })
  const commission: Commission = data?.commission || {}

  const {
    id,
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
    <div>
      <p>COMMISSION {commission.id}</p>
      <p>COMMISSIONER {commissioner.id}</p>
      <p>REWARD: {reward}</p>
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
      <p>{entryCount} ENTRIES</p>
      <p>
        PROMPT: <InterplanetaryContent path={prompt} />
      </p>
      {winningAuthor && <p>WINNER: {winningAuthor.id}</p>}
    </div>
  )
}

export default CommissionDetails
