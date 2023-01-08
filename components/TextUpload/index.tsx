import { toast } from 'react-toastify'
import React, { useState } from 'react'
import { uploadTextToIpfs } from '../../utils/ipfs/client'
import { truncate, truncateContent } from '../../utils'
import TypeOut from '../TypeOut'

const TextUpload = ({ onSuccess, label }: { onSuccess: Function; label: string }) => {
  const [path, setPath] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const uploadText = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || path) return
    toast.info('uploading to ipfs...')
    setLoading(true)
    try {
      const path = await uploadTextToIpfs(text)
      toast.dismiss()
      toast.success('successful upload to ipfs')
      setPath(path)
      onSuccess(path)
    } catch (err) {
      toast.dismiss()
      toast.error('upload to ipfs failed')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={uploadText} className="text-center">
      <div>
        {path ? (
          <>
            <p className="h-[20px]">Uploaded Content:</p>
            <textarea
              value={truncateContent(text)}
              className="p-3 my-3 rounded-[24px] crt-border resize-none h-[150px] w-[80%] focus:outline-inherit"
              style={{
                boxShadow: 'inset 10px 10px 40px #e6fff814, inset -10px -10px 40px #00000094',
                background:
                  'radial-gradient(circle, rgb(60 159 63 / 24%) 0%, rgb(18 98 18 / 13%) 100%)',
              }}
              readOnly
            />
            <a
              className="button block center px-0 w-[210px]"
              href={`http://ipfs.io/ipfs/${path}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TypeOut>
                <span style={{ textShadow: 'none' }}>Path: {truncate(path)}</span>
              </TypeOut>
            </a>
          </>
        ) : (
          <>
            <label className="h-[20px] block">{label}</label>
            <textarea
              value={text}
              className="p-3 my-3 rounded-[24px] crt-border resize-none h-[150px] w-[80%] focus:outline-inherit"
              style={{
                boxShadow: 'inset 10px 10px 40px #e6fff814, inset -10px -10px 40px #00000094',
                background:
                  'radial-gradient(circle, rgb(60 159 63 / 24%) 0%, rgb(18 98 18 / 13%) 100%)',
              }}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              className={`block center button w-[210px] ${(path || loading) && 'disabled'}`}
              type="submit"
            >
              Upload To IPFS
            </button>
          </>
        )}
      </div>
    </form>
  )
}

export default TextUpload
