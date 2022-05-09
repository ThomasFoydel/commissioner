import { useEthers } from "@usedapp/core"
import { Contract } from "ethers"
import { Interface } from "ethers/lib/utils"
import React, { useState } from "react"
import { H, Level } from "react-accessible-headings"
import commissionABI from "../../ethers/ABIs/commissionABI.json"
import { ErrorResponse } from "../../utils/interfaces"
import TextUpload from "../../components/TextUpload"

interface entryFormProps {
    id: string
}
const EntryForm = (props: entryFormProps) => {
    const [path, setPath] = useState("")
    const [processing, setProcessing] = useState(false)
    const [complete, setComplete] = useState(false)
    const [error, setError] = useState("")
    const [txHash, setTxHash] = useState("")
    const { account, library } = useEthers()

    const commissionInterface = new Interface(commissionABI)
    const { id } = props
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!library || !account || !path || processing || complete) return
        setError("")
        try {
            const signer = library.getSigner(String(account))
            const commissionContract = new Contract(id, commissionInterface, signer)
            const tx = await commissionContract.submitEntry(path)
            if (tx) {
                setProcessing(true)
                setTxHash(tx.hash)
            }
            const receipt = await tx.wait()
            if (receipt) setComplete(true)
        } catch (err) {
            if (err instanceof ErrorResponse && err.code === 4001) {
                return
            }
            setError("Transaction failed!")
        }
        setProcessing(false)
    }

    return (
        <div className="w-100">
            <div className="w-50 center bg-card">
                <TextUpload setPath={setPath} label="Upload Entry:" />
                {path && (
                    <p>
                        IPFS Path:{" "}
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
                        <button
                            className={`button ${(!path || processing) && "disabled"}`}
                            type="submit"
                        >
                            Create Entry
                        </button>
                    </form>
                </div>
                {(processing || complete) && (
                    <p>complete: {complete ? "Submission complete!" : "Processing..."}</p>
                )}
                {error && <p>error: {error}</p>}
                {txHash && <p>txHash: {txHash}</p>}
            </div>
        </div>
    )
}

export default EntryForm
