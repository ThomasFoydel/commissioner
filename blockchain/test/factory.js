const { fiveDays } = require("./helpers")

const Factory = artifacts.require('Factory')
const Commission = artifacts.require('Commission')

contract('Factory', ([owner, account1]) => {
  let factory
  beforeEach(async () => {
    factory = await Factory.deployed()
  })

  it('Should deploy factory contract', async () => assert(factory.address))

  it('Should record deployer', async () => {
    const deployer = await factory.deployer()
    assert(deployer === owner)
  })

  it('Should emit new event with correct data when commission created', async () => {
    const commissionerAccount = account1
    const prompt = 'Why is a raven like a writing desk?'
    const events1 = await factory.getPastEvents('CommissionCreated')
    await factory.createCommission(prompt, fiveDays, {
      from: commissionerAccount,
    })
    const events2 = await factory.getPastEvents('CommissionCreated')
    const mostRecentCreationEvent = events2[events2.length - 1]
    assert(events2.length - events1.length === 1)
    assert(mostRecentCreationEvent.returnValues.commissioner === commissionerAccount)
    assert(mostRecentCreationEvent.returnValues.reward === '0')
    assert(mostRecentCreationEvent.returnValues.prompt === prompt)
  })

  it('Should deploy commission child contract', async () => {
    const childContractTx = await factory.createCommission(
      'Why is a raven like a writing desk?',
      fiveDays
    )
    assert(childContractTx.receipt.transactionHash)
  })

  it('Should deploy child contract with correct info', async () => {
    const examplePrompt = 'Why is a raven like a writing desk?'
    await factory.createCommission(examplePrompt, fiveDays)
    const contractCount = await factory.commissionCount()
    const childContractAddress = await factory.deployedCommissions(contractCount - 1)
    const childContract = await Commission.at(childContractAddress)
    const childContractPrompt = await childContract.prompt()
    assert(childContractPrompt === examplePrompt)
  })

  it('Should record the correct number of deployed child contracts', async () => {
    const firstCount = await factory.commissionCount()
    await factory.createCommission('Why is a raven like a writing desk?', fiveDays)
    const secondCount = await factory.commissionCount()
    assert(secondCount.toNumber() - firstCount.toNumber() === 1)
    await factory.createCommission('Really though why is a raven like a writing desk?', fiveDays)
    const thirdCount = await factory.commissionCount()
    assert(thirdCount.toNumber() - secondCount.toNumber() === 1)
  })
})
