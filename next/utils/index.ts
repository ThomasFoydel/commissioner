export const truncate = (id: string) => {
  const isAddress = id.substring(0, 2) === '0x'
  const begin = id.substring(0, isAddress ? 6 : 4)
  const end = id.substring(id.length - 4)
  return begin + '...' + end
}

export const truncateContent = (content: string, length = 400) => {
  if (content.length < length) return content
  return content.substring(0, length) + '...'
}
