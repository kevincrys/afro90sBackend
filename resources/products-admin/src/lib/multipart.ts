import Busboy from '@fastify/busboy';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { getContentType, readRequestBody } from './request';

export interface MultipartFile {
  buffer: Buffer;
  mimeType: string;
  filename?: string;
}

export interface ParsedMultipart {
  fields: Record<string, string>;
  files: Record<string, MultipartFile>;
}

export function parseMultipart(event: APIGatewayProxyEventV2): Promise<ParsedMultipart> {
  const contentType = getContentType(event);
  const body = readRequestBody(event);

  return new Promise((resolve, reject) => {
    const fields: Record<string, string> = {};
    const files: Record<string, MultipartFile> = {};
    const pendingFiles: Promise<void>[] = [];

    const busboy = Busboy({ headers: { 'content-type': contentType } });

    busboy.on('field', (name, value) => {
      fields[name] = value;
    });

    busboy.on('file', (fieldName, stream, filename, _encoding, mimeType) => {
      const chunks: Buffer[] = [];
      const filePromise = new Promise<void>((resolveFile, rejectFile) => {
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => {
          files[fieldName] = {
            buffer: Buffer.concat(chunks),
            mimeType,
            filename,
          };
          resolveFile();
        });
        stream.on('error', rejectFile);
      });
      pendingFiles.push(filePromise);
    });

    busboy.on('error', reject);
    busboy.on('finish', async () => {
      try {
        await Promise.all(pendingFiles);
        resolve({ fields, files });
      } catch (error) {
        reject(error);
      }
    });

    busboy.end(body);
  });
}
