import type { NextApiRequest, NextApiResponse } from 'next'
import ipfs from '../../utils/ipfs/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { text } = req?.body
    if (!text || !text.length) {
      return res.status(400).json({ status: 'error', message: 'content is empty' })
    }
    if (typeof text !== 'string') {
      return res.status(400).json({ status: 'error', message: 'content is invalid' })
    }
    if (text.length > 20_000) {
      return res.status(400).json({ status: 'error', message: 'content is too large' })
    }
    try {
      const { path } = await ipfs.add(text)
      return res
        .status(200)
        .json({ status: 'success', message: 'content uploaded to ipfs successfully', path })
    } catch (err) {
      return res.status(500).json({ status: 'error', message: 'ipfs upload failed' })
    }
  }

  return res.status(400).json({ status: 'error', message: 'method not supported' })
}
