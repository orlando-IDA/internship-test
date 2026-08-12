export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMeta;

  private constructor(data: T[], meta: PaginationMeta) {
    this.data = data;
    this.meta = meta;
  }

  static create<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponseDto<T> {
    return new PaginatedResponseDto(data, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }
}
