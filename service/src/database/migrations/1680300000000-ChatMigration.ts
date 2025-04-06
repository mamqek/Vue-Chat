import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex,
    TableForeignKey,
} from "typeorm";

export class ChatMigration1680300000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.getTable("chats")) {
            console.warn("Table 'chats' already exists. Skipping 'up' migration.");
            return;
        }

        await queryRunner.createTable(
            new Table({
                name: "chats",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "user1_id",
                        type: "int",
                    },
                    {
                        name: "user2_id",
                        type: "int",
                    },
                    {
                        name: "user1_unread_count",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "user2_unread_count",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "last_message_id",
                        type: "int",
                        isNullable: true,
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
                ],
            }),
            true,
        );

        // Create indices for foreign keys.
        await queryRunner.createIndex(
            "chats",
            new TableIndex({
                name: "IDX_CHAT_USER1",
                columnNames: ["user1_id"],
            }),
        );
        await queryRunner.createIndex(
            "chats",
            new TableIndex({
                name: "IDX_CHAT_USER2",
                columnNames: ["user2_id"],
            }),
        );
        await queryRunner.createIndex(
            "chats",
            new TableIndex({
                name: "IDX_CHAT_LAST_MESSAGE",
                columnNames: ["last_message_id"],
            }),
        );

        // Create foreign key for user1_id.
        await queryRunner.createForeignKey(
            "chats",
            new TableForeignKey({
                columnNames: ["user1_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users", // adjust if needed
                onDelete: "CASCADE",
            }),
        );

        // Create foreign key for user2_id.
        await queryRunner.createForeignKey(
            "chats",
            new TableForeignKey({
                columnNames: ["user2_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users", // adjust if needed
                onDelete: "CASCADE",
            }),
        );

        // Create foreign key for last_message_id.
        await queryRunner.createForeignKey(
            "chats",
            new TableForeignKey({
                columnNames: ["last_message_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "chat_messages", // adjust if needed
                onDelete: "SET NULL",
            }),
        );

        console.log("Migration for Chat table completed successfully.");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("chats");

        if (!table) {
            console.warn("Table 'chats' does not exist. Skipping 'down' migration.");
            return;
        }

        // Drop foreign key for last_message_id.
        const fkLastMessage = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("last_message_id") !== -1,
        );
        if (fkLastMessage) {
            await queryRunner.dropForeignKey("chats", fkLastMessage);
        }

        // Drop foreign key for user1_id.
        const fkUser1 = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("user1_id") !== -1,
        );
        if (fkUser1) {
            await queryRunner.dropForeignKey("chats", fkUser1);
        }

        // Drop foreign key for user2_id.
        const fkUser2 = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("user2_id") !== -1,
        );
        if (fkUser2) {
            await queryRunner.dropForeignKey("chats", fkUser2);
        }

        // Drop indices.
        await queryRunner.dropIndex("chats", "IDX_CHAT_USER1");
        await queryRunner.dropIndex("chats", "IDX_CHAT_USER2");
        await queryRunner.dropIndex("chats", "IDX_CHAT_LAST_MESSAGE");

        // Drop the table.
        await queryRunner.dropTable("chats");

        console.log("Revert migration for Chat table completed successfully.");
    }
}
