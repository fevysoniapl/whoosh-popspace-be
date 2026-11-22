import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const STORAGE_ROOT = path.resolve('storage');
const PROPOSAL_DIR = path.join(STORAGE_ROOT, 'proposals');
const BOOTH_IMAGE_DIR = path.resolve('public/uploads/booths');

fs.mkdirSync(PROPOSAL_DIR, { recursive: true });
fs.mkdirSync(BOOTH_IMAGE_DIR, { recursive: true });

function diskStorage(dir) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) =>
      cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase()),
  });
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

export const proposalUpload = multer({
  storage: diskStorage(PROPOSAL_DIR),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === 'application/pdf' &&
      path.extname(file.originalname).toLowerCase() === '.pdf';
    if (!isPdf) {
      return cb(badRequest('Proposal harus berupa file PDF'));
    }
    cb(null, true);
  },
});

export const boothImageUpload = multer({
  storage: diskStorage(BOOTH_IMAGE_DIR),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(badRequest('Foto booth harus berupa JPEG, PNG, atau WebP'));
    }
    cb(null, true);
  },
});

export function discardUpload(req) {
  if (req.file) {
    fs.promises.unlink(req.file.path).catch(() => {});
  }
}

export function removeStoredFile(relativePath) {
  if (!relativePath) return;
  fs.promises.unlink(path.join(STORAGE_ROOT, relativePath)).catch(() => {});
}