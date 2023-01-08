import { Contract } from 'ethers'
import { toast } from 'react-toastify'
import { useEthers } from '@usedapp/core'
import React, { ChangeEvent, useState } from 'react'
import { H, Level } from 'react-accessible-headings'
import { Interface, parseEther } from 'ethers/lib/utils'
import factoryABI from '../../utils/ethers/ABIs/factoryABI.json'
import useGetConfig from '../../utils/customHooks/useGetConfig'
import TextUpload from '../TextUpload'
import { truncate } from '../../utils'
import TypeOut from '../TypeOut'

const CommissionForm = ({ onComplete }: { onComplete?: Function }) => {
  const [path, setPath] = useState('')
  const [processing, setProcessing] = useState(false)
  const [complete, setComplete] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [minTime, setMinTime] = useState(2)
  const [reward, setReward] = useState(0)

  const config = useGetConfig()
  const { account, library } = useEthers()
  const signer = library && account ? library.getSigner(String(account)) : null
  const factoryInterface = new Interface(factoryABI)

  const factoryContract = signer
    ? new Contract(config.factoryAddress, factoryInterface, signer)
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!library || !account || !path || processing || complete) return
    setProcessing(true)
    toast.dismiss()
    toast.info('please approve in metamask')
    try {
      const options = {
        value: parseEther(
          reward.toLocaleString('fullwide', {
            useGrouping: false,
            maximumSignificantDigits: 20,
          })
        ).toString(),
      }
      const minTimeSeconds = minTime * 86400
      const tx = await factoryContract.createCommission(path, minTimeSeconds, options)
      toast.info('creating commission...')
      if (tx) {
        setTxHash(tx.hash)
      }
      const receipt = await tx.wait()
      if (receipt) {
        setComplete(true)
        toast.dismiss()
        toast.success('new commission created!')
        if (onComplete) onComplete()
      }
    } catch (err) {
      toast.dismiss()
      if (err.code === 4001) toast.error('user rejected in metamask')
      else toast.error('commission creation failed!')
    }
    setProcessing(false)
  }

  const handleMinTime = (e: ChangeEvent<HTMLInputElement>) => setMinTime(+e.target.value)
  const handleReward = (e: ChangeEvent<HTMLInputElement>) => setReward(+e.target.value)

  return (
    <div className="w-100">
      <H className="text-center">
        <TypeOut>COMMISSION FORM</TypeOut>
      </H>

      <Level>
        <TextUpload setPath={setPath} label="Upload Commission Prompt:" />
        {path && (
          <a
            href={`http://ipfs.io/ipfs/${path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center w-100"
          >
            <TypeOut>IPFS Path: {truncate(path)}</TypeOut>
          </a>
        )}
        <div>
          <form onSubmit={handleSubmit} className="text-center my-3">
            <div className="flex flex-col items-center my-4">
              <label htmlFor="mintime" className="mb-2">
                Minimum Time (days)
              </label>
              <input
                type="number"
                name="mintime"
                onChange={handleMinTime}
                value={minTime}
                placeholder="minimum time (days)"
                className="crt-border p-1"
                min={2}
              />
            </div>

            <div className="flex flex-col items-center mb-4">
              <label htmlFor="reward" className="mb-2">
                Reward (ETH)
              </label>
              <input
                type="number"
                name="reward"
                onChange={handleReward}
                value={reward}
                placeholder="minimum time (days)"
                min="0"
                className="crt-border p-1"
                step="any"
              />
            </div>
            <button className={`button mt-2 ${(!path || processing) && 'disabled'}`} type="submit">
              Create Commission
            </button>
          </form>
        </div>
        {txHash && (
          <TypeOut>
            <p className="text-center">txHash: {txHash}</p>
          </TypeOut>
        )}
      </Level>
    </div>
  )
}

export default CommissionForm
