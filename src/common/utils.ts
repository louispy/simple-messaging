import { PaginationResponse } from './dto/pagination.response';

export const getPagination = (page, limit, count): PaginationResponse => ({
  page,
  limit,
  count,
  totalPages: Math.ceil(count / limit),
});
