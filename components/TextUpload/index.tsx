import { toast } from 'react-toastify'
import React, { useState } from 'react'
import { uploadTextToIpfs } from '../../utils/ipfs/client'
import { truncate, truncateContent } from '../../utils'
import TypeOut from '../TypeOut'

const TextUpload = ({ onPathChange, label }: { onPathChange: Function; label: string }) => {
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
      onPathChange(path)
    } catch (err) {
      toast.dismiss()
      toast.error('upload to ipfs failed')
    }
    setLoading(false)
  }

  const reset = () => {
    onPathChange('')
    setPath('')
  }

  return (
    <form onSubmit={uploadText} className="text-center">
      <div className="h-[250px]">
        {path ? (
          <>
            <p className="h-[20px]">Uploaded Content:</p>
            <div className="relative center w-[80%] h-[150px] my-3">
              <textarea
                value={truncateContent(text)}
                className="p-3 rounded-[24px] crt-border resize-none h-[150px] w-full focus:outline-none"
                style={{
                  boxShadow: 'inset 10px 10px 40px #e6fff814, inset -10px -10px 40px #00000094',
                  background:
                    'radial-gradient(circle, rgb(60 159 63 / 24%) 0%, rgb(18 98 18 / 13%) 100%)',
                }}
                readOnly
              />
              <button
                onClick={reset}
                type="button"
                className="absolute top-4 right-5 bg-black px-2 rounded-full border-[1px] border-[#d0fc7e] hover:opacity-70 transition"
              >
                X
              </button>
            </div>
            <a
              className="block button w-full center px-0 sm:w-[210px] m-5"
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
              className={`button block w-full center sm:w-[210px] ${
                (path || loading) && 'disabled'
              }`}
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
