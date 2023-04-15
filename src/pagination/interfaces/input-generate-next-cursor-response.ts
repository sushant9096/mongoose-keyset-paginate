import { Model } from 'mongoose'

export interface InputGenerateNextCursorResponse {
  model: Model<any>
  oldNextCursorToken?: string
  results: any[]
  mainFilter: Record<any, any>
  sort: Record<string, 1 | -1>
  sortOperator: string
  sortField: string
  cursorKey: string
}
