import { Contract } from 'ethers'
import React, { useState } from 'react'
import { useEthers } from '@usedapp/core'
import { Interface } from 'ethers/lib/utils'
import { H, Level } from 'react-accessible-headings'
import commissionABI from '../../utils/ethers/ABIs/commissionABI.json'
import TextUpload from '../../components/TextUpload'
import { toast } from 'react-toastify'

const EntryForm = ({ id, onComplete }: { id: string; onComplete?: Function }) => {
  const [path, setPath] = useState('')
  const [processing, setProcessing] = useState(false)
  const [complete, setComplete] = useState(false)
  const [txHash, setTxHash] = useState('')
  const { account, library } = useEthers()

  const commissionInterface = new Interface(commissionABI)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!library || !account || !path || processing || complete) return
    setProcessing(true)
    toast.dismiss()
    toast.info('please approve in metamask')
    try {
      const signer = library.getSigner(String(account))
      const commissionContract = new Contract(id, commissionInterface, signer)
      const tx = await commissionContract.submitEntry(path)
      toast.info('submitting entry...')
      setTxHash(tx.hash)
      const receipt = await tx.wait()
      if (receipt) {
        setComplete(true)
        toast.success('new entry created!')
        if (onComplete) onComplete()
      }
    } catch (err) {
      toast.dismiss()
      if (err.code === 4001) {
        toast.error('user rejected in metamask')
      } else {
        return toast.error('entry creation failed')
      }
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
        {txHash && <p>txHash: {txHash}</p>}
      </div>
    </div>
  )
}

export default EntryForm
