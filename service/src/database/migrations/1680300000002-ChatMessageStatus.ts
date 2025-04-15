import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from "typeorm";

export class ChatMessageStatusMigration1680300000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.getTable("chat_message_statuses")) {
            console.warn("Table 'chat_message_statuses' already exists. Skipping 'up' migration.");
            return;
        }

        await queryRunner.createTable(
            new Table({
                name: "chat_message_statuses",
                columns: [
                    {
                        name: "message_id",
                        type: "integer",
                        isPrimary: true,
                    },
                    {
                        name: "receiver_id",
                        type: "integer",
                        isPrimary: true,
                    },
                    {
                        name: "status",
                        type: "text",
                        default: "'sent'",
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

        await queryRunner.createForeignKey(
            "chat_message_statuses",
            new TableForeignKey({
                columnNames: ["message_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "chat_messages",
                onDelete: "CASCADE",
            }),
        );

        console.log("Migration for ChatMessageStatus table completed successfully.");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("chat_message_statuses");

        if (!table) {
            console.warn("Table 'chat_message_statuses' does not exist. Skipping 'down' migration.");
            return;
        }

        const fkMessage = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("message_id") !== -1,
        );
        if (fkMessage) {
            await queryRunner.dropForeignKey("chat_message_statuses", fkMessage);
        }

        await queryRunner.dropTable("chat_message_statuses");

        console.log("Revert migration for ChatMessageStatus table completed successfully.");
    }
}
