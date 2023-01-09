import React, { ChangeEvent } from 'react'

const orderOptions = [
  { value: 'voteAmount', label: 'votes' },
  { value: 'created', label: 'created' },
]

const directionOptions = [
  { value: 'asc', label: 'ascending' },
  { value: 'desc', label: 'descending' },
]
const perPageOptions = ['5', '10', '20']

const EntrySorter = ({
  onOrderChange,
  onDirectionChange,
  onPerPageChange,
}: {
  onOrderChange: Function
  onDirectionChange: Function
  onPerPageChange: Function
}) => {
  const handleOrder = (e: ChangeEvent<HTMLSelectElement>) => onOrderChange(e.target.value)
  const handleDirection = (e: ChangeEvent<HTMLSelectElement>) => onDirectionChange(e.target.value)
  const handlePerPage = (e: ChangeEvent<HTMLSelectElement>) => onPerPageChange(+e.target.value)

  return (
    <div>
      <select onChange={handleOrder}>
        {orderOptions.map(({ value, label }) => (
          <option value={value} key={value}>
            {label}
          </option>
        ))}
      </select>
      <select onChange={handleDirection}>
        {directionOptions.map(({ value, label }) => (
          <option value={value} key={value}>
            {label}
          </option>
        ))}
      </select>
      <select onChange={handlePerPage}>
        {perPageOptions.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default EntrySorter