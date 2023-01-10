import React from 'react'
import Link from 'next/link'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { contributionDetails } from '../../apollo/queries'
import InterplanetaryContent from '../../components/InterplanetaryContent'
import ExplorerLink from '../../components/ExplorerLink'
import LoadingDots from '../../components/LoadingDots'
import TypeOut from '../../components/TypeOut'
import { truncate } from '../../utils'
import Layout from '../layouts/CRT'

const ContributionDetails = () => {
  const router = useRouter()
  const { contributionId, loading } = router.query
  const res = useQuery(contributionDetails, { variables: { contributionId } })
  const contribution = res?.data?.contribution

  if (contribution === undefined && !loading) {
    return <TypeOut>NO DATA FOUND FOR CONTRIBUTION {contributionId}</TypeOut>
  }
  if (contribution === undefined) return <LoadingDots />

  const { id, author, entry, total, transactionHashes, vote } = contribution

  return (
    <div className="m-2 p-2 crt-border rounded-sm">
      <TypeOut>CONTRIBUTION {truncate(id)}</TypeOut>
      <Link href={`/user/${vote.voter.id}`}>
        <a>
          <TypeOut>CONTRIBUTOR {vote.voter.id}</TypeOut>
        </a>
      </Link>
      <TypeOut>TOTAL {total}</TypeOut>

      <Link href={`/user/${author.id}`}>
        <a>
          <div className="m-2 p-2 crt-border rounded-sm">
            <TypeOut>AUTHOR {author.id}</TypeOut>
            <div>
              <TypeOut>CONTENT</TypeOut>
              <InterplanetaryContent path={entry.ipfsPath} maxChars={1500} />
            </div>
          </div>
        </a>
      </Link>

      <Link href={`/commission/${vote.commission.id}`}>
        <a>
          <div className="m-2 p-2 crt-border rounded-sm">
            <TypeOut>COMMISSION {vote.commission.id}</TypeOut>
            <div>
              <TypeOut>PROMPT</TypeOut>
              <InterplanetaryContent path={vote.commission.prompt} maxChars={3000} />
            </div>
          </div>
        </a>
      </Link>

      <div className="m-2 p-2 crt-border rounded-sm">
        <TypeOut>TRANSACTION HASHES</TypeOut>
        {transactionHashes.map((hash: string) => (
          <ExplorerLink tx={hash} />
        ))}
      </div>
    </div>
  )
}

ContributionDetails.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default ContributionDetails
