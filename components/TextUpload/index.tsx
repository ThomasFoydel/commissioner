import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { uploadTextToIpfs } from '../../utils/ipfs/client'

const TextUpload = ({ setPath, label }: { setPath: Function; label: string }) => {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  const uploadText = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || uploaded) return
    const toastId = toast.info('uploading to ipfs...')
    setLoading(true)
    try {
      const path = await uploadTextToIpfs(text)
      setPath(path)
      setUploaded(true)
      toast.update(toastId, { type: 'success', render: 'successful upload to ipfs' })
    } catch (err) {
      toast.update(toastId, { type: 'error', render: 'upload to ipfs failed' })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={uploadText} className="text-center">
      {(loading || uploaded) && (
        <>
          Uploaded Content:
          <p className="p-3 my-3 center w-90 rounded bg-skin-card" style={{ height: '150px' }}>
            {text}
          </p>
        </>
      )}
      <div>
        {!loading && !uploaded && (
          <>
            <label>{label}</label>
            <br />
            <textarea
              value={text}
              className="p-3 my-3"
              style={{ resize: 'none', height: '150px', width: '80%' }}
              onChange={(e) => setText(e.target.value)}
            />
          </>
        )}
      </div>
      <button
        className={`button text-skin-inverted ${(uploaded || loading) && 'disabled'}`}
        type="submit"
      >
        {loading ? 'Please Wait ...' : 'Upload To IPFS'}
      </button>
    </form>
  )
}

export default TextUpload
