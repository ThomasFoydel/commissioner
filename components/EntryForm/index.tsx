import { Contract } from 'ethers'
import React, { useState } from 'react'
import { useEthers } from '@usedapp/core'
import { Interface } from 'ethers/lib/utils'
import { H, Level } from 'react-accessible-headings'
import commissionABI from '../../utils/ethers/ABIs/commissionABI.json'
import TextUpload from '../../components/TextUpload'
import { toast } from 'react-toastify'
import { truncate } from '../../utils'
import TypeOut from '../TypeOut'

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
      <div className="w-100 center bg-card">
        <H className="text-center">
          <TypeOut>ENTRY FORM</TypeOut>
        </H>
        <Level>
          <TextUpload onSuccess={setPath} label="Upload Entry:" />

          <div>
            <form onSubmit={handleSubmit} className="text-center my-3">
              <button className={`button ${(!path || processing) && 'disabled'}`} type="submit">
                Create Entry
              </button>
            </form>
          </div>
          {txHash && (
            <div className="text-center">
              <TypeOut>txHash: {truncate(txHash)}</TypeOut>
            </div>
          )}
        </Level>
      </div>
    </div>
  )
}

export default EntryForm
