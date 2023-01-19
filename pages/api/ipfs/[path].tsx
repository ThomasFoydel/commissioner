import type { NextApiRequest, NextApiResponse } from 'next'
import ipfs from '../../../utils/ipfs/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { path } = req.query

    const response = ipfs.cat(String(path))
    let data = []
    for await (const chunk of response) {
      data = [...data, ...chunk]
    }
    const content = Buffer.from(data).toString('utf8')
    return res
      .status(200)
      .json({ status: 'success', message: 'successfully read data from ipfs', content })
  }

  return res.status(400).json({ status: 'error', message: 'method not supported' })
}
