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
import DynamicTypeOut from '../../../components/DynamicTypeOut'
import EntrySummary from '../../../components/EntrySummary'
import LoadingDots from '../../../components/LoadingDots'
import CountDown from '../../../components/CountDown'
import EntryForm from '../../../components/EntryForm'
import { comDetails } from '../../../apollo/queries'
import TypeOut from '../../../components/TypeOut'
import { truncate } from '../../../utils'
import Layout from '../../layouts/CRT'
import Button from '../../../components/Button'

enum Trigger {
  public = 'public',
  commissioner = 'commissioner',
}

const CommissionDetails = () => {
  const router = useRouter()
  const comId = String(router.query.comId).toLowerCase()
  const { account, library } = useEthers()

  const { data, loading } = useQuery(comDetails, { variables: { comId }, pollInterval: 3000 })

  const commission: Commission = data?.commission || {}
  const [enterFormOpen, setEnterFormOpen] = useState(false)
  const [processingTrigger, setProcessingTrigger] = useState(false)

  const {
    submittedEntries: entries,
    canBeCancelled,
    winningAuthor,
    commissioner,
    entryCount,
    forerunner,
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

  const [cancelInProgress, setCancelInProgress] = useState(false)
  const handleCancel = async () => {
    if (cancelInProgress || !library || !account) return
    setCancelInProgress(true)
    try {
      toast.dismiss()
      toast.info('approve in metamask')
      const signer = library.getSigner(String(account))
      const commissionContract = new Contract(comId, commissionInterface, signer)
      const tx = await commissionContract.cancel()
      toast.dismiss()
      toast.info('cancelling commission. sit tight...', { autoClose: false })
      await tx.wait()
      toast.dismiss()
      toast.success('commission cancelled')
    } catch (err) {
      toast.dismiss()
      toast.error('commission cancelation failed')
    }
    setCancelInProgress(false)
  }

  useEffect(() => {
    setPublicTriggerOpen(active && secondsLeftUntilPublicTriggerOpens <= 0)
    setCommissionerTriggerOpen(active && secondsLeftUntilComTrigger <= 0)
  }, [commission])

  if (!loading && data?.commission === undefined) {
    return <TypeOut>COMMISSION {comId} NOT FOUND</TypeOut>
  }
  if (data?.commission === undefined) return <LoadingDots />

  const userHasNotSubmittedEntry =
    account && entries.every((entry: Entry) => entry.author.id !== account.toLowerCase())

  const userIsCommissioner = account && commissioner.id === account.toLowerCase()

  const userCanEnter = account && active && !userIsCommissioner && userHasNotSubmittedEntry

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
    } catch (err) {
      toast.dismiss()
      if (err.code === 4001) toast.error('user rejected in metamask')
      toast.error(`${type} trigger failed`)
    }
    setProcessingTrigger(false)
  }

  const handlePublicTrigger = () => handleTrigger(Trigger.public)
  const handleCommissionerTrigger = () => handleTrigger(Trigger.commissioner)
  const entrySuccess = () => setEnterFormOpen(false)

  return (
    <div className="m-2 p-2 crt-border rounded-sm">
      <H>
        <TypeOut>COMMISSION {truncate(commission.id)}</TypeOut>
      </H>
      <Level>
        <Link href={`/user/${commissioner.id}`}>
          <TypeOut>COMMISSIONER {truncate(commissioner.id)}</TypeOut>
        </Link>
        <DynamicTypeOut>REWARD: {formatEther(reward)} ETH</DynamicTypeOut>
        <TypeOut>CREATED {createdDate.toLocaleString().toUpperCase()}</TypeOut>
        <TypeOut> {active ? 'ACTIVE' : 'COMPLETE'}</TypeOut>

        <div>
          <TypeOut>PROMPT</TypeOut>
          <InterplanetaryContent path={prompt} maxChars={1500} />
          <a
            className="button text-center w-full mt-2 block center sm:transform-none sm:ml-0 px-0 sm:w-[200px]"
            style={{ textShadow: 'none' }}
            href={`http://ipfs.io/ipfs/${prompt}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            SEE ON IPFS
          </a>
        </div>
        {winningAuthor && (
          <>
            <Link href={`/user/${winningAuthor.id}`}>
              <TypeOut>WINNER: {truncate(winningAuthor.id)}</TypeOut>
            </Link>
            <TipOrAddRewardForm type={FormType.tipWinner} commissionId={comId} />
          </>
        )}

        {canBeCancelled && userIsCommissioner && (
          <Button onClick={handleCancel}>
            <TypeOut>CANCEL</TypeOut>
          </Button>
        )}
        {active && commissionerTriggerOpen && !publicTriggerOpen && forerunner && (
          <Button className="button" onClick={handleCommissionerTrigger}>
            <TypeOut>COMMISSIONER TRIGGER</TypeOut>
          </Button>
        )}
        {active && publicTriggerOpen && forerunner && (
          <Button className="button" onClick={handlePublicTrigger}>
            <TypeOut>PUBLIC TRIGGER</TypeOut>
          </Button>
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

        {active ? (
          <TipOrAddRewardForm type={FormType.addReward} commissionId={comId} />
        ) : (
          <TipOrAddRewardForm type={FormType.tipCommissioner} commissionId={comId} />
        )}

        <DynamicTypeOut>
          {entryCount} {Number(entryCount) === 1 ? 'ENTRY' : 'ENTRIES'}
        </DynamicTypeOut>
        {entries.slice(0, 3).map((entry: Entry) => (
          <EntrySummary key={entry.id} entry={entry} />
        ))}
        {entries.length > 3 && (
          <Link href={`/commission/${comId}/entries/`}>
            <TypeOut>see more entries</TypeOut>
          </Link>
        )}

        {userCanEnter && (
          <div>
            <Button onClick={() => setEnterFormOpen((o) => !o)}>
              <TypeOut>ENTER COMMISSION</TypeOut>
            </Button>
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
