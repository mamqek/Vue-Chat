import { setConfig } from "../config/config.server";
import { AppDataSource, initDatasource } from "./dataSource";

// Extract the configuration from the environment variable
const userConfig = process.env.USER_CONFIG ? JSON.parse(process.env.USER_CONFIG) : null;
if (userConfig) {
    // Adjust the DB_PATH to point to the correct location
    userConfig.DB_PATH = "../" + userConfig.DB_PATH; 
    setConfig(userConfig);
}

async function initializeDataSource() {
    await initDatasource();
}

initializeDataSource();

export { AppDataSource };