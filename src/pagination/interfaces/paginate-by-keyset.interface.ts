export interface IPaginateByKeySet {
  currentCursorResultsCount: number
  results: any[]
  hasNext: boolean
  next: string
  hasPrevious: boolean
  previous: string
  limit: number
}
