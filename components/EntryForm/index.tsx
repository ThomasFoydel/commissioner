import { Contract } from 'ethers'
import React, { useState } from 'react'
import { useEthers } from '@usedapp/core'
import { Interface } from 'ethers/lib/utils'
import { H, Level } from 'react-accessible-headings'
import commissionABI from '../../utils/ethers/ABIs/commissionABI.json'
import { ErrorResponse } from '../../utils/types/error'
import TextUpload from '../../components/TextUpload'
import { toast } from 'react-toastify'

const EntryForm = ({ id, onComplete }: { id: string; onComplete?: Function }) => {
  const [path, setPath] = useState('')
  const [processing, setProcessing] = useState(false)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')
  const { account, library } = useEthers()

  const commissionInterface = new Interface(commissionABI)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!library || !account || !path || processing || complete) return
    const toastId = toast.info('submitting entry...')
    setError('')
    try {
      const signer = library.getSigner(String(account))
      const commissionContract = new Contract(id, commissionInterface, signer)
      const tx = await commissionContract.submitEntry(path)
      if (tx) {
        setProcessing(true)
        setTxHash(tx.hash)
      }
      const receipt = await tx.wait()
      if (receipt) {
        setComplete(true)
        toast.update(toastId, { type: 'success', render: 'new entry created!' })
        if (onComplete) onComplete()
      }
    } catch (err) {
      toast.update(toastId, { type: 'error', render: 'entry creation failed!' })
      if (err instanceof ErrorResponse && err.code === 4001) {
        return
      }
      setError('Transaction failed!')
    }
    setProcessing(false)
  }

  return (
    <div className="w-100">
      <div className="w-50 center bg-card">
        <TextUpload setPath={setPath} label="Upload Entry:" />
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
            <button className={`button ${(!path || processing) && 'disabled'}`} type="submit">
              Create Entry
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

export default EntryForm
