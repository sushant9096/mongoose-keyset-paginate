import { InputGenerateNextCursorResponse } from '../interfaces'
import generatePaginationCursorData from './generatePaginationCursorData'
import encodePaginationCursor from './encodePaginationCursor'
import createPaginationPipeLine from './createPaginationPipeLine'

const generatePaginationResponse = async (
  inputs: InputGenerateNextCursorResponse
) => {
  let hasPrevious = false
  const {
    model,
    oldNextCursorToken,
    results,
    sortField,
    sortOperator,
    sort,
    mainFilter,
    cursorKey
  } = inputs

  if (results.length === 0) {
    return {
      currentCursorResultsCount: results.length,
      results,
      hasNext: false,
      next: null,
      hasPrevious: false,
      previous: null
    }
  }

  const nextPaginationData = generatePaginationCursorData(
    results,
    sortField,
    sortOperator
  )
  // console.log('nextPaginationData:\n', nextPaginationData);
  const nextCursorToken = await encodePaginationCursor(
    JSON.stringify(nextPaginationData),
    cursorKey
  )
  const nextCursorPipeline = await createPaginationPipeLine({
    mainFilter,
    sort,
    sortOperator,
    nextCursorToken,
    limit: 1,
    cursorKey
  })
  // console.log('nextCursorPipeline:\n', JSON.stringify(nextCursorPipeline));
  const nextResults = await model.aggregate(nextCursorPipeline)
  // console.log('nextResults:\n', nextResults);
  const hasNext = nextResults && nextResults.length > 0
  let prevCursorToken = null
  if (oldNextCursorToken) {
    const prevPaginationData = generatePaginationCursorData(
      results,
      sortField,
      sortOperator
    )
    // console.log('prevPaginationData:\n', prevPaginationData);
    prevCursorToken = await encodePaginationCursor(
      JSON.stringify(prevPaginationData),
      cursorKey
    )
    const prevCursorPipeline = await createPaginationPipeLine({
      cursorCheck: true,
      mainFilter,
      sort,
      sortOperator,
      previousCursorToken: prevCursorToken,
      limit: 1,
      cursorKey
    })
    // console.log('prevCursorPipeline:\n', JSON.stringify(prevCursorPipeline));
    const prevResults = await model.aggregate(prevCursorPipeline)
    // console.log('prevResults:\n', prevResults);
    hasPrevious = prevResults && prevResults.length > 0
  }

  return {
    currentCursorResultsCount: results.length,
    results,
    hasNext,
    next: hasNext ? nextCursorToken : null,
    hasPrevious,
    previous: hasPrevious ? prevCursorToken : null
  }
}
export default generatePaginationResponse
