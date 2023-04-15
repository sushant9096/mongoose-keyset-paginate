export type TPaginateJoinItem = {
  joinToField: string
  joinFromField: string
  collection: string
  fields?: string[]
  oneToOne?: boolean
}
export type TPaginateJoin = Array<TPaginateJoinItem>
