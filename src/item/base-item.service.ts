import { Injectable } from '@nestjs/common';
import { Item } from "../models/item.schema";
import { ReturnModelType } from "@typegoose/typegoose";
import { InjectModel } from "nestjs-typegoose";
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
@Injectable()
export class ItemBaseService {
    constructor(
        @InjectModel(Item) private readonly itemModel: ReturnModelType<typeof Item>
    ) { }

    async findOneById(id) {
        return await this.itemModel.findOne({ _id: id });
    }

    async findAll() {
        return await this.itemModel.find().exec();
    }

    async create(createItemDto: CreateDto) {
        const createdItem = new this.itemModel(createItemDto);
        await createdItem.save();
        return createdItem;
    }

    async update(id, updateData: UpdateDto) {

        await this.itemModel.updateOne({ _id: id }, updateData);
        return 1;
    }

    async delete(id) {
        return await this.itemModel.findOneAndDelete({ _id: id });
    }

}