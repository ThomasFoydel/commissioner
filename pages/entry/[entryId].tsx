import Link from 'next/link'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import { H, Level } from 'react-accessible-headings'
import InterplanetaryContent from '../../components/InterplanetaryContent'
import { entryDetails } from '../../apollo/queries'
import VoteForm from '../../components/VoteForm'
import { truncate } from '../../utils'
import Layout from '../layouts/CRT'

const EntryDetails = () => {
  const { account } = useEthers()
  const router = useRouter()
  const entryId = String(router.query.entryId).toLowerCase()

  const { data, refetch } = useQuery(entryDetails, { variables: { entryId } })
  const entry: Entry | undefined = data?.entry
  if (!entry) return <></>
  const { id, author, voteAmount, commission, ipfsPath, timestamp, contributions } = entry

  const userCanVote = account && account.toLowerCase() !== entry.author.id && commission.active

  return (
    <div className="m-2 p-2 border rounded-sm">
      <H>
        {account === author.id.toLocaleLowerCase() && 'YOUR '}ENTRY {truncate(id)}
      </H>
      <Level>
        <Link href={`/user/${author.id}`}>
          <p>AUTHOR {author.id}</p>
        </Link>
        <p>SUBMITTED {new Date(+timestamp * 1000).toLocaleString()}</p>
        <p>VOTES {voteAmount}</p>
        <Link href={`/commission/${commission.id}`}>
          <p>
            COMMISSION PROMPT <InterplanetaryContent path={commission.prompt} />
          </p>
        </Link>
        <p>
          CONTENT <InterplanetaryContent path={ipfsPath} />
        </p>

        {userCanVote && <VoteForm onSuccess={refetch} entry={entry} commission={commission} />}

        {contributions.map((contribution) => (
          <Contribution key={contribution.id} contribution={contribution} />
        ))}
      </Level>
    </div>
  )
}

const Contribution = ({ contribution }: { contribution: Contribution }) => (
  <div className="m-2 p-2 border rounded-sm">
    <Link href={`/user/${contribution.vote.voter.id}`}>
      <H>CONTRIBUTOR {contribution.vote.voter.id}</H>
    </Link>
    <Level>
      <p>TOTAL {contribution.total}</p>
    </Level>
  </div>
)

EntryDetails.getLayout = function getLayout(page: NextPage) {
  return <Layout>{page}</Layout>
}

export default EntryDetails
