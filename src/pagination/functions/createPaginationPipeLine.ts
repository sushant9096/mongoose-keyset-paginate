import { InputCreateCursorPipeline } from '../interfaces'
import { Types } from 'mongoose'
import decodePaginationCursor from './decodePaginationCursor'
import moment from 'moment'

const createPaginationPipeLine = async (input: InputCreateCursorPipeline) => {
  const {
    nextCursorToken,
    previousCursorToken,
    mainFilter,
    limit,
    sortOperator,
    sort,
    cursorCheck = false,
    joinEntities,
    cursorKey
  } = input
  let sortField = null
  const pipeline = []
  let query: any = {}

  if (joinEntities) {
    for (const joinEntity of joinEntities) {
      const {
        joinFromField,
        joinToField,
        fields,
        collection,
        oneToOne = true
      } = joinEntity
      const innerPipeline = []
      let innerPipelineOutputField = ''
      let populateObj: Record<string, any> = null

      if (oneToOne && collection[collection.length - 1] === 's') {
        innerPipelineOutputField = collection
          .slice(0, collection.length - 1)
          .replace(/-/g, '_')
      } else {
        innerPipelineOutputField = collection.replace(/-/g, '_')
      }

      innerPipeline.push({
        $match: {
          $expr: {
            $eq: [`$${joinToField}`, `$$${joinFromField}`]
          }
        }
      })

      if (fields && fields.length > 0) {
        populateObj = {
          [fields[0]]: 1
        }
        for (let i = 1; i < fields.length; i++) {
          populateObj[fields[i]] = 1
        }
        innerPipeline.push({
          $project: populateObj
        })
      }

      pipeline.push({
        $lookup: {
          from: collection,
          let: { [joinFromField]: `$${joinFromField}` },
          pipeline: innerPipeline,
          as: innerPipelineOutputField
        }
      })

      if (oneToOne) {
        pipeline.push({
          $unwind: {
            path: `$${innerPipelineOutputField}`,
            preserveNullAndEmptyArrays: true
          }
        })
      }
    }
  }

  // console.log('mainFilter');
  // console.log(mainFilter);
  // console.log('pipeline');
  // console.log(pipeline);

  if (nextCursorToken) {
    const decryptedCursorToken = JSON.parse(
      await decodePaginationCursor(nextCursorToken, cursorKey)
    )
    const {
      sortField: dSortField,
      sortOperator: dSortOperator,
      lastItem
    } = decryptedCursorToken
    if (dSortField && dSortOperator) {
      const sortFieldValue = moment(
        lastItem[dSortField],
        moment.ISO_8601
      ).isValid()
        ? new Date(lastItem[dSortField])
        : lastItem[dSortField]
      // console.log('sortFieldValue');
      // console.log(sortFieldValue);
      query = {
        $and: [
          mainFilter,
          {
            [dSortField]: { [dSortOperator + 'e']: sortFieldValue },
            _id: { [dSortOperator]: new Types.ObjectId(lastItem._id) }
          }
        ]
      }
    } else {
      query = mainFilter
      query['_id'] = {
        [sortOperator]: new Types.ObjectId(lastItem['_id'])
      }
    }
  } else if (previousCursorToken && cursorCheck) {
    const decryptedCursorToken = JSON.parse(
      await decodePaginationCursor(previousCursorToken, cursorKey)
    )
    const { sortField: dSortField, firstItem } = decryptedCursorToken
    sortField = dSortField
    let { sortOperator: dSortOperator } = decryptedCursorToken
    dSortOperator = dSortOperator === '$gt' ? '$lt' : '$gt'
    const sortFieldValue = moment(
      firstItem[dSortField],
      moment.ISO_8601
    ).isValid()
      ? new Date(firstItem[dSortField])
      : firstItem[dSortField]
    // console.log('sortFieldValue');
    if (dSortField) {
      const paginationQuery = [
        { [dSortField]: { [dSortOperator]: sortFieldValue } },
        {
          [dSortField]: sortFieldValue,
          _id: { [dSortOperator]: new Types.ObjectId(firstItem._id) }
        }
      ]
      query = { $and: [mainFilter, { $or: paginationQuery }] }
    } else {
      query = mainFilter
      query['_id'] = {
        $lt: new Types.ObjectId(firstItem['_id'])
      }
    }
    // console.log('CursorCheckFilterQuery:');
    // console.log(JSON.stringify(query));
  } else if (previousCursorToken) {
    const decryptedCursorToken = JSON.parse(
      await decodePaginationCursor(previousCursorToken, cursorKey)
    )
    const {
      sortField: dSortField,
      sortOperator: dSortOperator,
      firstItem
    } = decryptedCursorToken
    if (dSortField) {
      const sortFieldValue = moment(
        firstItem[dSortField],
        moment.ISO_8601
      ).isValid()
        ? new Date(firstItem[dSortField])
        : firstItem[dSortField]
      const paginationQuery = {
        [dSortField]: { [dSortOperator + 'e']: sortFieldValue },
        _id: { [dSortOperator + 'e']: new Types.ObjectId(firstItem._id) }
      }
      query = { $and: [mainFilter, paginationQuery] }
    } else {
      query = mainFilter
      query['_id'] = {
        [sortOperator + 'e']: new Types.ObjectId(firstItem['_id'])
      }
    }
    // console.log('FilterQuery:');
    // console.log(JSON.stringify(query));
  } else {
    query = mainFilter
  }

  pipeline.push({
    $match: query
  })

  // Sorting
  if (cursorCheck) {
    if (sort && Object.keys(sort).length !== 0 && sortField !== '_id') {
      pipeline.push({
        $sort: {
          [sortField]: sort[sortField] === 1 ? -1 : 1,
          _id: sort[sortField] === 1 ? -1 : 1
        }
      })
    } else if (sort && Object.keys(sort).length !== 0) {
      pipeline.push({
        $sort: {
          [sortField]: sort[sortField] === 1 ? -1 : 1
        }
      })
    } else {
      pipeline.push({
        $sort: {
          _id: -1
        }
      })
    }
    // Limit data length
    pipeline.push({
      $limit: limit
    })
    pipeline.push({
      $sort: {
        _id: 1
      }
    })
  } else {
    if (sort && Object.keys(sort).length !== 0) {
      pipeline.push({
        $sort: sort
      })
    }

    // Limit data length
    pipeline.push({
      $limit: limit
    })
  }

  return pipeline
}

export default createPaginationPipeLine
