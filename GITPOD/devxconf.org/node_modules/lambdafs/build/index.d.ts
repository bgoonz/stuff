declare class LambdaFS {
    /**
     * Compresses a file/folder with Gzip and returns the path to the compressed (tarballed) file.
     *
     * @param path Path of the file/folder to compress.
     */
    static deflate(path: string): Promise<string>;
    /**
     * Decompresses a (tarballed) Brotli or Gzip compressed file and returns the path to the decompressed file/folder.
     *
     * @param path Path of the file to decompress.
     */
    static inflate(path: string): Promise<string>;
}
export = LambdaFS;
