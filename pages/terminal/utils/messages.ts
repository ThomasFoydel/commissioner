export const aboutMessage = `
Commissioner is a decentralized, censorship-resistant platform.
- Commissioner is built with Solidity, TypeScript, React, NextJs, and AssemblyScript.
- It uses IPFS to store commission prompts and entry content.
- Once uploaded to IPFS, the prompt/content cannot be tampered with.
- The IPFS hash for the prompt/content is stored on the blockchain.
- Users may create commissions for written content. 
- The topic can be anything. 
- Subject matter could be journalistic, scientific, political, economic, artistic- anything you can think of.
- Commissions can be created with an initial reward from the commissioner.
- Once created, other users can also contribute to the reward inside the commission if they think the prompt is valuable.
- Users may also submit entries to the commission in hopes of winning.
- Users may also vote for entries the think are valuable.
- When an entry receives votes, the value goes to their wallet address.
- A small percentage is taken from votes and added to the total reward, and another small percentage is taken for the Commissioner system.
- Once the commission is over, the winning entry will be displayed with it, and users can tip the winner.
- When the commission is created, the commissioner sets a minimum number of days on it.
- Once the minimum number of days has been reached, the commissioner can trigger the end of the commission, sending the reward to the entry author with the most votes.
- A commissioner is incentivized to do this by a small kickback they get for paying the gas to trigger the end of the commission.
- After a grace period (two days) where only the commissioner can trigger the ending, any user can call in to trigger the end of the commission if the commissioner hasn't already, in which case that user gets the kickback.
- All of these actions are indexed by the subgraph, and easily queried through graphql.
- Users profiles contain the commissions and entries they have made, the votes they have contributed, the votes they have earned, and the commissions they have won.
`

export const manualMessage = `
You can use commands to navigate around this terminal. Here are some of them:
    - "man" displays this manual message
    - "about" displays a description of Commissioner
    - "clear" clears the terminal screen
    - "commands" and "help" list out the commands currently available to you
    - "state page" shows the page you are currently on
    - "state all" lists out some of the current state values
    - "commissions" displays the commissions page
    - "details [index number]" displays the details for a commission when on the commissions page
    - "sort [field name]" sorts entries or commissions by a specific field
    - "next" and "previous" navigate through pages of commissions or entries
    - "go [page number]" navigates to a specific page
    - "return" returns to the previous page or the home page
    - "home" returns to the home page
    - "create" starts the process of making a new commission
    - "view entries" shows the entries of the selected commission
    - "entry details [index number]" displays details for a specific entry
    - "view commissioner" displays the profile of the selected commission's commissioner
    - "create-entry" starts the process of making a new entry to the selected commission
    - "vote" starts the process of voting for the selected entry
`
