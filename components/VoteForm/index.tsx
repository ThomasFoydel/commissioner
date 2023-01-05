import { BigNumber, Contract } from 'ethers'
import { toast } from 'react-toastify'
import { useEthers } from '@usedapp/core'
import { Interface, parseEther } from 'ethers/lib/utils'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import commissionAbi from '../../utils/ethers/ABIs/commissionABI.json'

const VoteForm = ({
  entry,
  onSuccess,
  commission,
}: {
  entry: Entry
  onSuccess?: Function
  commission: Commission
}) => {
  const { library, account } = useEthers()
  const [amount, setAmount] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  const signer = library && account ? library.getSigner(String(account)) : null
  const commissionInterface = new Interface(commissionAbi)
  const commissionFactory = new Contract(commission.id, commissionInterface, signer)

  const handleAmount = (e: ChangeEvent<HTMLInputElement>) => setAmount(+e.target.value)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (processing) return
    toast.dismiss()
    if (amount <= 0) return toast.error('amount must be greater than zero')
    setProcessing(true)
    toast.info('please approve in metamask...')
    
    try {
      const options = {
        value: parseEther(amount.toFixed(18)),
      }
      const tx = await commissionFactory.vote(entry?.author?.id, options)
      toast.info('submitting your vote...')

      await tx.wait()

      toast.success('vote contributed successfully')
      setAmount(0)
      setFormOpen(false)
      onSuccess()
    } catch (err) {
      toast.dismiss()
      if (err.code === 4001) toast.error('user rejected in metamask')
      else toast.error('vote failed')
    }
    setProcessing(false)
  }

  return (
    <div>
      {formOpen ? (
        <form onSubmit={handleSubmit}>
          <p>VOTE FORM</p>
          <input type="number" step="any" min="0" onChange={handleAmount} value={amount} />
          <button type="submit">submit</button>
        </form>
      ) : (
        <button onClick={() => setFormOpen(true)}>VOTE</button>
      )}
    </div>
  )
}

export default VoteForm
