// load __dirname resolution
import 'reflect-metadata';

import '../config/CJSandESMCompatibility';

import { setConfig } from "../config/config.server";
import { AppDataSource, initDatasource } from "./dataSource";

// Extract the configuration from the environment variable
if (process.env.USER_CONFIG) {
   setConfig(JSON.parse(process.env.USER_CONFIG));
}

initDatasource();

export { AppDataSource };