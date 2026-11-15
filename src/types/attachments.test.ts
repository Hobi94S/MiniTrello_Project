import { describe, expect, it } from 'vitest';
import { MAX_ATTACHMENT_SIZE_BYTES, validateAttachmentSize } from './attachments';

describe('attachment file limits', () => {
  it('accepts files at the limit and rejects larger or invalid sizes', () => {
    expect(() => validateAttachmentSize(MAX_ATTACHMENT_SIZE_BYTES)).not.toThrow();
    expect(() => validateAttachmentSize(MAX_ATTACHMENT_SIZE_BYTES + 1)).toThrow('no máximo 1 MB');
    expect(() => validateAttachmentSize(-1)).toThrow('inválido');
    expect(() => validateAttachmentSize(Number.NaN)).toThrow('inválido');
  });
});
