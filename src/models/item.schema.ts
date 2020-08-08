import { prop, Ref } from "@typegoose/typegoose";

export class Item {
  @prop({ required: true })
  name: string;
  @prop({ options: true })
  description?: string;
  @prop({ options: true })
  toDoDate?: Date;
  @prop({ options: true })
  endTime?: Number;
  @prop({ default: false })
  ifDone?: boolean;
}