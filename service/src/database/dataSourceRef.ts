// As this file acts as an entry point for migrations process 
// load __dirname resolution
import '../config/CJSandESMCompatibility';
// and reflect-metadata for TypeORM
import 'reflect-metadata';

import { setConfig } from "../config/config.server";
import { AppDataSource, initDatasource } from "./dataSource";

if (process.env.USER_CONFIG) {
   setConfig(JSON.parse(process.env.USER_CONFIG));
}

initDatasource();

export { AppDataSource };