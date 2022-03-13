const Factory = artifacts.require('Factory')
const Commission = artifacts.require('Commission')
const { advanceBySeconds, fiveDays } = require('./helpers')

const advanceFiveDays = async () => {
  await advanceBySeconds(fiveDays)
}

contract('Commission', ([owner, account1, account2, account3, account4, account5, account6]) => {
  let factory
  let commission
  const ipfsPath = '12341234someIpfsPathHere'

  beforeEach(async () => {
    factory = await Factory.deployed()
    await factory.createCommission('Why is a raven like a writing desk?', fiveDays, {
      from: account1,
    })
    const commissionCount = await factory.commissionCount()
    const commissionAddress = await factory.deployedCommissions(commissionCount - 1)
    commission = await Commission.at(commissionAddress)
  })

  it('Should count number of entries', async () => {
    const firstEntryCount = await commission.entryCount()
    await commission.submitEntry(ipfsPath)
    const secondEntryCount = await commission.entryCount()
    assert(secondEntryCount.toNumber() - firstEntryCount.toNumber() === 1)
  })

  it('Should create entry with correct ipfs path', async () => {
    await commission.submitEntry(ipfsPath)
    const entryCount = await commission.entryCount()
    const entry = await commission.entries(entryCount - 1)
    assert(entry.ipfsPath === ipfsPath)
  })

  it('Should record commissioner', async () => {
    const commissioner = await commission.commissioner()
    assert(commissioner === account1)
  })

  it('Should not allow two entries by same author', async () => {
    await commission.submitEntry(ipfsPath, { from: account2 })
    let blocked
    try {
      await commission.submitEntry(ipfsPath, { from: account2 })
      blocked = false
    } catch (err) {
      blocked = true
    }
    assert(blocked)
  })

  it('Should not allow entries by the commissioner', async () => {
    let blocked
    try {
      await commission.submitEntry(ipfsPath, { from: account1 })
      blocked = false
    } catch (err) {
      blocked = true
    }
    assert(blocked)
  })

  it('Should allow voting on entries', async () => {
    const voteAmount = '1000000'
    await commission.submitEntry(ipfsPath)
    const entryCount = await commission.entryCount()
    const entry = await commission.entries(entryCount - 1)
    await commission.vote(entry.author, {
      from: account2,
      value: voteAmount,
    })
    const vote = await commission.votes(entry.author)
    assert(vote.toString() === voteAmount)
  })

  it('Should not allow an entry to be voted on by its author', async () => {
    await commission.submitEntry(ipfsPath, { from: account2 })
    const entryCount = await commission.entryCount()
    const entry = await commission.entries(entryCount - 1)
    let blocked
    try {
      await commission.vote(entry.author, {
        from: account2,
        value: voteAmount,
      })
      blocked = false
    } catch (err) {
      blocked = true
    }
    assert(blocked)
  })

  it('Should return correct forerunner author', async () => {
    await commission.submitEntry(ipfsPath, { from: account2 })
    const entryCount1 = await commission.entryCount()
    const entry1 = await commission.entries(entryCount1 - 1)

    await commission.submitEntry(ipfsPath, { from: account3 })
    const entryCount2 = await commission.entryCount()
    const entry2 = await commission.entries(entryCount2 - 1)

    await commission.vote(entry1.author, {
      from: account4,
      value: '10000000000',
    })
    const firstForerunner = await commission.getForerunner()
    await commission.vote(entry2.author, {
      from: account5,
      value: '100000000000',
    })
    const secondForerunner = await commission.getForerunner()
    await commission.vote(entry1.author, {
      from: account6,
      value: '100000000000',
    })
    const thirdForerunner = await commission.getForerunner()

    assert(firstForerunner === entry1.author)
    assert(secondForerunner === entry2.author)
    assert(thirdForerunner === entry1.author)
  })

  it('Should throw an error if getForerunner attempted before a vote', async () => {
    let blocked
    try {
      await commission.getForerunner()
      blocked = false
    } catch (err) {
      if (err) blocked = true
    }
    assert(blocked)
  })

  it('Should not allow entries when winner already selected', async () => {
    await commission.submitEntry(ipfsPath, { from: account2 })
    const entryCount = await commission.entryCount()
    const entry = await commission.entries(entryCount - 1)
    await commission.vote(entry.author, {
      from: account4,
      value: '10000000000',
    })
    await advanceFiveDays()
    await commission.chooseWinner({ from: account1 })
    let blocked
    try {
      await commission.submitEntry(ipfsPath, { from: account2 })
      blocked = false
    } catch (err) {
      if (err) blocked = true
    }
    assert(blocked)
  })

  it('Should not allow voting when winner already selected', async () => {
    await commission.submitEntry(ipfsPath, { from: account2 })
    const entryCount = await commission.entryCount()
    const entry = await commission.entries(entryCount - 1)
    await commission.vote(entry.author, {
      from: account4,
      value: '10000000000',
    })
    await advanceFiveDays()
    await commission.chooseWinner({ from: account1 })
    let blocked
    try {
      await commission.vote(entry.author, {
        from: account4,
        value: '10000000000',
      })
      blocked = false
    } catch (err) {
      if (err) blocked = true
    }
    assert(blocked)
  })

  it('Should record whether the commission is active', async () => {
    const active1 = await commission.active()
    await commission.submitEntry(ipfsPath, { from: account2 })
    const entryCount = await commission.entryCount()
    const entry = await commission.entries(entryCount - 1)
    await commission.vote(entry.author, {
      from: account4,
      value: '10000000000',
    })
    await advanceFiveDays()
    await commission.chooseWinner({ from: account1 })
    const active2 = await commission.active()
    assert(active1 === true)
    assert(active2 === false)
  })

  it('Should record the correct winner address', async () => {
    await commission.submitEntry(ipfsPath, { from: account2 })
    const entryCount = await commission.entryCount()
    const entry = await commission.entries(entryCount - 1)
    await commission.vote(entry.author, {
      from: account4,
      value: '10000000000',
    })
    await advanceFiveDays()
    await commission.chooseWinner({ from: account1 })
    const winner = await commission.getWinningAuthor()
    assert(winner === account2)
  })

  it('Should block non-commissioner users from choosing winner', async () => {
    await commission.submitEntry(ipfsPath, { from: account2 })
    const entryCount = await commission.entryCount()
    const entry = await commission.entries(entryCount - 1)
    await commission.vote(entry.author, {
      from: account4,
      value: '10000000000',
    })
    let blocked
    await advanceFiveDays()
    try {
      await commission.chooseWinner({ from: account2 })
      blocked = false
    } catch (err) {
      if (err) blocked = true
    }
    assert(blocked)
  })

  it('Should only allow winner to be chosen once', async () => {
    await commission.submitEntry(ipfsPath, { from: account2 })
    const entryCount1 = await commission.entryCount()
    const entry1 = await commission.entries(entryCount1 - 1)
    await commission.vote(entry1.author, {
      from: account4,
      value: '10000000000',
    })
    await advanceFiveDays()
    await commission.chooseWinner({ from: account1 })
    let blocked
    try {
      await commission.chooseWinner({ from: account1 })
      blocked = false
    } catch (err) {
      if (err) blocked = true
    }
    assert(blocked)
  })

  it('Should return an error if getWinningAuthor attempted before winner is selected', async () => {
    let blocked
    try {
      await commission.getWinningAuthor()
      blocked = false
    } catch ({ data }) {
      const keys = Object.keys(data)
      blocked = true
      assert(data[keys[0]].reason.length > 0)
    }
    assert(blocked)
  })

  it('Should allow commissioner to cancel if no entries have been made', async () => {
    const active1 = await commission.active()
    const result = await commission.cancel({ from: account1 })
    const active2 = await commission.active()
    const winningAuthor = await commission.getWinningAuthor()
    assert(active1)
    assert(!active2)
    assert(result.tx)
    assert(result.receipt.transactionHash)
    assert(winningAuthor === '0x0000000000000000000000000000000000000000')
  })

  it('Should block non-commissioner users from cancelling', async () => {
    let blocked
    try {
      const result = await commission.cancel({ from: account2 })
      blocked = false
    } catch (err) {
      if (err) blocked = true
    }
    assert(blocked)
  })

  it('Should block commissioner from cancelling if entries have been made', async () => {
    await commission.submitEntry(ipfsPath, { from: account2 })
    let blocked
    try {
      const result = await commission.cancel({ from: account1 })
      blocked = false
    } catch (err) {
      if (err) blocked = true
    }
    assert(blocked)
  })

  it('Should record deposits to reward', async () => {
    const rewardIncreaseAmount = '1000000000'
    await commission.submitEntry(ipfsPath, { from: account2 })
    await commission.addReward({
      from: account4,
      value: rewardIncreaseAmount,
    })
    const reward = await commission.reward()
    assert(reward.toString() === rewardIncreaseAmount)
  })

  it('Should payout 90% of reward to winning author', async () => {
    const initialReward = '10000000000000000'
    const voteAmount = '100000000000'

    await commission.addReward({ from: account4, value: initialReward })
    await commission.submitEntry(ipfsPath, { from: account2 })

    const entryCount = await commission.entryCount()
    const entry = await commission.entries(entryCount - 1)
    await commission.vote(entry.author, {
      from: account3,
      value: voteAmount,
    })

    const balancePriorToWin = await web3.eth.getBalance(entry.author)
    await advanceFiveDays()
    await commission.chooseWinner({ from: account1 })
    const balanceAfterWin = await web3.eth.getBalance(entry.author)
    const actualPayout = parseInt(balanceAfterWin) - parseInt(balancePriorToWin)

    const initialRewardMinusCommissionerPayback =
      parseInt(initialReward) - parseInt(initialReward) / 10
    const totalReward = initialRewardMinusCommissionerPayback + parseInt(voteAmount)
    assert(parseInt(balanceAfterWin) > parseInt(balancePriorToWin))
    assert(Math.abs(totalReward - actualPayout) < 20000)
  })

  it('Should pay back 10% of reward to commissioner to disincentivize abandonment', async () => {
    const initialReward = '10000000000000000'
    const voteAmount = '10000000000000000'

    await commission.addReward({ from: account4, value: initialReward })
    await commission.submitEntry(ipfsPath, { from: account2 })

    const entryCount = await commission.entryCount()
    const entry = await commission.entries(entryCount - 1)
    await commission.vote(entry.author, {
      from: account3,
      value: voteAmount,
    })

    const commissioner = await commission.commissioner()
    const balancePriorToSelection = await web3.eth.getBalance(commissioner)
    const rewardAtTimeOfSelection = await commission.reward()
    const tenPercent = parseInt(rewardAtTimeOfSelection) / 10
    await advanceFiveDays()
    await commission.chooseWinner({ from: account1 })
    const balanceAfterSelection = await web3.eth.getBalance(commissioner)
    const actualPayout = parseInt(balanceAfterSelection) - parseInt(balancePriorToSelection)
    const diff = tenPercent - actualPayout
    const diffDividedByTenPercent = diff / tenPercent
    assert(parseInt(balanceAfterSelection) > parseInt(balancePriorToSelection))
    assert(actualPayout / tenPercent > 0.8)
    assert(diffDividedByTenPercent < 0.2)
  })

  it('Should send refund to commissioner if cancelled', async () => {
    await commission.addReward({
      from: account1,
      value: '10000000000000000',
    })
    const reward = await commission.reward()
    const balance1 = await web3.eth.getBalance(account1)
    await commission.cancel({ from: account1 })
    const balance2 = await web3.eth.getBalance(account1)
    const diff = parseInt(balance2) - parseInt(balance1)
    const changeRateDespiteSlippage = diff / parseInt(reward)
    assert(changeRateDespiteSlippage > 0.99)
  })

  it('Should allow users to tip winning authors', async () => {
    const voteAmount = '10000000000000000'
    const tipAmount = '10000000000000000'
    await commission.submitEntry(ipfsPath, { from: account2 })
    const entryCount = await commission.entryCount()
    const entry = await commission.entries(entryCount - 1)
    await commission.vote(entry.author, {
      from: account3,
      value: voteAmount,
    })
    await advanceFiveDays()
    await commission.chooseWinner({ from: account1 })
    const winner = await commission.getWinningAuthor()
    const balance1 = await web3.eth.getBalance(winner)
    await commission.tipWinner({ from: account3, value: tipAmount })
    const balance2 = await web3.eth.getBalance(winner)
    const diff = parseInt(balance2) - parseInt(balance1)
    const changeRateDespiteSlippage = diff / tipAmount
    assert(changeRateDespiteSlippage > 0.99)
  })

  it('Should allow non-winning authors to claim the votes they got', async () => {
    const winningVoteAmount = '50000000000000000'
    const losingVoteAmount = '10000000000000000'
    await commission.submitEntry(ipfsPath, { from: account2 })
    const entryCount1 = await commission.entryCount()
    const entry1 = await commission.entries(entryCount1 - 1)
    await commission.submitEntry(ipfsPath, { from: account3 })
    const entryCount2 = await commission.entryCount()
    const entry2 = await commission.entries(entryCount2 - 1)
    await commission.vote(entry1.author, {
      from: account4,
      value: winningVoteAmount,
    })
    await commission.vote(entry2.author, {
      from: account5,
      value: losingVoteAmount,
    })
    await advanceFiveDays()
    await commission.chooseWinner({ from: account1 })
    const balance1 = await web3.eth.getBalance(entry2.author)
    await commission.claimReward({ from: entry2.author })
    const balance2 = await web3.eth.getBalance(entry2.author)
    const balanceDifference = parseInt(balance2) - parseInt(balance1)
    const changeRateDespiteSlippage = balanceDifference / losingVoteAmount
    assert(changeRateDespiteSlippage > 0.99)
  })

  it('Should emit a new event with correct data when vote submitted', async () => {
    const voteAmount = '10000000000000000'
    const authorAccount = account2
    const voterAccount = account3
    await commission.submitEntry(ipfsPath, { from: authorAccount })
    const entryCount = await commission.entryCount()
    const entry = await commission.entries(entryCount - 1)
    const events1 = await factory.getPastEvents('VoteSubmitted')
    await commission.vote(entry.author, {
      from: voterAccount,
      value: voteAmount,
    })
    const events2 = await factory.getPastEvents('VoteSubmitted')
    const lengthDifference = events2.length - events1.length
    const mostRecentVoteEvent = events2[events2.length - 1]
    assert(lengthDifference === 1)
    assert(mostRecentVoteEvent.returnValues.author === authorAccount)
    assert(mostRecentVoteEvent.returnValues.voter === voterAccount)
    assert(mostRecentVoteEvent.returnValues.commission === commission.contract.options.address)
    assert(mostRecentVoteEvent.returnValues.amount === voteAmount)
  })
})
