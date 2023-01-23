import { Terminal } from 'crt-terminal'
import { aboutMessage, manualMessage } from '../../../utils/terminal/messages'
import { line } from '../../../utils/terminal'

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
    displayCommissionDetailsById,
    displayUserCommissions,
    addReward,
    tipWinner,
    tipCommissioner,
    viewEntryAuthor,
  },
}) => (
  <div style={{ width: '100vw', height: 'calc(100vh - 30px)' }}>
    <Terminal
      effects={{ screenEffects: false, scanner: false, textEffects: false }}
      queue={eventQueue}
      banner={[line(bannerText)]}
      onCommand={async (command) => {
        const lcCommand = command.toLowerCase().trim()
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
            `${field} state value: ` +
              String(
                stateVals[field as keyof typeof printLine].id ||
                  stateVals[field as keyof typeof printLine]
              )
          )
        }
        if (lcCommand === 'clear' || lcCommand === 'c') return clear()

        if (lcCommand === 'current page') return printLine(page)

        if (lcCommand === 'commissions') {
          return commissionsPage()
        }

        if (lcCommand === 'view commissioner') {
          return displayUserProfile(stateVals.selectedCommission.commissioner.id)
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

        if (lcCommand === 'create entry' && (page === 'details' || page === 'entries')) {
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
        if (page === 'entry-details') {
          if (lcCommand === 'vote') {
            return startVote()
          }
          if (lcCommand === 'view author') {
            return viewEntryAuthor()
          }
        }
        if (page === 'vote-input') {
          return voteAmountInput(command)
        }
        if (page === 'vote') {
          return confirmVoteInput(lcCommand)
        }
        /* COMMISSIONS PAGE  COMMISSIONS PAGE  COMMISSIONS PAGE  COMMISSIONS PAGE  COMMISSIONS PAGE */
        if (page === 'commissions' || page === 'user-commissions') {
          if (lcCommand.startsWith('sort')) {
            return sortCommissions(command)
          }
          if (lcCommand.startsWith('direction')) {
            const direction = command.split('direction ')[1]?.trim()
            return commissionsDirection(direction)
          }
          if (lcCommand.startsWith('next')) {
            return commissionsNext()
          }
          if (lcCommand.startsWith('back')) {
            return commissionsBack()
          }
          if (lcCommand.startsWith('page')) {
            const pageNumber = Number(lcCommand.split('page ')[1]) - 1
            return commissionsPageSelect(pageNumber)
          }
          if (lcCommand.startsWith('details')) {
            const index = Number(lcCommand.split(' ')[1])
            return commissionDetails(index)
          }
        }
        /* COMMISSION DETAILS PAGE  COMMISSION DETAILS PAGE  COMMISSION DETAILS PAGE */
        if (page === 'details') {
          if (lcCommand.startsWith('cancel')) {
            return cancelCommission()
          }
          if (lcCommand.startsWith('select winner')) {
            return chooseWinner()
          }
          if (lcCommand.startsWith('add reward')) {
            printLine('enter amount (in ETH)')
            return setPage('add-reward')
          }
          if (lcCommand.startsWith('tip winner')) {
            printLine('enter amount (in ETH)')
            return setPage('tip-winner')
          }
          if (lcCommand.startsWith('tip commissioner')) {
            printLine('enter amount (in ETH)')
            return setPage('tip-commissioner')
          }
        }
        if (page === 'add-reward') {
          return addReward(lcCommand)
        }
        if (page === 'tip-winner') {
          return tipWinner(lcCommand)
        }
        if (page === 'tip-commissioner') {
          return tipCommissioner(lcCommand)
        }
        /* ENTRIES PAGE  ENTRIES PAGE  ENTRIES PAGE  ENTRIES PAGE  ENTRIES PAGE */
        if (page === 'entries' || page === 'user entries') {
          if (lcCommand.startsWith('sort')) {
            const field = command.split('sort ')[1]
            return entriesSort(field)
          }
          if (lcCommand.startsWith('direction')) {
            const direction = command.split('direction ')[1]
            return entriesDirection(direction)
          }
          if (lcCommand.startsWith('next')) {
            return entriesNextPage()
          }
          if (lcCommand.startsWith('back')) {
            return entriesBackPage()
          }
          if (lcCommand.startsWith('page')) {
            const pageNumber = Number(lcCommand.split('page ')[1]) - 1
            return entriesPageSelect(pageNumber)
          }
        }

        if (page === 'profile') {
          if (lcCommand === 'user commissions') {
            return displayUserCommissions(stateVals.selectedUser)
          }

          if (lcCommand.includes('user entries')) {
            return viewEntries()
          }
        }

        if (lcCommand.startsWith('profile')) {
          setPage('profile')
          const id = command.split(' ')[1]
          return displayUserProfile(id)
        }

        if (lcCommand === 'about') {
          return printLine(aboutMessage)
        }

        if (lcCommand === 'man') {
          return printLine(manualMessage)
        }

        if (lcCommand.startsWith('commission ')) {
          clear()
          const id = command.split(' ')[1]
          return displayCommissionDetailsById(id)
        }

        printLine(`command "${command}" not recognized`)
      }}
    />
  </div>
)
export default Display
