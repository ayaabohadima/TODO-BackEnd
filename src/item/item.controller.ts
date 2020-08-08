import { Controller, UseGuards, Post, Get, Body, Put, Request, Param, Query, Delete } from '@nestjs/common';
import { ItemService } from './item.service';
import { AuthGuard } from '@nestjs/passport';
import { Item } from '../models/item.schema'

@Controller()
export class ItemController {
    constructor(private readonly itemService: ItemService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('item/create')
    async create(@Body() item: Item, @Request() req) {
        const createdUser = await this.itemService.create(item, req.user._id);
        if (createdUser) return createdUser;
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('/me/item/:item_id/toggle-done')
    async toggleDone(@Request() req, @Param() params) {
        const ifDoneValue = await this.itemService.toggleIsDone(req.user._id, params.item_id)
        return { ifDoneValue: ifDoneValue }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('/item/:item_id/update')
    async updateName(@Request() req, @Param() params, @Body() item: {
        name?: string;
        description?: string;
        toDoDate?: Date;
    }) {
        await this.itemService.updateItem(req.user._id, params.item_id, item);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/item/:item_id')
    async delete(@Request() req, @Param() params) {
        await this.itemService.deleteItem(params.item_id, req.user._id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/item/:item_id')
    async getItem(@Request() req, @Param() params) {
        return await this.itemService.getUserItem(req.user._id, params.item_id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/me/items')
    async getItems(@Request() req) {
        return await this.itemService.getUserAllItems(req.user._id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/me/undo-items')
    async getItemsUndo(@Request() req) {
        return await this.itemService.getUserUnDoItems(req.user._id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/me/done-items')
    async getItemsDone(@Request() req) {
        return await this.itemService.getUserDoneItems(req.user._id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me/today-ToDoList')
    async getTodayItems(@Request() req) {
        return await this.itemService.getUserItemsForThisDay(req.user._id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me/today-ToDoList-undo')
    async getTodayItemsUndo(@Request() req) {
        return await this.itemService.getUserItemsForThisDayUndo(req.user._id);
    }

}
