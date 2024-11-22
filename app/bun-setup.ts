import { promises as fs } from 'fs';

// File handling using Node.js fs promises
export const readFile = async (path: string): Promise<string> => {
  return fs.readFile(path, 'utf-8');
};

export const writeFile = async (path: string, content: string): Promise<void> => {
  await fs.writeFile(path, content, 'utf-8');
};

// Use global fetch
export const fetch = globalThis.fetch.bind(globalThis);
