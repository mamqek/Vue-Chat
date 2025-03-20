// src/types/express/index.d.ts
import { File } from 'multer';

declare global {
  namespace Express {
    export interface Request {
      file?: File;
      files?: File[] | { [fieldname: string]: File[] };
    }
  }
}
