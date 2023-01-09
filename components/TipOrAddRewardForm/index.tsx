import { Contract } from 'ethers'
import { toast } from 'react-toastify'
import { useEthers } from '@usedapp/core'
import { Interface, parseEther } from 'ethers/lib/utils'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import commissionABI from '../../utils/ethers/ABIs/commissionABI.json'

export enum FormType {
  tipWinner = 'TIP_WINNER',
  tipCommissioner = 'TIP_COMMISSIONER',
  addReward = 'ADD_REWARD',
}

const messages = {
  [FormType.tipWinner]: {
    success: 'winner tipped successfully.',
    failure: 'tipping transaction failed.',
    button: 'TIP WINNER',
  },
  [FormType.tipCommissioner]: {
    success: 'commissioner tipped successfully',
    failure: 'tipping transaction failed',
    button: 'TIP COMMISSIONER',
  },
  [FormType.addReward]: {
    success: 'reward added successfully',
    failure: 'reward adding transaction failed',
    button: 'ADD REWARD',
  },
}

const TipOrAddRewardForm = ({
  commissionId,
  type,
  onComplete,
}: {
  commissionId: string
  type: FormType
  onComplete?: Function
}) => {
  const { library, account } = useEthers()
  const [processing, setProcessing] = useState(false)
  const [complete, setComplete] = useState(false)
  const [tipWinnerFormOpen, setTipWinnerFormOpen] = useState(false)
  const toggleTipWinnerForm = () => setTipWinnerFormOpen((o) => !o)
  const [winnerTipAmount, setWinnerTipAmount] = useState(0)
  const handleWinnerTipAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setWinnerTipAmount(+e.target.value)
  }

  const signer = library.getSigner(String(account))
  const commissionInterface = new Interface(commissionABI)
  const commissionContract = new Contract(commissionId, commissionInterface, signer)
  const { tipWinner, tipCommissioner, addReward } = commissionContract
  const contractFunction =
    type === FormType.tipWinner
      ? tipWinner
      : type === FormType.tipCommissioner
      ? tipCommissioner
      : addReward

  const handleTipWinnerSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!library || !account || processing || complete) return
    setProcessing(true)
    toast.dismiss()
    toast.info('please approve in metamask')
    try {
      const options = {
        value: parseEther(
          winnerTipAmount.toLocaleString('fullwide', {
            useGrouping: false,
            maximumSignificantDigits: 20,
          })
        ).toString(),
      }

      const tx = await contractFunction(options)
      toast.info('sit tight. this will take a minute...', { autoClose: false })
      const receipt = await tx.wait()
      if (receipt) {
        setComplete(true)
        toast.dismiss()
        toast.success(messages[type].success)
        if (onComplete) onComplete()
      }
    } catch (err) {
      toast.dismiss()
      if (err.code === 4001) toast.error('user rejected in metamask')
      else toast.error(messages[type].failure)
    }
    setProcessing(false)
  }
  return (
    <div>
      {tipWinnerFormOpen ? (
        <form onSubmit={handleTipWinnerSubmit}>
          <input
            type="number"
            step="any"
            min="0"
            onChange={handleWinnerTipAmount}
            value={winnerTipAmount}
          />
          <button className="button" type="submit">
            SUBMIT
          </button>
          <button className="button" type="button" onClick={toggleTipWinnerForm}>
            CANCEL
          </button>
        </form>
      ) : (
        <button onClick={toggleTipWinnerForm} className="button">
          {messages[type].button}
        </button>
      )}
    </div>
  )
}

export default TipOrAddRewardForm
