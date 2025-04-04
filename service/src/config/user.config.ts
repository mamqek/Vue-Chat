import { getMetadataArgsStorage } from 'typeorm';
import { Entity, Column } from "typeorm";
import { UserFieldMapping, ColumnOptions } from '../types/UserConfig';
import { BaseUser } from '../entities/BaseUser';


export function addEntityMetadata(target: Function, tableName: string = 'users') {
    const metadata = getMetadataArgsStorage();

    // Define the table
    metadata.tables.push({
        target,
        name: tableName,
        type: 'regular',
    });

    // // Dynamically extract column names from the class
    // const instance = new (target as any)();
    // const columnNames = Object.keys(instance);

    // console.log('Column names:', columnNames);

    // // Define the columns dynamically
    // for (const columnName of columnNames) {
    //     metadata.columns.push({
    //         target,
    //         propertyName: columnName,
    //         mode: 'regular',
    //         options: { type: 'text' }, // Default to 'text', can be customized
    //     });
    // }

    // Dynamically extract column names from the class prototype (use prototype to exclude BaseUser constructor invocation)
    const prototype = target.prototype;
    const columnNames = Object.getOwnPropertyNames(prototype)
        .filter((key) => key !== 'constructor' && typeof prototype[key] === 'undefined'); // Exclude methods and constructor

    console.log('Column names:', columnNames);

    // Define the columns dynamically
    for (const columnName of columnNames) {
        metadata.columns.push({
            target,
            propertyName: columnName,
            mode: 'regular',
            options: { type: 'text' }, // Default to 'text', can be customized
        });
    }
}


export function generateCustomUserClass(
    fieldMapping: UserFieldMapping,
    tableName: string = "users"
): new () => BaseUser {
    // Dynamically create a new class that extends BaseUser
    @Entity({ name: tableName })
    class CustomUser extends BaseUser {
        constructor() {
            super();
            // Dynamically initialize fields based on the mapping
            for (const columnOptions of Object.values(fieldMapping) as ColumnOptions[]) {
                if (!(columnOptions.name in this)) {
                    Object.defineProperty(this, columnOptions.name, {
                        value: undefined, // Leave fields undefined
                        writable: true,
                        enumerable: true,
                        configurable: true,
                    });
                }            
            }
        }

        // Provide dummy implementations to satisfy TypeScript
        full_name!: string;
        avatar!: string;
        bio!: string;
    }

    // Dynamically define columns and getters/setters
    for (const [columnName, columnOptions ] of Object.entries(fieldMapping) as [keyof UserFieldMapping, ColumnOptions][]) {
        // Define a TypeORM column for the actual field
        Column({ 
            type: "text", 
            nullable: columnOptions?.isNullable, 
            default: columnOptions?.default 
        })(CustomUser.prototype, columnOptions.name);

        // Define the getter and setter for the abstract property
        Object.defineProperty(CustomUser.prototype, columnName, {
            get() {
                return this[columnOptions.name];
            },
            set(value: any) {
                this[columnOptions.name] = value;
            },
            enumerable: true,
            configurable: true,
        });
    }
    return CustomUser as new () => BaseUser;
}
