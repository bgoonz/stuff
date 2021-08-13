"use strict";
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const tar_fs_1 = require("tar-fs");
const zlib_1 = require("zlib");
class LambdaFS {
    /**
     * Compresses a file/folder with Gzip and returns the path to the compressed (tarballed) file.
     *
     * @param path Path of the file/folder to compress.
     */
    static deflate(path) {
        let output = path_1.join(os_1.tmpdir(), [path_1.basename(path), fs_1.statSync(path).isDirectory() ? 'tar.gz' : 'gz'].join('.'));
        return new Promise((resolve, reject) => {
            let source = output.endsWith('.tar.gz') ? tar_fs_1.pack(path) : fs_1.createReadStream(path, { highWaterMark: 2 ** 23 });
            let target = fs_1.createWriteStream(output, { mode: 0o644 });
            source.once('error', (error) => {
                return reject(error);
            });
            target.once('error', (error) => {
                return reject(error);
            });
            target.once('close', () => {
                return resolve(output);
            });
            source.pipe(zlib_1.createGzip({ chunkSize: 2 ** 21 })).pipe(target);
        });
    }
    /**
     * Decompresses a (tarballed) Brotli or Gzip compressed file and returns the path to the decompressed file/folder.
     *
     * @param path Path of the file to decompress.
     */
    static inflate(path) {
        let output = path_1.join(os_1.tmpdir(), path_1.basename(path).replace(/[.](?:t(?:ar(?:[.](?:br|gz))?|br|gz)|br|gz)$/i, ''));
        return new Promise((resolve, reject) => {
            if (fs_1.existsSync(output) === true) {
                return resolve(output);
            }
            let source = fs_1.createReadStream(path, { highWaterMark: 2 ** 23 });
            let target = null;
            if (/[.](?:t(?:ar(?:[.](?:br|gz))?|br|gz))$/i.test(path) === true) {
                target = tar_fs_1.extract(output);
                target.once('finish', () => {
                    return resolve(output);
                });
            }
            else {
                target = fs_1.createWriteStream(output, { mode: 0o700 });
            }
            source.once('error', (error) => {
                return reject(error);
            });
            target.once('error', (error) => {
                return reject(error);
            });
            target.once('close', () => {
                return resolve(output);
            });
            if (/(?:br|gz)$/i.test(path) === true) {
                source.pipe(/br$/i.test(path) ? zlib_1.createBrotliDecompress({ chunkSize: 2 ** 21 }) : zlib_1.createUnzip({ chunkSize: 2 ** 21 })).pipe(target);
            }
            else {
                source.pipe(target);
            }
        });
    }
}
module.exports = LambdaFS;
//# sourceMappingURL=index.js.map