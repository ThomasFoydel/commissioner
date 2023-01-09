import React from 'react'

const PageSelector = ({ onChange, page }: { onChange: Function; page: number }) => {
  return (
    <div>
      <p className="center text-center">PAGE {page + 1}</p>
      <div className="flex justify-center">
        <button
          onClick={() => onChange((page: number) => (page > 0 ? page - 1 : 0))}
          className="button w-[120px] mr-4"
        >
          previous
        </button>
        <button onClick={() => onChange((page: number) => page + 1)} className="button w-[120px] ml-4">
          next
        </button>
      </div>
    </div>
  )
}

export default PageSelector
