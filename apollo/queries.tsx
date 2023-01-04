import { gql } from '@apollo/client'

// votes field on submittedEntries is [Contribution]
const comFields = `
    id
    commissioner {
        id
    }
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
    }
    author {
        id
    }
    contributions {
        id
        transactionHashes
        total
        vote
    }
`

export const comDetails = gql`
    query getComDetail($comId: String!) {
        commission(id: $comId) {
            ${comFields}
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

export const userCommissionsQuery = gql`
    query getUserComs($userId: String!) {
        commissions(where: {commissioner: $userId}) {
            ${comFields}
        }
    }
`

export const userEntriesQuery = gql`
    query getUserEntries($userId: String!) {
        entries(where: {author: $userId}) {
            ${entryFields}
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
