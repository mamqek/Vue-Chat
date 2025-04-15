// This file is used to set the __dirname variable in a way that works for both CommonJS and ESM modules.
// and provide file extension for the built files to be used
import path from 'path';
import { fileURLToPath } from 'url';

const isCommonJS: boolean = typeof __dirname !== 'undefined';
// console.warn("isCommonJS", isCommonJS, global.__dirname);
// console.trace(`[compat/init trace] PID: ${process.pid}`);

if (!global.__dirname) {
    if (!isCommonJS) {
        try {
            const __filename = fileURLToPath(import.meta.url);
            global.__dirname = path.dirname(__filename);
        } catch (error) {
            console.error("Error in ESM path resolution:", error);
        }
    } else {
        global.__dirname = __dirname;
    }
}

// As package.json has type: "module", js is for ESM, cjs is for CommonJS
export const builtFileExtension = isCommonJS ? 'cjs' : 'js';

export { isCommonJS };
