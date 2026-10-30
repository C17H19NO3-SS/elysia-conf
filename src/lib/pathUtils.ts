import { join, normalize, sep } from 'path';

export function safeJoin(baseDir: string, safeRoute: string): string {
  const safePath = normalize(safeRoute).replace(/^(\.\.(\/|\\|$))+/, '');
  const resolvedPath = join(baseDir, safePath);
  if (!resolvedPath.startsWith(baseDir + sep) && resolvedPath !== baseDir) {
    throw new Error('Directory traversal attempt detected');
  }
  return resolvedPath;
}
