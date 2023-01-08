import { toast } from 'react-toastify'
import React, { useState } from 'react'
import { uploadTextToIpfs } from '../../utils/ipfs/client'
import { truncateContent } from '../../utils'

const TextUpload = ({ setPath, label }: { setPath: Function; label: string }) => {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  const uploadText = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || uploaded) return
    toast.info('uploading to ipfs...')
    setLoading(true)
    try {
      const path = await uploadTextToIpfs(text)
      setPath(path)
      setUploaded(true)
      toast.dismiss()
      toast.success('successful upload to ipfs')
    } catch (err) {
      toast.dismiss()
      toast.error('upload to ipfs failed')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={uploadText} className="text-center">
      <div>
        {loading || uploaded ? (
          <>
            Uploaded Content:
            <p
              className="center p-3 my-3 rounded-[24px] crt-border resize-none h-[150px] w-[80%]"
              style={{
                boxShadow: 'inset 10px 10px 40px #e6fff814, inset -10px -10px 40px #00000094',
                background:
                  'radial-gradient(circle, rgb(60 159 63 / 24%) 0%, rgb(18 98 18 / 13%) 100%)',
              }}
            >
              {truncateContent(text)}
            </p>
          </>
        ) : (
          <>
            <label>{label}</label>
            <br />
            <textarea
              value={text}
              className="p-3 my-3 rounded-[24px] crt-border resize-none h-[150px] w-[80%]"
              style={{
                boxShadow: 'inset 10px 10px 40px #e6fff814, inset -10px -10px 40px #00000094',
                background:
                  'radial-gradient(circle, rgb(60 159 63 / 24%) 0%, rgb(18 98 18 / 13%) 100%)',
              }}
              onChange={(e) => setText(e.target.value)}
            />
          </>
        )}
      </div>
      {!uploaded && (
        <button className={`button ${(uploaded || loading) && 'disabled'}`} type="submit">
          {loading ? 'Please Wait...' : 'Upload To IPFS'}
        </button>
      )}
    </form>
  )
}

export default TextUpload
