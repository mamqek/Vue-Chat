import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumn,
    TableColumnOptions,
} from "typeorm";
import { isDefault, getConfigVariable, setConfig } from "../../config/config.server";
import { promptUser } from "../../helper";
import { UserFieldMapping } from "../../types/UserConfig";


export class UserMigration1680300000005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        let addedColumns = "";

        try {
            await queryRunner.startTransaction();
            this.setUserConfig();
            const columns = this.buildUserTableColumns();
            const table_name = getConfigVariable("user_table_name");

            console.warn("Looking for existing User table.");
            const table = await queryRunner.getTable(table_name);
            if (!table) {
                const userWantsToCreateUsersTable = await promptUser(
                    `Table ${table_name} does not exist. It will be created with following columns: ${columns.map(col => col.name).join(", ")}. Is this correct? Press 'y' to proceed or 'n' if you want to change custom mapping (y/n): `
                );

                if (!userWantsToCreateUsersTable) {
                    throw new Error('Canceled to provide custom mapping. Exiting...');
                }

                await queryRunner.createTable(
                    new Table({
                        name: table_name,
                        columns: [
                            ...columns,
                        ],
                    }),
                    true,
                );

                addedColumns = columns.map(col => col.name).join(", ");
            } else {
                console.warn(`Table ${table_name} detected. Checking presence of required and provided columns.`);

                // Check if the table has the required columns.
                const columnNames = columns.map(col => col.name);
                const existingColumnNames = table.columns.map(column => column.name);
                const columnsToAddNames = columnNames.filter(column => !existingColumnNames.includes(column));

                if (columnsToAddNames.length > 0) {
                    console.warn(`Missing columns in ${table_name} table: ${columnsToAddNames.join(", ")}`);

                    const userWantsToAddColumns = await promptUser(
                        `Do you want to add these columns? Choose 'n' if you want to change custom mapping (y/n): `
                    );

                    if (!userWantsToAddColumns) {
                        throw new Error('Canceled to provide custom User entity. Exiting...');
                    } 
                } else {
                    console.warn(`All required columns are present in the ${table_name} table. No changes needed.`);
                    return;
                }

                const columnsToAdd = columns.filter(col => columnsToAddNames.includes(col.name));
                
                // Check if the table already has records.
                const rowCount = await queryRunner.manager
                    .createQueryBuilder()
                    .select("COUNT(*)", "count")
                    .from(table.name, "t")
                    .getRawOne();
                if (rowCount > 0) {
                    console.log(`Table ${table_name} already has ${rowCount} records. Checking for default values or nullable columns.`);
                    for (const column of columnsToAdd) {
                        if (column.default === undefined && column.isNullable !== true) {
                            throw new Error(
                                `Cannot add column "${column.name}" to a non-empty table without a default value or nullable flag.`
                            );
                        }
                    }
                }

                for (const column of columnsToAdd) {
                    await queryRunner.addColumn(
                        table_name,
                        new TableColumn(column),
                    );
                }

                addedColumns = columnsToAdd.map(col => col.name).join(", ");
            }

            await this.storeColumnInformation(queryRunner, addedColumns);
        
            await queryRunner.commitTransaction();
            console.log("Migration for User table completed successfully.");
        } catch (error) {
            console.error("Error during migration:", error);
            await queryRunner.rollbackTransaction();
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        this.setUserConfig();

        const migrationRecord = await this.userMigrationRecord(queryRunner);
        const savedTableName = migrationRecord.table_name;
        const configTableName = getConfigVariable("user_table_name");

        if (savedTableName !== configTableName) {
            console.warn(`Table name in migration record (${savedTableName}) does not match current config (${configTableName}). Skipping down migration.`);
            return;
        }

        const userTable = await queryRunner.getTable(savedTableName);
        if (!userTable) {
            console.warn(`Table ${savedTableName} does not exist. Skipping down migration.`);
            return;
        }

        let columnToRemoveNames: string[] = [];
        try {
            if (migrationRecord.columns) {
                columnToRemoveNames = migrationRecord.columns.split(",").map((col: string) => col.trim());
            } else {
                throw new Error("No column information found in migration record");
            }
        } catch (error) {
            console.warn(`Could not retrieve column information: ${error}`);
            // Last resort: Derive from current mapping
            console.warn("Using current mapping as last resort for column information");
            const columns = this.buildUserTableColumns();
            columnToRemoveNames = columns.map(col => col.name);
            
            // Confirm with user before proceeding
            const confirmMessage = `Could not find reliable column information. Will attempt to drop these columns: ${columnToRemoveNames.join(", ")}. Proceed? (y/n): `;
            const userConfirms = await promptUser(confirmMessage);
            
            if (!userConfirms) {
                throw new Error("User canceled migration reversion");
            }
        }

        const userTableColumnNames = userTable.columns.map((col) => col.name);

        // If all columns in the 'users' table are marked for removal, drop the table.
        if (userTableColumnNames.every((colName) => columnToRemoveNames.includes(colName))) {
            console.log(`All columns in the ${savedTableName} table are marked for removal. Dropping the table...`);
            await queryRunner.dropTable(savedTableName);
            console.log(`Table ${savedTableName} dropped successfully.`);
            return;
        }
        
        for (const colName of columnToRemoveNames) {
            const column = userTable.columns.find(c => c.name === colName);
            if (column) {
                console.log(`Dropping column "${colName}" from ${savedTableName} table.`);
                await queryRunner.dropColumn(savedTableName, colName);
            }
        }

        console.log("Revert migration for User table completed successfully.");
    }


    private buildUserTableColumns() : TableColumnOptions[] {
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

    // Store columns added and table name while migration to chat_migrations table.
    // Its required to clean revert migration, even if user changed something in the config 
    private async storeColumnInformation(queryRunner: QueryRunner, columnsAdded: string): Promise<void> {
        const table = await queryRunner.getTable("chat_migrations");
        if (!table) {
            throw new Error("Table 'chat_migrations' does not exist. Cannot store column information.");
        }

        if (!table?.columns.some((col) => col.name === "columns")) {
            await queryRunner.addColumn(
                "chat_migrations",
                new TableColumn({
                    name: "columns",
                    type: "text",
                    isNullable: true,
                })
            );
        }
        if (!table.columns.some((col) => col.name === "table_name")) {
            await queryRunner.addColumn(
                "chat_migrations",
                new TableColumn({
                    name: "table_name",
                    type: "text",
                    isNullable: true,
                })
            );
        }

        const migrationName = this.constructor.name;
        const timestamp = migrationName.match(/\d+$/)?.[0] || Date.now().toString();

        await queryRunner.query(
            `INSERT INTO chat_migrations (name, timestamp, columns, table_name) VALUES (?, ?, ?, ?)`,
            [migrationName, timestamp, columnsAdded, getConfigVariable("user_table_name")],
        );
    }

    async userMigrationRecord(queryRunner: QueryRunner): Promise<any> { 
        const migrationNamePrefix = "UserMigration%"; 
        const records = await queryRunner.query(
            `SELECT * FROM chat_migrations WHERE name LIKE ?`,
            [migrationNamePrefix]
        );
        if (records.length === 0) {
            throw new Error(`No record found in 'chat_migrations' table with prefix '${migrationNamePrefix}'.`);
        }
        return records[0];
    }

    // Even though config gets set by dataSourceRef right after command execution within runMigration(), its not present within this migration.
    // So we need to set it again here. 
    setUserConfig() {
        const ENVConfig = process.env.USER_CONFIG;
        if (ENVConfig) {
            setConfig(JSON.parse(ENVConfig));
        }
    }
    
}
