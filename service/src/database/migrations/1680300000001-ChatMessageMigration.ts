import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex,
    TableForeignKey,
} from "typeorm";

export class ChatMessageMigration1680300000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "chat_messages",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "chat_id",
                        type: "int",
                    },
                    {
                        name: "sender_id",
                        type: "int",
                    },
                    {
                        name: "receiver_id",
                        type: "int",
                    },
                    {
                        name: "replied_to",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "text",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "attachment",
                        type: "text", // simple-json is stored as text
                        isNullable: true,
                    },
                    {
                        name: "deleted",
                        type: "boolean",
                        default: false,
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

        // Create indices.
        await queryRunner.createIndex(
            "chat_messages",
            new TableIndex({
                name: "IDX_CHAT_MESSAGE_CHAT",
                columnNames: ["chat_id"],
            }),
        );
        await queryRunner.createIndex(
            "chat_messages",
            new TableIndex({
                name: "IDX_CHAT_MESSAGE_REPLIED_TO",
                columnNames: ["replied_to"],
            }),
        );

        // Foreign key: chat_id references chats.
        await queryRunner.createForeignKey(
            "chat_messages",
            new TableForeignKey({
                columnNames: ["chat_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "chats",
                onDelete: "CASCADE",
            }),
        );

        // Self-referencing foreign key: replied_to references chat_messages.
        await queryRunner.createForeignKey(
            "chat_messages",
            new TableForeignKey({
                columnNames: ["replied_to"],
                referencedColumnNames: ["id"],
                referencedTableName: "chat_messages",
                onDelete: "CASCADE",
            }),
        );

        console.log("Migration for ChatMessage table completed successfully.");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("chat_messages");

        if (!table) {
            console.warn("Table 'chat_messages' does not exist. Skipping 'down' migration.");
            return;
        }

        // Drop self-referencing foreign key for replied_to.
        const fkRepliedTo = table.foreignKeys.find(
            (fk) =>
                fk.columnNames.indexOf("replied_to") !== -1 &&
                fk.referencedTableName === "chat_messages",
        );
        if (fkRepliedTo) {
            await queryRunner.dropForeignKey("chat_messages", fkRepliedTo);
        }

        // Drop foreign key for chat_id.
        const fkChat = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("chat_id") !== -1,
        );
        if (fkChat) {
            await queryRunner.dropForeignKey("chat_messages", fkChat);
        }

        // Drop indices.
        await queryRunner.dropIndex("chat_messages", "IDX_CHAT_MESSAGE_CHAT");
        await queryRunner.dropIndex("chat_messages", "IDX_CHAT_MESSAGE_REPLIED_TO");

        // Drop the table.
        await queryRunner.dropTable("chat_messages");
    }
}
