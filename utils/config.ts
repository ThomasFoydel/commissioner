const factoryAddress = '0xf825fA580d560817298991523c189fFa4e10A545'

export const config = { factoryAddress }

const chains = {
  1: {
    factoryAddress: '0xf825fA580d560817298991523c189fFa4e10A545', // goerli address, need to replace
  },
  3: {
    factoryAddress: '0xf825fA580d560817298991523c189fFa4e10A545',
  },
}
const getConfig = (chainId: number) => {
  const id = chainId || 1
  const chainConfig = chains[id as keyof typeof chains]
  return chainConfig
}

export default getConfig
