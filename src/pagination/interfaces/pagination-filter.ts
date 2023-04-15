export interface PaginationFilterItem {
  value: unknown
  operator:
    | 'eq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'ne'
    | 'in'
    | 'sw'
    | 'ew'
    | 'btw'
}

export interface PaginationFilter {
  [name: string]: PaginationFilterItem
}
