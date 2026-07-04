import { describe, expect, it } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { parseAdminCreateBody, parseAdminUpdateBody } from './parse-product-body';

function multipartEvent(body: string, boundary = '----boundary'): APIGatewayProxyEventV2 {
  return {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    body,
    isBase64Encoded: false,
  } as APIGatewayProxyEventV2;
}

describe('parseAdminCreateBody', () => {
  it('parses JSON create body', async () => {
    const result = await parseAdminCreateBody({
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Óculos',
        price: 49.9,
        quantity: 1,
        category: 'oculos',
      }),
    } as APIGatewayProxyEventV2);

    expect(result.body.name).toBe('Óculos');
    expect(result.body.description).toBe('');
    expect(result.files).toEqual({});
  });

  it('parses multipart create body with file field', async () => {
    const boundary = '----boundary';
    const payload = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="name"',
      '',
      'Óculos',
      `--${boundary}`,
      'Content-Disposition: form-data; name="price"',
      '',
      '49.9',
      `--${boundary}`,
      'Content-Disposition: form-data; name="quantity"',
      '',
      '1',
      `--${boundary}`,
      'Content-Disposition: form-data; name="category"',
      '',
      'oculos',
      `--${boundary}`,
      'Content-Disposition: form-data; name="photos"',
      '',
      '[{"type":"stream","fieldName":"photo_0"}]',
      `--${boundary}`,
      'Content-Disposition: form-data; name="photo_0"; filename="a.jpg"',
      'Content-Type: image/jpeg',
      '',
      'fake-image-bytes',
      `--${boundary}--`,
      '',
    ].join('\r\n');

    const result = await parseAdminCreateBody(multipartEvent(payload, boundary));

    expect(result.body.name).toBe('Óculos');
    expect(result.body.photos).toEqual([{ type: 'stream', fieldName: 'photo_0' }]);
    expect(result.files.photo_0?.mimeType).toBe('image/jpeg');
    expect(result.files.photo_0?.buffer.toString()).toBe('fake-image-bytes');
  });
});

describe('parseAdminUpdateBody', () => {
  it('parses JSON update body', async () => {
    const result = await parseAdminUpdateBody({
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Novo' }),
    } as APIGatewayProxyEventV2);

    expect(result.body.name).toBe('Novo');
  });

  it('parses multipart update body', async () => {
    const boundary = '----boundary';
    const payload = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="name"',
      '',
      'Atualizado',
      `--${boundary}--`,
      '',
    ].join('\r\n');

    const result = await parseAdminUpdateBody({
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
      body: payload,
      isBase64Encoded: false,
    } as APIGatewayProxyEventV2);

    expect(result.body.name).toBe('Atualizado');
  });

  it('rejects missing JSON body on create', async () => {
    await expect(
      parseAdminCreateBody({
        headers: { 'content-type': 'application/json' },
      } as APIGatewayProxyEventV2),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('rejects invalid JSON body', async () => {
    await expect(
      parseAdminUpdateBody({
        headers: { 'content-type': 'application/json' },
        body: '{',
      } as APIGatewayProxyEventV2),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('rejects invalid photos JSON in multipart', async () => {
    const boundary = '----boundary';
    const payload = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="name"',
      '',
      'Óculos',
      `--${boundary}`,
      'Content-Disposition: form-data; name="price"',
      '',
      '49.9',
      `--${boundary}`,
      'Content-Disposition: form-data; name="quantity"',
      '',
      '1',
      `--${boundary}`,
      'Content-Disposition: form-data; name="category"',
      '',
      'oculos',
      `--${boundary}`,
      'Content-Disposition: form-data; name="photos"',
      '',
      '{invalid',
      `--${boundary}--`,
      '',
    ].join('\r\n');

    await expect(
      parseAdminCreateBody(multipartEvent(payload, boundary)),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});
