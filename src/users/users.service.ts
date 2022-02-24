import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from "./users.model";
import { InjectModel } from "@nestjs/sequelize";
import { CreateUserDto } from "./dto/create-user.dto";
import { RolesService } from "../roles/roles.service";
import { AddRoleDto } from "./dto/add-role.dto";
import { BanUserDto } from "./dto/ban-user.dto";
import { UserRoles } from "../roles/user-roles.model";

import { Role } from "../roles/roles.model";

@Injectable()
export class UsersService {

    // внедряем модель используя конструктор
    constructor(@InjectModel(User) private userRepository: typeof User,
        private roleService: RolesService) { }

    async createUser(dto: CreateUserDto) {
        const user = await this.userRepository.create(dto);
        const role = await this.roleService.getRoleByValue("ADMIN")
        // await user.$set('roles', [role.id])
        // user.roles = [role]
        // console.log(user)
        return user;
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({ where: { email }, include: { all: true } })
        return user;
    }

    async addRole(dto: AddRoleDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.value);
        if (role && user) {
            await user.$add('role', role.id);
            return dto;
        }
        throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    }

    async ban(dto: BanUserDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
        user.banned = true;
        user.banReason = dto.banReason;
        await user.save();
        return user;
    }

    async getAllUsers() {
        const users = await this.userRepository.findAll({
            include: {
                model: Role,
                attributes: ['value'],
                through: {
                    attributes: []
                }
            },
            raw: true,
            nest: true,
        });

        //users.map(item => item.roles = Object.values(item.roles))

        ////////////////////////////////////////////

        // const arr1 = [], arr2 = []
        // users.filter((item) => {
        //     if (!arr1.some((element) => element.id === item.id)) {
        //         arr1.push(item);
        //     }
        //     else {
        //         arr2.push(item)
        //     }
            
        // });
        // for (let i = 0; i < arr1.length; i++) {
        //     arr1[i].id === arr2[i].id ? arr1[i].roles = arr1[i].roles.concat(arr2[i].roles) : arr1[i].roles
        // }

        //////////////////////////////////////////

        // let arr1 = users.reduce(function (newArr, value, i) {
        //     if(!newArr.some((element) => element.id === value.id)){
        //         newArr.push({...users[i], roles: Object.values(users[i].roles)});
        //     } else {
        //         newArr[newArr.length - 1].roles.push(...Object.values(users[i].roles));
        //     }
        //     return newArr;
        // }, []);

        // 

        let arr1 = Object.values(users.reduce((acc, curr) => {
            if (acc[curr.id]) acc[curr.id].roles.push(...Object.values(curr.roles));
            else acc[curr.id] = {...curr, roles: Object.values(curr.roles)}
            return acc;
        }, {}));



        return arr1


        ///////////////////////////////////////////////

        // let arr = users.reduce(function (newArr, value, i) {
        //     if(i % 2 === 0) {
        //         newArr.push(value);
        //         newArr[newArr.length - 1].roles.concat(users[i + 1].roles)
        //     }
        //     else(
        //         newArr[i].roles.concat(users[i + 1].roles)
        //     )
        //     return newArr;
        // }, []);

        // console.log(arr)

        //////////////////////////////////////////////////////////

       

        // for (let i = 0; i < newArr.length; i++) {
        //     console.log(newArr[i].roles, "<<<1")
        //     console.log(users[i + 1], "<<<2")

        //      newArr[i].id === users[i].id ? 
        //         newArr[i].roles = newArr[i].roles.concat(users[i + 1].roles) :
        //         newArr[i].roles
        // }


        // let Arr = users.reduce(function (newArr, user) {
        //     if (user.roles === user.roles) {
        //       newArr.push(user.roles);
        //     }
        //     return newArr;
        //   }, []);

        // return users.reduce((previousValue, currentValue) => previousValue.concat(currentValue))

        // users.forEach(user => {
        //     const roless = user.roles.map(role => {
        //         return (role.value)
        //     });
        //     // user.setDataValue('roles', roles);
        //     user.roles = roless;
        // });


        // let newLog = JSON.stringify(users.map(item => item))
        // let newRole = users.map(user => JSON.stringify(user.roles)).map(function (p) {
        //     return Object.keys(p).map(function (k) { return p[k] }
        //     ).join('').replace(/([\[\]'"{}])/g, '').replace(/value:/gi, '').split(',')
        // })

        // let Arrrr = JSON.parse(newLog);
        // for(let i = 0; i < Arrrr.length; i++) {
        //     Arrrr[i].roles = newRole[i]
        // } 
    }
}