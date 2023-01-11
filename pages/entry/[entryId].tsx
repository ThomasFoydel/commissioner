import Link from 'next/link'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import { H, Level } from 'react-accessible-headings'
import InterplanetaryContent from '../../components/InterplanetaryContent'
import DynamicTypeOut from '../../components/DynamicTypeOut'
import LoadingDots from '../../components/LoadingDots'
import { entryDetails } from '../../apollo/queries'
import VoteForm from '../../components/VoteForm'
import TypeOut from '../../components/TypeOut'
import { truncate } from '../../utils'
import Layout from '../layouts/CRT'

const EntryDetails = () => {
  const { account } = useEthers()
  const router = useRouter()
  const entryId = String(router.query.entryId).toLowerCase()

  const { data, loading } = useQuery(entryDetails, { variables: { entryId }, pollInterval: 4000 })
  const entry: Entry | undefined = data?.entry

  if (!loading && entry === undefined) return <TypeOut>ENTRY {entryId} NOT FOUND</TypeOut>
  if (entry === undefined) return <LoadingDots />

  const { author, voteAmount, commission, ipfsPath, timestamp, contributions } = entry

  const userCanVote = account && account.toLowerCase() !== entry.author.id && commission.active

  return (
    <div className="m-2 p-2 crt-border rounded-sm">
      <H>
        <TypeOut>ENTRY {truncate(entryId)}</TypeOut>
      </H>

      <Level>
        <Link href={`/user/${author.id}`}>
          <a>
            <TypeOut>
              {`AUTHOR ${truncate(author.id)}${
                account && account.toLowerCase() === author.id ? ' (YOU)' : ''
              }`}
            </TypeOut>
          </a>
        </Link>
        <TypeOut>SUBMITTED {new Date(+timestamp * 1000).toLocaleString()}</TypeOut>
        <DynamicTypeOut>VOTES {voteAmount}</DynamicTypeOut>
        <Link href={`/commission/${commission.id}`}>
          <a>
            <TypeOut>COMMISSION PROMPT</TypeOut>
            <InterplanetaryContent path={commission.prompt} maxChars={1500} />
          </a>
        </Link>
        <div>
          <TypeOut>CONTENT</TypeOut>
          <InterplanetaryContent path={ipfsPath} maxChars={3000} />
          <a
            className="button text-center mt-2 block center px-0 w-full sm:w-[200px]"
            style={{ textShadow: 'none' }}
            href={`http://ipfs.io/ipfs/${ipfsPath}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            VIEW ON IPFS
          </a>
        </div>

        {userCanVote && <VoteForm entry={entry} commission={commission} />}

        {contributions &&
          contributions.map((contribution) => (
            <Contribution key={contribution.id} contribution={contribution} />
          ))}
      </Level>
    </div>
  )
}

const Contribution = ({ contribution }: { contribution: Contribution }) => (
  <Link href={`/contribution/${contribution.id}`}>
    <a>
      <div className="m-2 p-2 crt-border rounded-sm">
        <H>
          <TypeOut>CONTRIBUTOR {contribution.vote.voter.id}</TypeOut>
        </H>
        <Level>
          <TypeOut>TOTAL {contribution.total}</TypeOut>
        </Level>
      </div>
    </a>
  </Link>
)

EntryDetails.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default EntryDetails
