import Link from 'next/link'
import { NextPage } from 'next'
import { Contract } from 'ethers'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useEthers } from '@usedapp/core'
import { useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { H, Level } from 'react-accessible-headings'
import { formatEther, Interface } from 'ethers/lib/utils'
import TipOrAddRewardForm, { FormType } from '../../../components/TipOrAddRewardForm'
import InterplanetaryContent from '../../../components/InterplanetaryContent'
import commissionABI from '../../../utils/ethers/ABIs/commissionABI.json'
import EntrySummary from '../../../components/EntrySummary'
import CountDown from '../../../components/CountDown'
import EntryForm from '../../../components/EntryForm'
import { comDetails } from '../../../apollo/queries'
import TypeOut from '../../../components/TypeOut'
import { truncate } from '../../../utils'
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

  const [commissionerTriggerOpen, setCommissionerTriggerOpen] = useState(false)
  const [publicTriggerOpen, setPublicTriggerOpen] = useState(false)

  const comTriggerTime = +timestamp + +minTime
  const nowSeconds = Date.now() / 1000
  const secondsLeftUntilComTrigger = comTriggerTime - nowSeconds
  const publicTriggerTime = comTriggerTime + 172800
  const secondsLeftUntilPublicTriggerOpens = publicTriggerTime - nowSeconds

  useEffect(() => {
    setPublicTriggerOpen(active && secondsLeftUntilPublicTriggerOpens <= 0)
    setCommissionerTriggerOpen(active && secondsLeftUntilComTrigger <= 0)
  }, [commission])

  if (!data?.commission) return <></>

  const userHasNotSubmittedEntry =
    account && entries.every((entry: Entry) => entry.author.id !== account.toLowerCase())
  const userCanEnter =
    account && active && commissioner.id !== account.toLowerCase() && userHasNotSubmittedEntry

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
  const entrySuccess = () => {
    setTimeout(() => {
      refetch()
      setEnterFormOpen(false)
    }, 1500)
  }

  return (
    <div className="m-2 p-2 crt-border rounded-sm">
      <H>
        <TypeOut>COMMISSION {truncate(commission.id)}</TypeOut>
      </H>
      <Level>
        <Link href={`/user/${commissioner.id}`}>
          <a>
            <TypeOut>COMMISSIONER {truncate(commissioner.id)}</TypeOut>
          </a>
        </Link>
        <TypeOut>REWARD: {formatEther(reward)} ETH</TypeOut>
        <TypeOut>CREATED {createdDate.toLocaleString().toUpperCase()}</TypeOut>
        <TypeOut> {active ? 'ACTIVE' : 'COMPLETE'}</TypeOut>
        {active && commissionerTriggerOpen && !publicTriggerOpen && (
          <button onClick={handleCommissionerTrigger}>
            <TypeOut>COMMISSIONER TRIGGER OPEN</TypeOut>
          </button>
        )}
        {active && publicTriggerOpen && (
          <button onClick={handlePublicTrigger}>
            <TypeOut>PUBLIC TRIGGER OPEN</TypeOut>
          </button>
        )}

        {active && !publicTriggerOpen && (
          <div>
            <CountDown endTimestamp={publicTriggerTime} onCompletion={setPublicTriggerOpen} />{' '}
            <TypeOut>UNTIL PUBLIC TRIGGER OPENS</TypeOut>
          </div>
        )}

        {active && !commissionerTriggerOpen && !publicTriggerOpen && (
          <div>
            <CountDown endTimestamp={comTriggerTime} onCompletion={setCommissionerTriggerOpen} />{' '}
            <TypeOut>UNTIL COMMISSIONER TRIGGER OPENS</TypeOut>
          </div>
        )}

        <div>
          <TypeOut>PROMPT</TypeOut>
          <InterplanetaryContent path={prompt} />
        </div>
        {winningAuthor && (
          <>
            <Link href={`/user/${winningAuthor.id}`}>
              <a>
                <TypeOut>WINNER: {truncate(winningAuthor.id)}</TypeOut>
              </a>
            </Link>
            <TipOrAddRewardForm type={FormType.tipWinner} commissionId={comId} />
          </>
        )}
        {active ? (
          <TipOrAddRewardForm type={FormType.addReward} commissionId={comId} />
        ) : (
          <TipOrAddRewardForm type={FormType.tipCommissioner} commissionId={comId} />
        )}

        <TypeOut>
          {entryCount} {Number(entryCount) === 1 ? 'ENTRY' : 'ENTRIES'}
        </TypeOut>
        {entries.slice(0, 3).map((entry: Entry) => (
          <EntrySummary key={entry.id} entry={entry} />
        ))}
        {entries.length > 3 && (
          <Link href={`/commission/${comId}/entries/`}>
            <a>
              <TypeOut>see more entries</TypeOut>
            </a>
          </Link>
        )}

        {userCanEnter && (
          <div>
            <button onClick={() => setEnterFormOpen((o) => !o)}>
              <TypeOut>ENTER COMMISSION</TypeOut>
            </button>
            {enterFormOpen && <EntryForm id={String(comId)} onComplete={entrySuccess} />}
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
