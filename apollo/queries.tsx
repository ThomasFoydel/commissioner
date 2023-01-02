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
    winningAuthor
    reward
    timestamp
    minTime
    active
`

export const comDetails = gql`
    query getComDetail($comId: String!) {
        commission(id: $comId) {
            ${comFields}
        }
    }
`

export const userProfileFields = `
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

export const userProfileQuery = gql`
        query getUserDetails($id: String!) {
            user(id: $id) {
                ${userProfileFields}
            }
        }
    `
