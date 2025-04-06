#!/usr/bin/env node

//EXPORT TO NPM COMMAND
// Check if the file is being executed directly
if (require.main === module) {
    // Call the handleMigrations function

    const args = process.argv.slice(2); // Get command-line arguments (excluding "node" and the script path)

    if (args.includes("--run")) {
        try {
            runMigrations();
        } catch (error) {
            console.error("Migration running failed:", error);
        }
    } else {
        // If the "--other" flag is passed, execute other logic
        handleMigrations().catch((error) => {
            console.error("Error during migration compilation process", error);
            process.exit(1);
        });

    }
}

import path from "path";
import { getConfig } from "../config/config.server";
import { spawn, exec } from "child_process";
import { AppDataSource } from "./dataSource";
import { TableColumn } from "typeorm";


// Wrap the exec commands in a Promise so program waits for it to finish
// TODO: add revert method to revert migrations
// TODO: test with postgres and mysql

export async function handleMigrations(): Promise<void> {
    try {
        await buildMigrations();
        await buildDataSource();
        await runMigrations();
    } catch (error) {
        console.error("Migration handling failed:", error);
    }
}

async function buildMigrations(): Promise<void> {
    const migrationsDir = path.resolve(__dirname,  `../src/database/migrations/*`);
    const buildMigrationsDir = path.resolve(__dirname, "../dist/migrations");

    const command = `npx tsup ${migrationsDir} --format cjs,esm --dts --out-dir ${buildMigrationsDir}`;

    // Execute command in the directory of service so tsup is available
    const serviceDir = path.resolve(__dirname, "../");
    return new Promise((resolve, reject) => {
        exec(command, { cwd: serviceDir }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error building migrations: ${error.message}`);
                reject(error); 
                return;
            }
            if (stderr) {
                console.error(`Error: ${stderr}`);
                reject(new Error(stderr));
                return;
            }
            console.log(`Migrations has been successfully build.`);
            resolve();
        });
    });
}

async function buildDataSource(): Promise<void> {
    console.log(`Building datasource`);
    const dataSourcePath = path.resolve(__dirname, "../src/database/dataSourceRef.ts");
    const distDir = path.resolve(__dirname, "../dist");

    const command = `npx tsup ${dataSourcePath} --format cjs,esm --dts --out-dir ${distDir}`;
    
    // Execute command in the directory of service so tsup is available
    const serviceDir = path.resolve(__dirname, "../");
    return new Promise((resolve, reject) => {
        exec(command, { cwd: serviceDir }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error compiling datasource: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`Error: ${stderr}`);
                reject(new Error(stderr));
                return;
            }
            console.log(`Datasource has been successfully built.`);
            resolve(); 
        });
    });
}

async function runMigrations(): Promise<void> {
    console.log("Running migrations...");
    const dataSourcePath = path.resolve(__dirname, "../dist/dataSourceRef.js");

    // Add User_Config to ENV so spawned process has access to config developer provided (needed for User migration)
    const USER_CONFIG = JSON.stringify(getConfig());
    return new Promise((resolve, reject) => {
        // Use spawn here as it might be interactive prompt 
        const child = spawn("npx.cmd", ["typeorm", "migration:run", "-d", dataSourcePath], {
            env: { ...process.env, USER_CONFIG },
            stdio: ['inherit', 'pipe', 'pipe'], // Capture stdout and stderr
        });

        let addedColumnsNames: string | null = null;
        let migrationsCompleted = 0;
        child.stdout.on("data", (data) => {
            if (data.toString().includes("Migration for")) {
                console.log(data.toString()); // Log the output to the console
                migrationsCompleted++;
            } else if (data.toString().includes("Columns added:")) {    // for users migration, save which columns were added to the table
                addedColumnsNames = data.toString().split("Columns added:")[1].trim();
            }
        });

        child.stderr.on("data", (data) => {
            console.error(data.toString());
        });

        child.on("close", (code) => {

            if (code === 0) {
                if (addedColumnsNames) {
                    saveAddedUserColumns(addedColumnsNames).catch((error) => {
                        console.error("Error saving added user columns:", error);
                    });
                }
                if (migrationsCompleted === 0) {
                    console.log("All migrations are already up to date.");
                } else {
                    console.log(`${migrationsCompleted} migrations run successfully.`);
                }
                resolve();
            } else {
                reject(new Error(`Migration process exited with code ${code}`));
            }
        });

        child.on("error", (error) => {
            console.error(`Error running migrations: ${error.message}`);
            reject(error);
        });
    });
}


async function saveAddedUserColumns(addedColumnsNames: string | null): Promise<void> {
    try {
        console.log("Checking and updating the 'chat_migrations' table...");

        const queryRunner = AppDataSource.createQueryRunner();

        // Check if the `chat_migrations` table exists
        const table = await queryRunner.getTable("chat_migrations");
        if (!table) {
            console.warn("The 'chat_migrations' table does not exist. Skipping update.");
            await queryRunner.release();
            return;
        }

        // Check if the `columns` column exists in the `chat_migrations` table
        const columnExists = table?.columns.some((col) => col.name === "columns");
        if (!columnExists) {
            console.log("Adding 'columns' column to the 'chat_migrations' table...");
            await queryRunner.addColumn(
                "chat_migrations",
                new TableColumn({
                    name: "columns",
                    type: "text",
                    isNullable: true, // Make the column nullable
                })
            );
        }

        const migrationNamePrefix = "UserMigration%"; 
        const records = await queryRunner.query(
            `SELECT * FROM chat_migrations WHERE name LIKE ?`,
            [migrationNamePrefix]
        );
        if (records.length === 0) {
            console.warn(`No record found in 'chat_migrations' table with prefix '${migrationNamePrefix}'.`);
        } else {
            const migrationName =records[0].name;
            console.log(`Found record for migration '${migrationName}'. Updating 'columns' field...`);

            // Update the `columns` field with `addedColumnsNames`
            await queryRunner.query(
                `UPDATE chat_migrations SET columns = ? WHERE name = ?`,
                [addedColumnsNames, migrationName]
            );
            console.log(`'columns' field updated successfully.`);
            console.log(`Added columns names: ${addedColumnsNames}`); // Log the output to the console

            console.log(`Record for migration '${migrationName}' updated successfully.`);
        }

        // Release the query runner after use
        await queryRunner.release();
    } catch (error) {
        console.error("Error updating the 'chat_migrations' table:", error);
    }
}


