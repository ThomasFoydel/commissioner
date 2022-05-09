import { Terminal } from 'crt-terminal'
import { line } from '../utils'

const Display = ({
  props: {
    eventQueue,
    homePage,
    printLine,
    returnToPreviousPage,
    page,
    printState,
    stateVals,
    clear,
    commissionsPage,
    commissionDetails,
    setPage,
    setPromptPath,
    loading,
    handleReward,
    handleMinTime,
    handleCommissionInput,
    createEntryPage,
    setEntryPath,
    confirmEntry,
    viewEntries,
    entryDetails,
    startVote,
    voteAmountInput,
    confirmVoteInput,
    sortCommissions,
    commissionsDirection,
    commissionsNext,
    commissionsBack,
    commissionsPageSelect,
    cancelCommission,
    chooseWinner,
    entriesSort,
    entriesDirection,
    entriesNextPage,
    entriesBackPage,
    entriesPageSelect,
    displayUserProfile,
    bannerText,
    commands,
    handleIPFSInput,
    handleEntryIpfs,
  },
}) => (
  <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
    <Terminal
      effects={{ screenEffects: false, scanner: false, textEffects: false }}
      queue={eventQueue}
      banner={[line(bannerText)]}
      onCommand={async (command) => {
        const lcCommand = command.toLowerCase()
        if (lcCommand === 'home') {
          return homePage()
        }
        if (lcCommand === 'commands' || lcCommand === 'help') {
          return printLine(`${page} page commands: ${commands[page as keyof typeof commands]}`)
        }
        if (lcCommand === 'return') {
          return returnToPreviousPage()
        }
        if (lcCommand.startsWith('state')) {
          const field = command.split('state ')[1]
          if (!field) return printLine('invalid state field')
          if (field === 'all') return printState()
          return printLine(
            `${field} state value: ` + String(stateVals[field as keyof typeof printLine])
          )
        }
        if (lcCommand === 'clear' || lcCommand === 'c') return clear()

        if (lcCommand === 'current page') return printLine(page)

        if (lcCommand === 'commissions') {
          return commissionsPage()
        }

        if (lcCommand.startsWith('details') && page === 'commissions') {
          const index = Number(lcCommand.split(' ')[1])
          return commissionDetails(index)
        }

        if (lcCommand === 'create') {
          setPage('input-prompt')
          return printLine('to create a new commission, enter content:')
        }

        if (page === 'input-prompt') {
          const proceed = await handleIPFSInput(command, printLine, setPromptPath, loading)
          if (proceed) setPage('input-reward')
          return
        }

        if (page === 'input-reward') {
          return handleReward(command)
        }

        if (page === 'input-mintime') {
          return handleMinTime(command)
        }

        if (page === 'create-commission') {
          return handleCommissionInput(command)
        }

        if (lcCommand === 'create-entry' && (page === 'details' || page === 'entries')) {
          return createEntryPage()
        }

        if (page === 'input-entry') {
          const proceed = await handleEntryIpfs(command, setEntryPath, loading, printLine)
          if (proceed) setPage('confirm-entry')
          return
        }

        if (page === 'confirm-entry') {
          return confirmEntry(command)
        }

        if (lcCommand.includes('view entries') && page === 'details') {
          return viewEntries()
        }

        if (lcCommand.includes('entry details')) {
          return entryDetails(lcCommand)
        }
        if (lcCommand === 'vote') {
          return startVote()
        }
        if (page === 'vote-input') {
          return voteAmountInput(command)
        }
        if (page === 'vote') {
          return confirmVoteInput(lcCommand)
        }
        /* COMMISSIONS PAGE  COMMISSIONS PAGE  COMMISSIONS PAGE  COMMISSIONS PAGE  COMMISSIONS PAGE */
        /* COMMISSIONS PAGE  COMMISSIONS PAGE  COMMISSIONS PAGE  COMMISSIONS PAGE  COMMISSIONS PAGE */
        if (page === 'commissions' && lcCommand.startsWith('sort')) {
          return sortCommissions(command)
        }
        if (page === 'commissions' && lcCommand.startsWith('direction')) {
          const direction = command.split('direction ')[1]?.trim()
          return commissionsDirection(direction)
        }
        if (page === 'commissions' && lcCommand.startsWith('next')) {
          return commissionsNext()
        }
        if (page === 'commissions' && lcCommand.startsWith('back')) {
          return commissionsBack()
        }
        if (page === 'commissions' && lcCommand.startsWith('page')) {
          const pageNumber = Number(lcCommand.split('page ')[1]) - 1
          return commissionsPageSelect(pageNumber)
        }
        /* COMMISSION DETAILS PAGE  COMMISSION DETAILS PAGE  COMMISSION DETAILS PAGE */
        /* COMMISSION DETAILS PAGE  COMMISSION DETAILS PAGE  COMMISSION DETAILS PAGE */

        if (page === 'details' && lcCommand.startsWith('cancel')) {
          return cancelCommission()
        }
        if (page === 'details' && lcCommand.startsWith('select winner')) {
          return chooseWinner()
        }
        /* ENTRIES PAGE  ENTRIES PAGE  ENTRIES PAGE  ENTRIES PAGE  ENTRIES PAGE */
        /* ENTRIES PAGE  ENTRIES PAGE  ENTRIES PAGE  ENTRIES PAGE  ENTRIES PAGE */
        if (page === 'entries' && lcCommand.startsWith('sort')) {
          const field = command.split('sort ')[1]
          return entriesSort(field)
        }
        if (page === 'entries' && lcCommand.startsWith('direction')) {
          const direction = command.split('direction ')[1]
          return entriesDirection(direction)
        }
        if (page === 'entries' && lcCommand.startsWith('next')) {
          return entriesNextPage()
        }
        if (page === 'entries' && lcCommand.startsWith('back')) {
          return entriesBackPage()
        }
        if (page === 'entries' && lcCommand.startsWith('page')) {
          const pageNumber = Number(lcCommand.split('page ')[1]) - 1
          return entriesPageSelect(pageNumber)
        }
        if (lcCommand.startsWith('profile')) {
          setPage('profile')
          const id = command.split(' ')[1]
          return displayUserProfile(id)
        }

        printLine(`command "${command}" not recognized`)
      }}
    />
  </div>
)
export default Display
