import { Injectable } from '@nestjs/common';
import { Document, Model, QueryOptions } from 'mongoose';

import { BaseRepository, FindOptions } from './base.repository.interface';

@Injectable()
export abstract class DefaultRepository<T> implements BaseRepository<T> {
  constructor(protected readonly model: Model<any>) {}

  async insert(obj: T, session?: any): Promise<T> {
    let result: any;
    if (session) {
      result = await this.model.create([obj], { session });
      result = result[0];
    } else {
      result = await this.model.create(obj);
    }
    return result.toJSON();
  }

  async find(
    query: any = {},
    page: number = 1,
    limit: number = 10,
    options: FindOptions = { sort: '_id', sortDir: 'asc', select: '' },
  ): Promise<T[]> {
    let q = this.model
      .find({ ...query, isDeleted: false })
      .skip((page - 1) * limit)
      .limit(limit);

    if (options.sort && options.sortDir) {
      q = q.sort({ [options.sort]: options.sortDir });
    }

    if (options.select) {
      q = q.select(options.select);
    }

    return q;
  }

  async findOne(id: string, session?: any): Promise<T | null> {
    const opt: QueryOptions = {};
    if (session) {
      opt.session = session;
    }
    return this.model.findOne({ _id: id, isDeleted: false }, opt);
  }

  async findOneDoc(id: string): Promise<(T & Document) | null> {
    return this.model.findOne({ _id: id, isDeleted: false });
  }

  async count(query: any): Promise<number> {
    return this.model.countDocuments({ ...query, isDeleted: false });
  }

  async upsert(query: any = {}, value: any, session?: any): Promise<T | null> {
    const opt: QueryOptions = {
      upsert: true,
      new: true,
    };
    if (session) {
      opt.session = session;
    }
    const doc = await this.model.findOneAndUpdate(query, value, opt);
    return doc;
  }

  async updateOne(
    id: string,
    value: Partial<T>,
    criteria: any = {},
    session?: any,
  ): Promise<T> {
    const opt: QueryOptions = { new: true };
    if (session) {
      opt.session = session;
    }
    const doc = await this.model.findOneAndUpdate(
      { _id: id, ...criteria, isDeleted: false },
      value,
      opt,
    );
    return doc;
  }

  async deleteOne(id: string, session?: any): Promise<T> {
    const opt: QueryOptions = {};
    if (session) {
      opt.session = session;
    }
    const doc = await this.model.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      opt,
    );
    return doc;
  }

  async save(obj: T & Document): Promise<T> {
    const saved = await obj.save();
    return saved.toJSON() as T;
  }
}
