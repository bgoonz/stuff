/**
 * Thrown if same custom repository instance is reused between different connections.
 */
export declare class CustomRepositoryReusedError extends Error {
    name: string;
    constructor(repository: any);
}
