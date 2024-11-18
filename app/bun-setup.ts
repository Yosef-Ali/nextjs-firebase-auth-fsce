import { type BunFile } from "bun";

// Enable Bun's optimizations
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Configure Bun's file handling
export const readFile = async (path: string): Promise<string> => {
  const file: BunFile = Bun.file(path);
  return file.text();
};

export const writeFile = async (path: string, content: string): Promise<void> => {
  await Bun.write(path, content);
};

// Configure Bun's fetch
export const fetch = globalThis.fetch.bind(globalThis);
