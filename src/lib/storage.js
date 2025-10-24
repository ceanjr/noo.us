import { storage } from './firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

/**
 * Upload de imagem para Firebase Storage
 * @param {File} file - Arquivo de imagem
 * @param {string} path - Caminho no storage (ex: 'surprises/userId/imageName.jpg')
 * @param {Function} onProgress - Callback para progresso (opcional)
 * @returns {Promise<string>} URL da imagem
 */
export async function uploadImage(file, path, onProgress = null) {
  try {
    // Criar referência no storage
    const storageRef = ref(storage, path);

    // Upload do arquivo
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    // Obter URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw new Error('Falha ao enviar imagem. Tente novamente.');
  }
}

/**
 * Upload de foto de surpresa
 * @param {File} file - Arquivo de imagem
 * @param {string} userId - ID do usuário
 * @returns {Promise<string>} URL da imagem
 */
export async function uploadSurprisePhoto(file, userId) {
  // Gerar nome único para a imagem
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const path = `surprises/${userId}/${fileName}`;

  return uploadImage(file, path);
}

/**
 * Upload de foto de perfil
 * @param {File} file - Arquivo de imagem
 * @param {string} userId - ID do usuário
 * @returns {Promise<string>} URL da imagem
 */
export async function uploadProfilePhoto(file, userId) {
  const timestamp = Date.now();
  const fileName = `profile_${timestamp}.${file.name.split('.').pop()}`;
  const path = `profiles/${userId}/${fileName}`;

  return uploadImage(file, path);
}

/**
 * Deletar imagem do storage
 * @param {string} imageUrl - URL completa da imagem
 * @returns {Promise<void>}
 */
export async function deleteImage(imageUrl) {
  try {
    // Extrair path da URL do Firebase Storage
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    if (!imageUrl.startsWith(baseUrl)) {
      throw new Error('URL inválida');
    }

    // Decodificar path
    const startIndex = imageUrl.indexOf('/o/') + 3;
    const endIndex = imageUrl.indexOf('?');
    const path = decodeURIComponent(
      imageUrl.substring(startIndex, endIndex)
    );

    // Criar referência e deletar
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    // Não lançar erro, apenas logar (imagem pode já ter sido deletada)
  }
}

/**
 * Comprimir imagem antes do upload (opcional)
 * @param {File} file - Arquivo original
 * @param {number} maxWidth - Largura máxima
 * @param {number} quality - Qualidade (0-1)
 * @returns {Promise<File>} Arquivo comprimido
 */
export async function compressImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calcular novas dimensões
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Criar canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao comprimir imagem'));
              return;
            }

            // Criar novo arquivo
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validar arquivo de imagem
 * @param {File} file - Arquivo a validar
 * @param {number} maxSizeMB - Tamanho máximo em MB
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateImageFile(file, maxSizeMB = 5) {
  // Validar tipo
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato não suportado. Use JPEG, PNG ou WebP.',
    };
  }

  // Validar tamanho
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `A imagem deve ter no máximo ${maxSizeMB}MB. Tamanho atual: ${sizeMB.toFixed(1)}MB`,
    };
  }

  return { valid: true, error: null };
}
