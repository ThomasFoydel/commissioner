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

const CommissionForm = ({ onComplete }: { onComplete?: Function }) => {
  const [path, setPath] = useState('')
  const [processing, setProcessing] = useState(false)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState('')
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
    const toastId = toast.info('creating commission...')
    setError('')
    try {
      const options = {
        value: parseEther(
          reward.toLocaleString('fullwide', {
            useGrouping: false,
            maximumSignificantDigits: 32,
          })
        ).toString(),
      }
      const minTimeSeconds = minTime * 86400
      const tx = await factoryContract.createCommission(path, minTimeSeconds, options)

      if (tx) {
        toast.update(toastId, { type: 'info', render: `transaction hash ${truncate(tx.hash)}` })
        setProcessing(true)
        setTxHash(tx.hash)
      }
      const receipt = await tx.wait()
      if (receipt) {
        setComplete(true)
        toast.update(toastId, { type: 'success', render: 'new commission created!' })
        if (onComplete) onComplete()
      }
    } catch (err) {
      if (err.code === 4001) {
        toast.error('user rejected in metamask')
      } else {
        toast.error('commission creation failed!')
        setError('Transaction failed!')
      }
    }
    setProcessing(false)
  }

  const handleMinTime = (e: ChangeEvent<HTMLInputElement>) => setMinTime(+e.target.value)
  const handleReward = (e: ChangeEvent<HTMLInputElement>) => setReward(+e.target.value)

  return (
    <div className="w-100">
      <div className="w-50 center bg-card">
        <TextUpload setPath={setPath} label="Upload Commission Prompt:" />
        {path && (
          <p>
            IPFS Path:{' '}
            <a
              href={`https://ipfs.infura.io/ipfs/${path}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {path}
            </a>
          </p>
        )}
        <div>
          <form onSubmit={handleSubmit} className="text-center my-3">
            <div>
              <label htmlFor="mintime">Minimum Time (days)</label>
              <input
                type="number"
                name="mintime"
                onChange={handleMinTime}
                value={minTime}
                placeholder="minimum time (days)"
              />
            </div>

            <div>
              <label htmlFor="reward">Reward (ETH)</label>
              <input
                type="number"
                name="reward"
                onChange={handleReward}
                value={reward}
                placeholder="minimum time (days)"
              />
            </div>
            <button className={`button ${(!path || processing) && 'disabled'}`} type="submit">
              Create Commission
            </button>
          </form>
        </div>
        {(processing || complete) && <p>{complete ? 'Submission complete!' : 'Processing...'}</p>}
        {error && <p>error: {error}</p>}
        {txHash && <p>txHash: {txHash}</p>}
      </div>
    </div>
  )
}

export default CommissionForm
