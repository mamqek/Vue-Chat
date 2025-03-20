// src/multerConfig.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getConfigVariable } from './config';

// TODO: alighn path passed to config with this to allow user to put uploads folder in their project instead of node_moduels
const uploadDir = path.resolve(__dirname, `../../${getConfigVariable('UPLOAD_DIR')}`);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// For in-memory storage (files will be stored in req.file(s) as Buffer):
export const upload = multer({
  storage: multer.memoryStorage(),
});

// Or for disk storage, for example:
export const uploadDisk = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir); // Make sure this directory exists
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
  }),
});