import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumn,
    TableColumnOptions,
} from "typeorm";
import { isDefault, getConfigVariable, setConfig } from "../../config/config.server";
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

            console.log("Columns added:", columns.map(col => col.name).join(", "));

        } else {
            console.warn("Table 'users' detected. Checking presence of required and provided columns.");

            // Check if the table has the required columns.
            const columnNames = columns.map(col => col.name);
            const existingColumnNames = table.columns.map(column => column.name);
            const columnsToAddNames = columnNames.filter(column => !existingColumnNames.includes(column));

            if (columnsToAddNames.length > 0) {
                console.warn(`Missing columns in 'users' table: ${columnsToAddNames.join(", ")}`);

                const userWantsToAddColumns = await promptUser(
                    `Do you want to add these columns? Choose 'n' if you want to change custom mapping (y/n): `
                );

                if (!userWantsToAddColumns) {
                    throw new Error('Canceled to provide custom User entity. Exiting...');
                } 
            } else {
                console.warn("All required columns are present in the 'users' table. No changes needed.");
                return;
            }

            const columnsToAdd = columns.filter(col => columnsToAddNames.includes(col.name));
            
            // Check if the table already has records.
            const rowCount = await queryRunner.manager
                .createQueryBuilder()
                .select("COUNT(*)", "count") // Select the count of rows
                .from(table.name, "t") // Use the table name dynamically
                .getRawOne(); // Execute the query and get the result

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

            console.log("Columns added:", columnsToAdd.map(col => col.name).join(", "));
        }

        console.log("Migration for User table completed successfully.");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("users");
        if (!table) {
            console.warn("Table 'users' does not exist. Skipping down migration.");
            return;
        }

        const migrationsTable = await queryRunner.getTable("chat_migrations");
        if (!migrationsTable) {
            console.warn("Table 'chat_migrations' does not exist. Something went wrong while finishing User migration. Please provide added column names to new column 'columns' in chat_migrations table manually to resolve.");
            return;
        }

        const migrationName = "UserMigration%"; // Use a wildcard to match names starting with "UserMigration"
        const records = await queryRunner.query(
            `SELECT * FROM chat_migrations WHERE name LIKE ?`,
            [migrationName]
        );

        if (records.length === 0) {
            console.warn(`No record found in 'chat_migrations' table with name '${migrationName}'.`);
            return;
        }
        const record = records[0];

        // Get stored added column names from the 'chat_migrations' table.
        const columnsToRemove = record.columns.split(",").map((col: string) => col.trim());

        // If all columns in the 'users' table are marked for removal, drop the table.
        const userTableColumnNames = table.columns.map((col) => col.name);
        const allColumnsToRemove = userTableColumnNames.every((colName) => columnsToRemove.includes(colName));
        if (allColumnsToRemove) {
            console.log("All columns in the 'users' table are marked for removal. Dropping the table...");
            await queryRunner.dropTable("users");
            console.log("Table 'users' dropped successfully.");
            return;
        }
        
        // Otherwise, drop only the specified columns.
        for (const colName of columnsToRemove) {
            const column = table.columns.find(c => c.name === colName);
            if (column) {
                console.log(`Dropping column "${colName}" from 'users' table.`);
                await queryRunner.dropColumn("users", colName);
            }
        }
    }

    buildUserTableColumns() : TableColumnOptions[] {
        // Even though config gets set by dataSourceRef right after command execution within runMigration(), its not present within this migration.
        // So we need to set it again here. 
        const ENVConfig = process.env.USER_CONFIG;
        if (ENVConfig) {
            setConfig(JSON.parse(ENVConfig));
        }
        
        if (!isDefault("user_mapping")) {
            console.warn("Custom mapping provided. Using custom User entity.");
        } else {
            console.warn("No custom mapping provided. Using default User entity.");
        }

        const mapping: UserFieldMapping = getConfigVariable("user_mapping");

        const columns: TableColumnOptions[] = Object.values(mapping).map(column =>
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
