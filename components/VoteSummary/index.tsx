import Link from 'next/link'
import InterplanetaryContent from '../InterplanetaryContent'
import ContributionSummary from '../ContributionSummary'
import { truncate } from '../../utils'

const VoteSummary = ({ vote }: { vote: Vote }) => {
  const { contributions, commission } = vote

  return (
    <div className="m-2 p-2 border rounded-sm">
      <Link href={`/commission/${commission.id}`}>
        <div>
          <p>COMMISSION {truncate(commission.id)}</p>
          <p>
            PROMPT <InterplanetaryContent path={commission.prompt} />
          </p>
        </div>
      </Link>

      {contributions.map((contribution) => (
        <ContributionSummary contribution={contribution} key={contribution.id} />
      ))}
    </div>
  )
}

export default VoteSummary
