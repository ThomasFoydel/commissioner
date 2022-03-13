const factoryAddress = '0x3Af95936d052BC46a565792F6B1830F4063d8BA6'

export const config = { factoryAddress }

const chains = {
  1: {
    factoryAddress: '0x3Af95936d052BC46a565792F6B1830F4063d8BA6', // ropsten address, need to replace
  },
  3: {
    factoryAddress: '0x3Af95936d052BC46a565792F6B1830F4063d8BA6',
  },
}
const getConfig = (chainId: number) => {
  const id = chainId || 1
  const chainConfig = chains[id as keyof typeof chains]
  return chainConfig
}

export default getConfig
