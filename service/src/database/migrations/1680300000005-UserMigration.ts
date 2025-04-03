import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumn,
    TableColumnOptions,
} from "typeorm";
import { getDefaultConfig, isDefault } from "../../config/config.server";
import { promptUser } from "../dataSource";
import { UserFieldMapping } from "../../types/UserConfig";



export class UserMigration1680300000005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const columns = this.buildUserTableColumns();
        
        console.warn("Looking for existing User table.");
        const table = await queryRunner.getTable("users");
        if (!table) {
            const userWantsToCreateUsersTable = await promptUser(
                `Table 'users' does not exist. It will be created with following columns: ${columns.map(col => col.name).join(", ")}. Is this correct? Press 'y' to proceed or 'n' if you want to change custom mapping (y/n): `
            );

            if (!userWantsToCreateUsersTable) {
                throw new Error('Canceled to provide custom mapping. Exiting...');
            }

            await queryRunner.createTable(
                new Table({
                    name: "users",
                    columns: [
                        ...columns,
                    ],
                }),
                true,
            );
        } else {
            console.warn("Table 'users' detected. Checking presence of required and provided columns.");

            // Check if the table has the required columns.
            const columnNames = columns.map(col => col.name);
            const existingColumnNames = table.columns.map(column => column.name);
            const missingColumnNames = columnNames.filter(column => !existingColumnNames.includes(column));

            if (missingColumnNames.length > 0) {
                console.warn(`Missing columns in 'users' table: ${missingColumnNames.join(", ")}`);

                const userWantsToAddColumns = await promptUser(
                    `Do you want to add these columns? Choose 'n' if you want to change custom mapping (y/n): `
                );

                if (!userWantsToAddColumns) {
                    throw new Error('Canceled to provide custom User entity. Exiting...');
                } 
            }

            const columnsToAdd = columns.filter(col => missingColumnNames.includes(col.name));
            
            // Check if the table already has records.
            const records = await queryRunner.query(`SELECT COUNT(*) as count FROM "users"`);
            const rowCount = parseInt(records[0].count, 10);
            if (rowCount > 0) {
                console.log(`Table 'users' already has ${rowCount} records. Checking for default values or nullable columns.`);
                for (const column of columnsToAdd) {
                    // If there are records, for each column to be added, ensure it has a default or is nullable.
                    if (column.default === undefined && column.isNullable !== true) {
                        throw new Error(
                            `Cannot add column "${column.name}" to a non-empty table without a default value or nullable flag.`
                        );
                    }
                }
            }

            // Add missing columns to the table.
            for (const column of columnsToAdd) {
                await queryRunner.addColumn(
                    "users",
                    new TableColumn(column),
                );
            }

        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("users");
        if (!table) {
            console.warn("Table 'users' does not exist. Skipping down migration.");
            return;
        }

        // Define the column names we want to remove.
        const columnsToRemove = ["full_name", "avatar", "bio"];

        for (const colName of columnsToRemove) {
            const column = table.columns.find(c => c.name === colName);
            if (column) {
                console.log(`Dropping column "${colName}" from 'users' table.`);
                await queryRunner.dropColumn("users", colName);
            }
        }

        // Check if only the core columns remain.
        const remainingColumnNames = table.columns.map(c => c.name);
        const coreColumns = ["id", "created_at", "updated_at"];
        const onlyCoreRemain =
            remainingColumnNames.length === coreColumns.length &&
            coreColumns.every(name => remainingColumnNames.includes(name));

        if (onlyCoreRemain) {
            console.log(`Only core columns (${coreColumns.join(", ")}) remain. Dropping the 'users' table.`);
            await queryRunner.dropTable("users");
        } else {
            console.log("Other columns still exist. Not dropping the table.");
        }
    }

    buildUserTableColumns() : TableColumnOptions[] {
        const defaultMapping: UserFieldMapping = getDefaultConfig().User.field_mapping;

        const mappingString = process.env.USER_CONFIG;
        let customMapping: any;
        if (mappingString) {
            try {
                customMapping = JSON.parse(mappingString);
                console.warn("Custom mapping provided. Using custom User entity.");

            } catch (err) {
                throw new Error("Invalid MAPPING JSON provided in environment variables.");
            }
        } else {
            console.warn("No custom mapping provided. Using default User entity.");
        }

        // const customMapping: UserFieldMapping | undefined = getConfigVariable("User").field_mapping;
        
        
        if (!isDefault("User")) {
            console.warn("Custom mapping provided. Using custom User entity.");
        } else {
            console.warn("No custom mapping provided. Using default User entity.");
        }

        console.warn("Custom mapping provided in environment variables:", customMapping);
        console.warn("User:", customMapping.User.field_mapping.full_name);
        
        customMapping = customMapping?.User?.field_mapping;
        // For each key in the default mapping, use the custom mapping if provided,
        // otherwise fallback to the default mapping.
        const mergedMapping: Partial<UserFieldMapping> = {};
        (Object.keys(defaultMapping) as (keyof UserFieldMapping)[]).forEach(key => {
            mergedMapping[key] = customMapping && customMapping[key] ? customMapping[key] : defaultMapping[key];
        });

        const columns: TableColumnOptions[] = Object.values(mergedMapping).map(column =>
            ({ ...column, type: "text" })
        );

        columns.push(
            {
                name: "id",
                type: "integer",
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment",
            },
            {
                name: "created_at",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
            },
            {
                name: "updated_at",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
            },
        );

        return columns;
    }
}
