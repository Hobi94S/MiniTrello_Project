export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export const MAX_ATTACHMENT_SIZE_BYTES = 1024 * 1024;

export function validateAttachmentSize(size: number) {
  if (!Number.isFinite(size) || size < 0) {
    throw new Error('O tamanho do arquivo é inválido.');
  }
  if (size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new Error('Cada arquivo deve ter no máximo 1 MB.');
  }
}

function newAttachmentId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `attachment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readAttachmentFile(file: File): Promise<Attachment> {
  validateAttachmentSize(file.size);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Não foi possível ler "${file.name}".`));
    reader.onabort = () => reject(new Error(`A leitura de "${file.name}" foi cancelada.`));
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error(`Não foi possível converter "${file.name}" para Base64.`));
        return;
      }
      resolve({
        id: newAttachmentId(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: reader.result,
      });
    };
    reader.readAsDataURL(file);
  });
}
