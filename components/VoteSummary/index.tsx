import Link from 'next/link'
import InterplanetaryContent from '../InterplanetaryContent'
import ContributionSummary from '../ContributionSummary'
import { truncate } from '../../utils'
import TypeOut from '../TypeOut'

const VoteSummary = ({ vote }: { vote: Vote }) => {
  const { contributions, commission } = vote

  return (
    <div className="m-2 p-2 crt-border rounded-sm">
      <Link href={`/commission/${commission.id}`}>
        <a>
          <div>
            <TypeOut>COMMISSION {truncate(commission.id)}</TypeOut>
            <div>
              <TypeOut>PROMPT</TypeOut>
              <InterplanetaryContent path={commission.prompt} maxChars={100} />
            </div>
          </div>
        </a>
      </Link>

      {contributions.map((contribution) => (
        <ContributionSummary contribution={contribution} key={contribution.id} />
      ))}
    </div>
  )
}

export default VoteSummary
