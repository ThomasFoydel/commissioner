const factoryAddress = '0x3745E372055eF5E0266B850B6bd414C15fA5f3f0'

export const config = { factoryAddress }

const chains = {
  1: {
    factoryAddress: '0x3745E372055eF5E0266B850B6bd414C15fA5f3f0', // goerli address, need to replace
  },
  5: {
    factoryAddress: '0x3745E372055eF5E0266B850B6bd414C15fA5f3f0',
  },
}
const getConfig = (chainId: number) => {
  const id = chainId || 1
  const chainConfig = chains[id as keyof typeof chains]
  return chainConfig || chains[0]
}

export default getConfig
