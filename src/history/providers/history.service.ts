import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  History,
  HistoryDocument,
  HistoryAction,
} from '../schemas/history.schema';
import { GetHistoryDto } from '../dtos/get-history.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name)
    private readonly historyModel: Model<HistoryDocument>,
  ) {}

  async record(params: {
    userId: string;
    action: HistoryAction;
    input: Record<string, unknown>;
    output?: Record<string, unknown>;
    success: boolean;
    error?: string;
  }): Promise<void> {
    await this.historyModel.create({
      userId: new Types.ObjectId(params.userId),
      action: params.action,
      input: params.input,
      output: params.output ?? {},
      success: params.success,
      error: params.error,
    });
  }

  async getHistory(userId: string, dto: GetHistoryDto) {
    const query: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (dto.action) query.action = dto.action;

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.historyModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.historyModel.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async deleteAll(userId: string): Promise<void> {
    await this.historyModel.deleteMany({
      userId: new Types.ObjectId(userId),
    });
  }

  async deleteOne(userId: string, id: string): Promise<void> {
    await this.historyModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
  }
}
