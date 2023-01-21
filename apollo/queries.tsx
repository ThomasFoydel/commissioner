import { gql } from '@apollo/client'

// votes field on submittedEntries is [Contribution]
const comFields = `
    id
    commissioner {
        id
    }
    canBeCancelled
    submittedEntries {
        id
        author {
            id
        }
        voteAmount
        ipfsPath
        timestamp
    }
    entryCount
    prompt
    winningAuthor {
        id
    }
    reward
    timestamp
    minTime
    active
`

export const userProfileFields = `
    id
    commissions {
        submittedEntries @Entry {
            id
            author {
                id
            }
            voteAmount
        }
        winningAuthor {
            id
        }
        id
        entryCount
        prompt
        reward
        timestamp
    }
    ownEntries {
        id
        ipfsPath
        voteAmount
        commission {
            id
            reward
            prompt
        }
    }
    entriesMade 
    commissionsCreated
    commissionsCompleted
    commissionsCancelled
    commissionsWon
    votesEarned
    votesCast
    tipsEarned 
    valueContributed
`

export const entryFields = `
    id
    ipfsPath
    voteAmount
    voteAmount
    timestamp
    commission {
        prompt
        id
        active
    }
    author {
        id
    }
    contributions {
        id
        transactionHashes
        total
        author {
            id
        }
        vote {
            id
            voter {
                id
            }
        }
    }
`

export const comDetails = gql`
    query getComDetail($comId: String!) {
        commission(id: $comId) {
            ${comFields}
        }
    }
`

export const commmissionWithoutEntries = gql`
  query getComDetail($comId: String!) {
    commission(id: $comId) {
      id
      commissioner {
        id
      }
      canBeCancelled
      entryCount
      prompt
      winningAuthor {
        id
      }
      reward
      timestamp
      minTime
      active
    }
  }
`

export const userProfileQuery = gql`
    query getUserDetails($id: String!) {
        user(id: $id) {
            ${userProfileFields}
        }
    }
`

export const userVotesQuery = gql`
  query getUserVotes($userId: String!) {
    votes(where: { voter: $userId }) {
      contributions {
        id
        author {
          id
        }
        entry {
          id
          ipfsPath
        }
        total
      }
      id
      commission {
        id
        prompt
        commissioner {
          id
        }
      }
    }
  }
`

export const entryDetails = gql`
  query getEntryDetails($entryId: String!) {
    entry(id: $entryId) {
      ${entryFields}
    }
  }
`

export const contributionDetails = gql`
  query getContributionDetails($contributionId: String!) {
    contribution(id: $contributionId) {
      id
      transactionHashes
      author {
        id
      }
      entry {
        id
        ipfsPath
      }
      total
      vote {
        id
        voter {
          id
        }
        commission {
          id
          prompt
        }
      }
    }
  }
`

export const makeCommissionByUserQuery = (
  order: string,
  direction: string,
  page: number,
  perPage: number
) => {
  const noOrder = order === 'none'
  const orderField = order === 'created' ? 'timestamp' : order
  const orderText = noOrder ? '' : `orderBy: ${orderField}, orderDirection: ${direction},`
  const paginationText = `skip: ${perPage * page}, first: ${perPage}`
  const args = `(where: { commissioner: $userId }, ${orderText}${paginationText})`
  return gql`
      query getCommissions($userId: String!) {
        commissions${args} {
          ${comFields}
      }
    }
  `
}

export const makeUserEntriesQuery = (
  order: string,
  direction: string,
  page: number,
  perPage: number
) => {
  const noOrder = order === 'none'
  const orderField = order === 'created' ? 'timestamp' : order
  const orderText = noOrder ? '' : `orderBy: ${orderField}, orderDirection: ${direction},`
  const paginationText = `skip: ${perPage * page}, first: ${perPage}`
  const args = `(where: { author: $userId }, ${orderText}${paginationText})`
  return gql`
    query getUserEntries($userId: String!) {
      entries${args} {
          ${entryFields}
      }
    }
  `
}

export const makeCommissionEntriesQuery = (
  order: string,
  direction: string,
  page: number,
  perPage: number
) => {
  const noOrder = order === 'none'
  const orderField = order === 'created' ? 'timestamp' : order
  const orderText = noOrder ? '' : `orderBy: ${orderField}, orderDirection: ${direction},`
  const paginationText = `skip: ${perPage * page}, first: ${perPage}`
  const args = `(where: { commission: $comId }, ${orderText}${paginationText})`
  return gql`
      query getCommissionEntries($comId: String!) {
        entries${args} {
            ${entryFields}
        }
      }
    `
}
