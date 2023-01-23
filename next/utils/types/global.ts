import { EntryType, CommissionType, UserType, VoteType, ContributionType } from './commission'

// Global declaration "namespaces will be included if necessary"
declare global {
  interface Entry extends EntryType {}
  interface Commission extends CommissionType {}
  interface Contribution extends ContributionType {}
  interface User extends UserType {}
  interface Vote extends VoteType {}
}

export {}
