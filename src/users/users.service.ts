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

    

        // for( let i = 0; i < users.length; i++){
        //     let newArr = []
        //     console.log(users[i], "i<<<<<<<<<")
        //     if(users.id[i] === users.id[i]){
                
        //     }
        // }

        // console.log(users.id)

        // let Arr = users.reduce(function (newArr, user) {
        //     if (user.roles === user.roles) {
        //       newArr.push(user.roles);
        //     }
        //     return newArr;
        //   }, []);




  


        return users;

        // return users.reduce((previousValue, currentValue) => previousValue.concat(currentValue))

        // users.forEach(user => {
        //     const roless = user.roles.map(role => {
        //         return (role.value)
        //     });
        //     // user.setDataValue('roles', roles);
        //     user.roles = roless;
        // });
        // return users;


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
