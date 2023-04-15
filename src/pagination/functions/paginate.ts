import {
  paginateByKeySet,
  PaginationFilter,
  TPaginateJoin
} from '../../pagination'

export const paginate = (schema) => {
  schema.statics.cursorPaginate = function (
    filter: PaginationFilter,
    options,
    joinEntities?: TPaginateJoin
  ) {
    const { MONGO_CURSOR_KEY: cursorKey } = process.env
    // console.log('MONGO_CURSOR_KEY: ', cursorKey)
    if (cursorKey && typeof cursorKey === 'string')
      return paginateByKeySet(cursorKey, this, filter, options, joinEntities)
    else
      throw new Error('Please add MONGO_CURSOR_KEY in your NodeJS Environment.')
  }
}
