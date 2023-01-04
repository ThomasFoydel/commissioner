export const truncate = (id: string) => {
  const begin = id.substring(0, 6)
  const end = id.substring(id.length - 4)
  return begin + '...' + end
}
