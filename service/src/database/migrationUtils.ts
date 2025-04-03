import { exec } from "child_process";
import path from "path";
import { AppDataSource } from "./dataSource";
import { getConfig } from "../config/config.server";
import { spawn } from "child_process";

// Wrap the exec commands in a Promise so program waits for it to finish

export async function handleMigrations(): Promise<void> {
    try {
        // Ensure the DataSource is initialized
        if (!AppDataSource.isInitialized) {
            console.log(`DataSource is not initialized, initializing now...`);
            await AppDataSource.initialize();
        }

        await buildMigrations();
        await buildDataSource();
        await runMigrations();
    } catch (error) {
        console.error("Migration handling failed:", error);
    }
}

async function buildMigrations(): Promise<void> {
    const migrationsDir = path.resolve(__dirname,  `../service/src/database/migrations/*`);
    const buildMigrationsDir = path.resolve(__dirname, "../service/dist/migrations");

    const command = `npx tsup ${migrationsDir} --format cjs,esm --dts --out-dir ${buildMigrationsDir}`;

    // Execute command in the directory of service so tsup is available
    const serviceDir = path.resolve(__dirname, "../service/");
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
    const dataSourcePath = path.resolve(__dirname, "../service/src/database/dataSourceRef.ts");
    const distDir = path.resolve(__dirname, "../service/dist");

    const command = `npx tsup ${dataSourcePath} --format cjs,esm --dts --out-dir ${distDir}`;
    
    // Execute command in the directory of service so tsup is available
    const serviceDir = path.resolve(__dirname, "../service/");
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
    const dataSourcePath = path.resolve(__dirname, "../service/dist/dataSourceRef.js");

    // Add User_Config to ENV so spawned process has access to config developer provided (needed for User migration)
    const USER_CONFIG = JSON.stringify(getConfig());
    return new Promise((resolve, reject) => {
        // Use spawn here as it might be interactive prompt 
        const child = spawn("npx.cmd", ["typeorm", "migration:run", "-d", dataSourcePath], {
            env: { ...process.env, USER_CONFIG },
            stdio: "inherit",
        });
        child.on("close", (code) => {
            if (code === 0) {
                console.log("Migration run successfully.");
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

