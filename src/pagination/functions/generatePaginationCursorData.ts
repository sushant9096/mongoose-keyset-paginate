const generatePaginationCursorData = (
  results: any[],
  sortField: string,
  sortOperator
) => {
  let nextPaginationData: {
    firstItem: Record<string, any>
    sortOperator: string
    sortField: string
  }
  if (results.length > 0) {
    const firstItem = {
      _id: results[0]['_id'],
      [sortField]: results[0][sortField]
    }
    // console.log('sortField:\n', sortField);
    // console.log('sortOperator:\n', sortOperator);
    const lastItem = results[results.length - 1]
    nextPaginationData = {
      firstItem,
      sortField: sortField,
      sortOperator: sortOperator
    }
    sortField
      ? (nextPaginationData['lastItem'] = {
          _id: lastItem['_id'],
          [sortField]: lastItem[sortField]
        })
      : (nextPaginationData['lastItem'] = {
          _id: lastItem['_id']
        })
    return nextPaginationData
  } else return {}
}
export default generatePaginationCursorData
