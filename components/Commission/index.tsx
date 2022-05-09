import React from "react"
import { H, Level } from "react-accessible-headings"
import { iCommission } from "../../utils/interfaces"
import Link from "next/link"
import InterplanetaryContent from "../InterplanetaryContent"
import { truncate } from "../../utils"
import { formatEther } from "ethers/lib/utils"
interface props {
    commission: iCommission
}

const Commission = (props: props) => {
    const { commission } = props
    const { id, prompt, entryCount, commissioner, winningAuthor, reward, timestamp } = commission
    const commissionerId = commissioner?.id
    return (
        <div className="card text-skin-muted m-4">
            <H>
                <Link href={`/commission/${id}`}>
                    <p className="text-2xl  opacity-80">
                        commission {truncate(String(id))}
                    </p>
                </Link>
            </H>
            <Level>
                <Link href={`/user/${commissionerId}`}>
                    <p>commissioner: {truncate(String(commissionerId))}</p>
                </Link>
                <p>
                    prompt:{" "}
                    <span className="text-skin-base">
                        <InterplanetaryContent path={prompt} />
                    </span>
                </p>
                <p>
                    timestamp:
                    {new Date(Number(timestamp) * 1000).toLocaleTimeString()}{" "}
                    {new Date(Number(timestamp) * 1000).toLocaleDateString()}
                </p>
                <p>reward: {formatEther(reward)} ETH</p>
                <p>entryCount: {entryCount}</p>
                {winningAuthor && (
                    <Link href={`/user/${winningAuthor.id}`}>
                        <p>winningAuthorId: {truncate(String(winningAuthor.id))}</p>
                    </Link>
                )}
            </Level>
        </div>
    )
}

export default Commission
