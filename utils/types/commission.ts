export interface UserType {
  id: string
  commissions: [CommissionType]
  ownEntries: [EntryType]
  entriesMade: string
  commissionsCreated: string
  commissionsCompleted: string
  commissionsCancelled: string
  commissionsWon: string
  votesEarned: string
  votesClaimed: string
  votesCast: string
  tipsEarned: string
  valueContributed: string
}

export interface VoteType {
  id: string
  contributions: [ContributionType]
  voter: UserType
  commission: CommissionType
}

export interface ContributionType {
  id: string
  transactionHashes: [string]
  author: UserType
  entry: EntryType
  total: string
  vote: VoteType
}

export interface EntryType {
  id: string
  contributions: [ContributionType]
  author: UserType
  voteAmount: string
  commission: CommissionType
  ipfsPath: string
  content: string
  timestamp: string
}

export interface CommissionType {
  id: string
  submittedEntries: [EntryType]
  commissioner: UserType
  winningAuthor: UserType | null
  entryCount: number
  prompt: string
  content: string
  reward: string
  timestamp: string
  minTime: string
  active: boolean
}
