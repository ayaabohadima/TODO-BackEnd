import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { UserBaseService } from '../user/base-user.service';
import { ItemBaseService } from '../item/base-item.service';
import { User } from "../models/user.schema";
import { Item } from "../models/item.schema";
import { TypegooseModule } from "nestjs-typegoose";
@Module({
    imports: [
        TypegooseModule.forFeature([Item]),
        TypegooseModule.forFeature([User]),],
    providers: [UserService, UserBaseService, ItemBaseService]
})
export class SharedModule { }
