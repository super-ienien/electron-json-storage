export as namespace electronJsonStorage;

export interface DataOptions { dataPath: string; }

export function getDefaultDataPath(): string;
export function setDataPath(directory?: string): void;
export function getDataPath(): string;
export function get<T = any>(key: string, callback: (error: any, data: T) => void): void;
export function get<T = any>(key: string, options: DataOptions, callback: (error: any, data: T) => void): void;
export function get<T = any>(key: string, options?: DataOptions): Promise<T>;
export function getSync(key: string, options?: DataOptions): any;
export function getMany(keys: ReadonlyArray<string>, callback: (error: any, data: any) => void): void;
export function getMany(keys: ReadonlyArray<string>, options: DataOptions, callback: (error: any, data: any) => void): void;
export function getMany(keys: ReadonlyArray<string>, options?: DataOptions): Promise<any>;
export function getAll<T = any>(callback: (error: any, data: T) => void): void;
export function getAll<T = any>(options: DataOptions, callback: (error: any, data: T) => void): void;
export function getAll<T = any>(options?: DataOptions): Promise<T>;
export function set(key: string, json: any, callback: (error: any) => void): void;
export function set(key: string, json: any, options: DataOptions, callback: (error: any) => void): void;
export function set(key: string, json: any, options?: DataOptions): Promise<void>;
export function has(key: string, callback: (error: any, hasKey: boolean) => void): void;
export function has(key: string, options: DataOptions, callback: (error: any, hasKey: boolean) => void): void;
export function has(key: string, options?: DataOptions): Promise<boolean>;
export function keys(callback: (error: any, keys: string[]) => void): void;
export function keys(options: DataOptions, callback: (error: any, keys: string[]) => void): void;
export function keys(options?: DataOptions): Promise<string[]>;
export function remove(key: string, callback: (error: any) => void): void;
export function remove(key: string, options: DataOptions, callback: (error: any) => void): void;
export function remove(key: string, options?: DataOptions): Promise<void>;
export function clear(callback: (error: any) => void): void;
export function clear(options: DataOptions, callback: (error: any) => void): void;
export function clear(options?: DataOptions): Promise<void>;