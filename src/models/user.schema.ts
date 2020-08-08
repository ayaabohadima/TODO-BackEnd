import { prop, Ref } from '@typegoose/typegoose';
import { Item } from './item.schema';


export class User {
  @prop({ required: true })
  userName: string;
  @prop({ required: true })
  password: string;
  @prop({ required: true })
  email: string;
  @prop({ ref: Item })
  items?: [Ref<Item>];
}