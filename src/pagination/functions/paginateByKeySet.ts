import moment from 'moment'
import { ApiError, escapeSpecialCharacterFromString } from '../../utils'
import createPaginationPipeLine from './createPaginationPipeLine'
import generatePaginationResponse from './generatePaginationResponse'
import { IPaginateByKeySet, PaginationFilter } from '../interfaces'
import { Model } from 'mongoose'
import { TPaginateJoin } from '../types'
import { MONGO_PAGINATION_OPERATORS } from '../../common'
import { ObjectId } from 'mongoose/lib/types'

export const paginateByKeySet = async (
  cursorKey: string,
  model: Model<any>,
  filter: PaginationFilter,
  options,
  joinEntities?: TPaginateJoin
): Promise<IPaginateByKeySet> => {
  // console.log(filter);
  const errors = []
  // console.log('Schema Paths:');
  // console.log(model.schema.paths['edd'].instance === 'Date');
  // console.log(model.schema.paths['edd']);
  let sort = null
  let sortField = null
  let sortOperator = '$gt'
  const limit =
    options.limit && parseInt(options.limit, 10) > 0
      ? parseInt(options.limit, 10)
      : 10
  const mainFilter = {}
  let response

  if (options.sortBy) {
    const tmp = options.sortBy.split(':')
    if (tmp.length > 0 && tmp.length <= 2) {
      const [key, order] = tmp
      sortField = key
      if (order === 'desc') {
        sort = {
          [sortField]: -1
        }
        sortOperator = '$lt'
      } else {
        sort = {
          [sortField]: 1
        }
      }
    }
  } else {
    // sort = 'createdAt';
    // sortField = 'createdAt';
  }

  for (const filterKey in filter) {
    const { value, operator = 'eq' } = filter[filterKey]

    // Checking provided field presence inside model
    if (!model.schema.paths.hasOwnProperty(filterKey))
      throw new ApiError([
        {
          field: filterKey,
          error: `${filterKey} field doesn't exist inside model.`
        }
      ])

    if (
      model.schema.paths[filterKey].instance === 'Date' &&
      typeof value === 'string'
    ) {
      if (
        moment(value, moment.ISO_8601).isValid() &&
        MONGO_PAGINATION_OPERATORS.includes(operator)
      ) {
        mainFilter[filterKey] = {
          [`$${operator}`]: new Date(value)
        }
      } else {
        errors.push({
          error: `This field only supports following operators ${MONGO_PAGINATION_OPERATORS.toString()} with value of type ISO Date String.`,
          field: filterKey
        })
      }
      continue
    }

    if (
      model.schema.paths[filterKey].instance === 'ObjectID' &&
      typeof value === 'string'
    ) {
      // console.log('ObjectID: path');
      mainFilter[filterKey] = {
        [`$${operator}`]: new ObjectId(value)
      }
      continue
    }

    if (typeof value === 'string' && operator === 'sw') {
      mainFilter[filterKey] = new RegExp(
        '^' + escapeSpecialCharacterFromString(value),
        'i'
      )
    } else if (typeof value === 'string' && operator === 'ew') {
      mainFilter[filterKey] = new RegExp(
        escapeSpecialCharacterFromString(value) + '$',
        'i'
      )
    } else if (typeof value === 'string' && operator === 'btw') {
      mainFilter[filterKey] = new RegExp(
        '.*' + escapeSpecialCharacterFromString(value) + '.*',
        'i'
      )
    } else {
      if (MONGO_PAGINATION_OPERATORS.includes(operator))
        mainFilter[filterKey] = {
          [`$${operator}`]: value
        }
      else
        errors.push({
          field: filterKey,
          error: `value of operator should be: ${MONGO_PAGINATION_OPERATORS.toString()}`
        })
    }
  }

  if (errors.length > 0) {
    throw new ApiError(errors)
  }

  // console.log(mainFilter);
  let cursorPipeline: any[]
  if (!options.next && !options.previous) {
    cursorPipeline = await createPaginationPipeLine({
      joinEntities,
      mainFilter,
      sort,
      sortOperator,
      limit,
      cursorKey
    })
    // console.log('cursorPipeline:\n', JSON.stringify(cursorPipeline));
    const results = await model.aggregate(cursorPipeline)
    // console.log('results:\n', results);
    response = {
      ...(await generatePaginationResponse({
        model,
        results,
        sort,
        sortOperator,
        sortField,
        mainFilter,
        cursorKey
      })),
      limit
    }
  } else if (options.next) {
    cursorPipeline = await createPaginationPipeLine({
      joinEntities,
      nextCursorToken: options.next,
      mainFilter,
      sort,
      sortOperator,
      limit,
      cursorKey
    })
    const results = await model.aggregate(cursorPipeline)

    response = {
      ...(await generatePaginationResponse({
        model,
        oldNextCursorToken: options.next,
        results,
        sort,
        sortOperator,
        sortField,
        mainFilter,
        cursorKey
      })),
      limit
    }
  } else {
    // console.log('Inside Previous Cursor');
    cursorPipeline = await createPaginationPipeLine({
      joinEntities,
      cursorCheck: true,
      previousCursorToken: options.previous,
      mainFilter,
      sort,
      sortOperator,
      limit,
      cursorKey
    })
    const results = await model.aggregate(cursorPipeline)

    response = {
      ...(await generatePaginationResponse({
        model,
        oldNextCursorToken: options.previous,
        results,
        sort,
        sortOperator,
        sortField,
        mainFilter,
        cursorKey
      })),
      limit
    }
  }
  return response
}
