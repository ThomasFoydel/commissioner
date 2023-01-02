import axios from 'axios'

export const uploadTextToIpfs = async (text: string) => {
  const res = await axios.post('/api/ipfs', { text })
  return res?.data?.path
}
