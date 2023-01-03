import { useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import React from 'react'
import { comDetails } from '../../apollo/queries'
import InterplanetaryContent from '../../components/InterplanetaryContent'
import { timeStringFromSeconds } from '../terminal/utils'

const CommissionDetails = () => {
  const {
    query: { comId },
  } = useRouter()

  const { data } = useQuery(comDetails, { variables: { comId } })
  const commission: Commission = data?.commission
  if (!commission) return <></>
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
  const comTriggerTimeSeconds = comTriggerTime
  const secondsLeftUntilComTrigger = comTriggerTime - nowSeconds
  const comTriggerOpen = active && secondsLeftUntilComTrigger <= 0
  const publicTriggerTimeSeconds = comTriggerTimeSeconds + 172800
  const secondsLeftUntilPublicTriggerOpens = publicTriggerTimeSeconds - nowSeconds
  const publicTriggerOpen = active && secondsLeftUntilPublicTriggerOpens <= 0
  return (
    <div>
      <p>COMMISSION {commission.id}</p>
      <p>COMMISSIONER {commissioner.id}</p>
      <p>REWARD: {reward}</p>
      <p>CREATED {createdDate.toLocaleString().toUpperCase()}</p>
      <p>{active && 'ACTIVE'}</p>
      {publicTriggerOpen ? (
        <button>PUBLIC TRIGGER OPEN</button>
      ) : comTriggerOpen ? (
        <div>
          <button>COMMISSIONER TRIGGER OPEN</button>
          <p>
            {timeStringFromSeconds(secondsLeftUntilPublicTriggerOpens)} UNTIL COMMISSIONER TRIGGER
            OPENS
          </p>
        </div>
      ) : active ? (
        <div>
          <p>
            {timeStringFromSeconds(secondsLeftUntilComTrigger)} UNTIL COMMISSIONER TRIGGER OPENS
          </p>
          <p>
            {timeStringFromSeconds(secondsLeftUntilPublicTriggerOpens)} UNTIL PUBLIC TRIGGER OPENS
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
