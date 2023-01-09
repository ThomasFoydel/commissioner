import React, { ChangeEvent } from 'react'

const orderOptions = [
  { value: 'reward', label: 'reward' },
  { value: 'entryCount', label: 'entry count' },
  { value: 'created', label: 'created' },
  { value: 'minTime', label: 'min time' },
  { value: 'none', label: 'none' },
]
const directionOptions = [
  { value: 'asc', label: 'ascending' },
  { value: 'desc', label: 'descending' },
]
const perPageOptions = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '20', label: '20' },
]

const CommissionSorter = ({
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
          <option value={value}>{label}</option>
        ))}
      </select>
      <select onChange={handleDirection}>
        {directionOptions.map(({ value, label }) => (
          <option value={value}>{label}</option>
        ))}
      </select>
      <select onChange={handlePerPage}>
        {perPageOptions.map(({ value, label }) => (
          <option value={value}>{label}</option>
        ))}
      </select>
    </div>
  )
}

export default CommissionSorter
