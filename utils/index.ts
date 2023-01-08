export const truncate = (id: string) => {
  const begin = id.substring(0, 6)
  const end = id.substring(id.length - 4)
  return begin + '...' + end
}

export const truncateContent = (content: string, length = 400) => {
  if (content.length < length) return content
  return content.substring(0, length) + '...'
}
