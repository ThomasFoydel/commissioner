import Link from 'next/link'
import { NextPage } from 'next'
import { Contract } from 'ethers'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useEthers } from '@usedapp/core'
import { useQuery } from '@apollo/client'
import { formatEther, Interface } from 'ethers/lib/utils'
import { H, Level } from 'react-accessible-headings'
import InterplanetaryContent from '../../../components/InterplanetaryContent'
import commissionABI from '../../../utils/ethers/ABIs/commissionABI.json'
import EntrySummary from '../../../components/EntrySummary'
import CountDown from '../../../components/CountDown'
import EntryForm from '../../../components/EntryForm'
import { comDetails } from '../../../apollo/queries'
import Layout from '../../layouts/CRT'

enum Trigger {
  public = 'public',
  commissioner = 'commissioner',
}

const CommissionDetails = () => {
  const router = useRouter()
  const comId = String(router.query.comId).toLowerCase()
  const { account, library } = useEthers()

  const { data, refetch } = useQuery(comDetails, { variables: { comId } })
  const commission: Commission = data?.commission || {}
  const [enterFormOpen, setEnterFormOpen] = useState(false)
  const [processingTrigger, setProcessingTrigger] = useState(false)

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

  const commissionInterface = new Interface(commissionABI)

  const handleTrigger = async (trigger: Trigger) => {
    if (processingTrigger) return toast.error('trigger already processing')
    if (!library || !account) return
    if (trigger === Trigger.public && !publicTriggerOpen) return
    if (trigger === Trigger.commissioner && !commissionerTriggerOpen) return
    if (trigger === Trigger.commissioner && account.toLowerCase() !== commissioner.id) {
      return toast.error('commissioner only')
    }
    setProcessingTrigger(true)
    toast.info('approve in metamask')
    const type = trigger === Trigger.commissioner ? 'commissioner' : 'public'
    try {
      const signer = library.getSigner(String(account))
      const commissionContract = new Contract(comId, commissionInterface, signer)
      const triggerFunction =
        trigger === Trigger.commissioner
          ? commissionContract.chooseWinner
          : commissionContract.chooseWinnerPublic
      const tx = await triggerFunction()
      toast.dismiss()
      toast.info(`attempting ${type} trigger. sit tight...`, { autoClose: false })
      await tx.wait()
      toast.dismiss()
      toast.success(`${type} trigger successful`)
      setTimeout(() => refetch(), 2000)
    } catch (err) {
      toast.dismiss()
      if (err.code === 4001) toast.error('user rejected in metamask')
      toast.error(`${type} trigger failed`)
    }
    setProcessingTrigger(false)
  }

  const handlePublicTrigger = () => handleTrigger(Trigger.public)
  const handleCommissionerTrigger = () => handleTrigger(Trigger.commissioner)

  return (
    <div className="m-2 p-2 crt-border rounded-sm">
      <H>COMMISSION {commission.id}</H>
      <Level>
        <Link href={`/user/${commissioner.id}`}>
          <p>COMMISSIONER {commissioner.id}</p>
        </Link>
        <p>REWARD: {formatEther(reward)} ETH</p>
        <p>CREATED {createdDate.toLocaleString().toUpperCase()}</p>
        <p>{active && 'ACTIVE'}</p>
        {publicTriggerOpen ? (
          <button onClick={handlePublicTrigger}>PUBLIC TRIGGER OPEN</button>
        ) : commissionerTriggerOpen ? (
          <div>
            <button onClick={handleCommissionerTrigger}>COMMISSIONER TRIGGER OPEN</button>
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

CommissionDetails.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default CommissionDetails
