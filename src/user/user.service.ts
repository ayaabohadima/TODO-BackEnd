import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { User } from "../models/user.schema";
import * as Joi from '@hapi/joi';
import * as bcrypt from 'bcrypt';
import { UserBaseService } from './base-user.service';
import { ItemBaseService } from '../item/base-item.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';


@Injectable()
export class UserService {
    constructor(
        private UserBaseService: UserBaseService,
        private ItemBaseService: ItemBaseService,
        //@InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
        // @InjectModel(Item) private readonly itemModel: ReturnModelType<typeof Item>
    ) { }

    async getUserByID(userID): Promise<User | null> {
        const user = await this.UserBaseService.findOneById(userID);
        if (!user)
            throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
        return user;
    }

    async getUserByEmail(email): Promise<User | null> {
        const user = await this.UserBaseService.findOneByEmail(email);
        if (!user)
            return null;
        return user;
    }

    async checkCeateUserData(createUserDto: RegisterDto): Promise<Boolean> {
        const shcema = Joi.object({
            email: Joi.string().trim().email().required(),
            password: Joi.string().required(),
            userName: Joi.string().required()
        });
        const validate = shcema.validate(createUserDto);
        if (validate.error)
            throw new HttpException(validate.error, HttpStatus.FORBIDDEN);
        if (await this.getUserByEmail(createUserDto.email))
            throw new HttpException('"email" should not have acount', HttpStatus.FORBIDDEN,);
        return true;
    }

    async create(createUserDto: RegisterDto) {
        await this.checkCeateUserData(createUserDto);
        const salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(createUserDto.password, salt);
        createUserDto.password = hash;
        return await this.UserBaseService.create(createUserDto);
    }

    async findByLogin(loginDto: LoginDto): Promise<any> {
        const user = await this.UserBaseService.findOneByEmail(loginDto.email);
        if (!user)
            throw new HttpException('not user by this email', HttpStatus.FORBIDDEN);
        if (await bcrypt.compare(loginDto.password, user.password)) return user;
        throw new HttpException('password is not correct', HttpStatus.FORBIDDEN);

    }

    async findAll(): Promise<User[] | null> {
        return await this.UserBaseService.findAll();
    }

    async addItemToUser(itemId, userID) {
        const user = await this.getUserByID(userID);
        let items = user.items;
        items.push(itemId);
        await this.UserBaseService.updateItems(userID, items);
        return 1;
    }

    async checkUserHaveItem(userID, itemID): Promise<Boolean> {
        const user = await this.getUserByID(userID);
        for (let i = 0; i < user.items.length; i++)
            if (String(user.items[i]) == String(itemID))
                return true;
        return false;

    }

    async deleteItemFromUser(userID, itemID) {
        if (!await this.checkUserHaveItem(userID, itemID))
            throw new HttpException('you do not have this item', HttpStatus.FORBIDDEN);
        const user = await this.getUserByID(userID);
        for (let i = 0; i < user.items.length; i++)
            if (String(user.items[i]) == String(itemID)) {
                user.items.splice(i, 1);
                await this.UserBaseService.updateItems(userID, user.items);
                return true;
            }
        throw new HttpException('can not delete', HttpStatus.FORBIDDEN);
    }

    async getUserItem(userID) {
        const user = await this.getUserByID(userID);
        return user.items;
    }

    async deleteUser(userID) {
        const user = await this.getUserByID(userID);
        if (!user)
            throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
        for (let i = 0; i < user.items.length; i++) {
            await this.ItemBaseService.delete(user.items[i]);
        }
        await this.UserBaseService.deleteUser(userID);
    }

}