import { Injectable } from '@nestjs/common';
import { User } from "../models/user.schema";
import { ReturnModelType } from "@typegoose/typegoose";
import { InjectModel } from "nestjs-typegoose";
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UserBaseService {
    constructor(
        @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
        //  @InjectModel(Item) private readonly itemModel: ReturnModelType<typeof Item>
    ) { }

    async findOneById(id) {
        return await this.userModel.findOne({ _id: id });
    }

    async findOneByEmail(email) {
        return await this.userModel.findOne({ email: email });
    }

    async findAll() {
        return await this.userModel.find().exec();
    }

    async create(createUserDto: RegisterDto) {
        const createdUser = new this.userModel(createUserDto);
        await createdUser.save();
        return createdUser;
    }

    async updateItems(userID, items) {

        await this.userModel.updateOne({ _id: userID }, { items: items });
        return 1;
    }

    async deleteUser(userID) {
        await this.userModel.findOneAndDelete({ _id: userID });
    }

}