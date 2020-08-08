import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Item } from "../models/item.schema";
import { ItemBaseService } from './base-item.service';
const ObjectId = require('mongoose').Types.ObjectId;
import * as Joi from '@hapi/joi';
import { UserService } from '../user/user.service';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';

@Injectable()
export class ItemService {
    constructor(
        private UserService: UserService,
        private ItemBaseService: ItemBaseService,
    ) { }
    async getItemByID(id): Promise<Item | null> {
        if (!ObjectId.isValid(id)) throw new HttpException('not valid object id', HttpStatus.FORBIDDEN);
        const item = await this.ItemBaseService.findOneById(id);
        if (!item) {
            throw new HttpException('no item ', HttpStatus.FORBIDDEN);
        }
        return item;
    }

    async getUserItem(userID, itemID) {
        if (!await this.UserService.checkUserHaveItem(userID, itemID))
            throw new HttpException('you do not have this item ', HttpStatus.UNAUTHORIZED);
        return this.getItemByID(itemID);
    }
    async checkCeateItemData(createItemDto: CreateDto): Promise<Boolean> {
        const shcema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().optional(),
            ifDone: Joi.boolean().optional(),
            toDoDate: Joi.date().raw().optional(),
            endTime: Joi.number().optional()
        });
        const validate = shcema.validate(createItemDto);
        if (validate.error)
            throw new HttpException(validate.error, HttpStatus.FORBIDDEN);
        return true;
    }
    async checkUpdateItemData(updateItemDto: UpdateDto): Promise<Boolean> {
        const shcema = Joi.object({
            name: Joi.string().optional(),
            description: Joi.string().optional(),
            toDoDate: Joi.date().raw().optional(),
            endTime: Joi.number().optional()
        });
        const validate = shcema.validate(updateItemDto);
        if (validate.error)
            throw new HttpException(validate.error, HttpStatus.FORBIDDEN);
        return true;
    }

    async create(createItemDto: CreateDto, userID) {
        const user = await this.UserService.getUserByID(userID);
        if (!user)
            throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);

        await this.checkCeateItemData(createItemDto);
        const createdItem = await this.ItemBaseService.create(createItemDto);
        await this.UserService.addItemToUser(createdItem._id, userID);
        return createdItem;
    }
    async toggleIsDone(userID, itemID) {
        if (!await this.UserService.checkUserHaveItem(userID, itemID))
            throw new HttpException('you do not have this item ', HttpStatus.UNAUTHORIZED);
        const item = await this.getItemByID(itemID);
        await this.ItemBaseService.update(itemID, { ifDone: item.ifDone ? false : true });
        return item.ifDone ? false : true;
    }
    async updateItem(userID, itemID, updateItemDto: UpdateDto) {
        if (!await this.UserService.checkUserHaveItem(userID, itemID))
            throw new HttpException('you do not have this item ', HttpStatus.UNAUTHORIZED);
        const item = await this.getItemByID(itemID);
        await this.checkUpdateItemData(updateItemDto);
        if (updateItemDto.description)
            await this.ItemBaseService.update(itemID, { description: updateItemDto.description });
        if (updateItemDto.name)
            await this.ItemBaseService.update(itemID, { name: updateItemDto.name });
        if (updateItemDto.toDoDate)
            await this.ItemBaseService.update(itemID, { toDoDate: updateItemDto.toDoDate });
        if (updateItemDto.endTime)
            await this.ItemBaseService.update(itemID, { endTime: updateItemDto.endTime });

    }

    async getUserAllItems(userId) {
        const itemsIDs = await this.UserService.getUserItem(userId);
        var items = [];
        for (let i = 0; i < itemsIDs.length; i++) {
            const item = await this.getItemByID(itemsIDs[i]);
            items.push(item);
        }
        return items;
    }
    async getUserUnDoItems(userId) {
        const itemsIDs = await this.UserService.getUserItem(userId);
        var items = [];
        for (let i = 0; i < itemsIDs.length; i++) {
            const item = await this.getItemByID(itemsIDs[i]);
            if (!item.ifDone)
                items.push(item);
        }
        return items;
    }

    async getUserDoneItems(userId) {
        const itemsIDs = await this.UserService.getUserItem(userId);
        var items = [];
        for (let i = 0; i < itemsIDs.length; i++) {
            const item = await this.getItemByID(itemsIDs[i]);
            if (item.ifDone)
                items.push(item);
        }
        return items;
    }

    async getUserItemsForThisDay(userId) {
        const itemsIDs = await this.UserService.getUserItem(userId);
        var items = [];
        const today = new Date();
        // const dateNow = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        for (let i = 0; i < itemsIDs.length; i++) {
            var item = await this.getItemByID(itemsIDs[i]);
            if (!item.toDoDate || item.toDoDate == today)
                items.push(item);
        }
        return items;
    }

    async getUserItemsForThisDayUndo(userId) {
        const itemsIDs = await this.UserService.getUserItem(userId);
        var items = [];
        const today = new Date();
        for (let i = 0; i < itemsIDs.length; i++) {
            const item = await this.getItemByID(itemsIDs[i]);
            if (!item.ifDone && (!item.toDoDate || item.toDoDate == today))
                items.push(item);
        }
        return items;
    }

    async deleteItem(itemID, userID) {
        const item = await this.getItemByID(itemID);
        if (!await this.UserService.checkUserHaveItem(userID, itemID))
            throw new HttpException('you do not have this item ', HttpStatus.UNAUTHORIZED);
        if (await this.UserService.deleteItemFromUser(userID, itemID))
            if (await this.ItemBaseService.delete(itemID))
                return true;
            else throw new HttpException('this item not exist ', HttpStatus.UNAUTHORIZED);

    }

}
