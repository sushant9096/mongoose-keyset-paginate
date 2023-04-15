import { TPaginateJoin } from '../types'

export interface InputCreateCursorPipeline {
  cursorCheck?: boolean
  nextCursorToken?: string
  previousCursorToken?: string
  sort?: Record<string, -1 | 1>
  sortOperator: string
  limit: number
  mainFilter: Record<any, any>
  joinEntities?: TPaginateJoin
  cursorKey: string
}
