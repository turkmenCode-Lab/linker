import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HistoryDocument = History & Document;

export type HistoryAction =
  | 'link_to_config'
  | 'config_to_link'
  | 'bulk_import'
  | 'subscription';

@Schema({ timestamps: true })
export class History {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['link_to_config', 'config_to_link', 'bulk_import', 'subscription'],
  })
  action: HistoryAction;

  @Prop({ type: Object })
  input: Record<string, unknown>;

  @Prop({ type: Object })
  output: Record<string, unknown>;

  @Prop({ default: true })
  success: boolean;

  @Prop()
  error?: string;
}

export const HistorySchema = SchemaFactory.createForClass(History);
