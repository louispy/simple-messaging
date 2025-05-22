export interface FindOptions {
  sort?: string;
  sortDir?: 'asc' | 'desc';
  select?: string;
}

export interface BaseRepository<T> {
  insert(obj: T): Promise<T>;
  find(
    query: any,
    page: number,
    limit: number,
    options: FindOptions,
  ): Promise<T[]>;
  findOne(id: string): Promise<T | null>;
  count(query: any): Promise<number>;
  upsert(query: any, value: any): Promise<T | null>;
  updateOne(id: string, value: Partial<T>): Promise<T | null>;
  updateMany(criteria: any, value: Partial<T>): Promise<T | null>;
  deleteOne(id: string): Promise<T | null>;
}
