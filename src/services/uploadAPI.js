// VERSION: v2.3.0 | DATE: 2026-04-16 | AUTHOR: VeloHub Development Team
// CHANGELOG: v2.3.0 - fetchAcademyTrophyTemasList: GET /uploads/academy-trophy-temas-list (reutilizar Bronze/Prata)
// CHANGELOG: v2.2.0 - uploadAcademyTrophyImage: POST multipart /uploads/academy-trophy (evita CORS GCS no browser)
import api from './api';

/**
 * Gerar Signed URL para upload de imagem
 * @param {string} fileName - Nome do arquivo
 * @param {string} mimeType - Tipo MIME do arquivo
 * @param {number} fileSize - Tamanho do arquivo em bytes
 * @param {string} folder - Pasta no GCS (opcional, padrão: 'img_velonews')
 * @returns {Promise<{uploadUrl: string, fileName: string, bucket: string, expiresIn: number}>}
 */
export const generateImageUploadUrl = async (fileName, mimeType, fileSize, folder = null) => {
  try {
    const requestBody = {
      fileName,
      mimeType,
      fileSize
    };
    
    // Adicionar folder se fornecido
    if (folder) {
      requestBody.folder = folder;
    }
    
    const response = await api.post('/uploads/generate-upload-url', requestBody);

    if (response.data.success && response.data.data) {
      const { uploadUrl, fileName: uniqueFileName, bucket, expiresIn } = response.data.data;
      if (!uploadUrl || !uniqueFileName) {
        throw new Error('Resposta inválida do servidor: faltam campos uploadUrl ou fileName');
      }
      return { uploadUrl, fileName: uniqueFileName, bucket, expiresIn };
    } else {
      throw new Error('Resposta inválida do servidor');
    }
  } catch (error) {
    console.error('Erro ao gerar URL de upload:', error);
    
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'Erro ao gerar URL de upload';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique se o servidor está rodando.');
    } else {
      throw error;
    }
  }
};

/**
 * Fazer upload direto para GCS usando Signed URL
 * @param {string} signedUrl - URL assinada do GCS
 * @param {File} file - Arquivo de imagem a ser enviado
 * @param {Function} onProgress - Callback de progresso (opcional)
 * @returns {Promise<void>}
 */
export const uploadToGCS = (signedUrl, file, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Configurar timeout (5 minutos)
    xhr.timeout = 5 * 60 * 1000;

    // Progresso do upload
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    // Sucesso
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        let errorMessage = 'Erro no upload para GCS';
        
        if (xhr.status === 403) {
          errorMessage = 'URL de upload expirada. Tente novamente.';
        } else if (xhr.status === 400) {
          errorMessage = 'Arquivo inválido para upload.';
        } else if (xhr.status === 0) {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
        }

        reject(new Error(`${errorMessage} (Status: ${xhr.status})`));
      }
    });

    // Erro de rede
    xhr.addEventListener('error', () => {
      reject(new Error('Erro de rede ao fazer upload. Verifique sua conexão.'));
    });

    // Timeout
    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload demorou muito tempo. Tente novamente.'));
    });

    // Abort
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelado.'));
    });

    // Iniciar upload direto para GCS
    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};

/**
 * Upload de imagem para GCS usando Signed URL (método direto)
 * @param {File} file - Arquivo de imagem a ser enviado
 * @param {Function} onProgress - Callback de progresso (opcional)
 * @param {string} folder - Pasta no GCS (opcional)
 * @returns {Promise<{url: string, fileName: string, bucket: string}>} - Objeto com URL completa, caminho relativo e bucket
 */
/**
 * Troféus Academy: envia ficheiro ao SKYNET (multipart), que grava no GCS.
 * Usar em vez de uploadImage+signed URL para o bucket mediabank_academy (CORS no bucket nem sempre configurável).
 * @param {File} file
 * @param {string} folder mediabank_academy/icones_conquistas/modulos | .../temas
 * @param {Function} onProgress
 */
export const uploadAcademyTrophyImage = async (file, folder, onProgress = null) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  try {
    const response = await api.post('/uploads/academy-trophy', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
      onUploadProgress: onProgress
        ? (progressEvent) => {
            if (progressEvent.total) {
              onProgress((progressEvent.loaded / progressEvent.total) * 100);
            }
          }
        : undefined
    });

    if (response.data.success && response.data.data) {
      const { url, fileName, bucket } = response.data.data;
      if (!url || !fileName) {
        throw new Error('Resposta inválida do servidor');
      }
      return { url, fileName, bucket };
    }
    throw new Error('Resposta inválida do servidor');
  } catch (error) {
    console.error('Erro upload troféu Academy:', error);
    if (error.response) {
      const message =
        error.response.data?.message || error.response.data?.error || 'Erro ao enviar troféu';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique se o servidor está rodando.');
    }
    throw error;
  }
};

/**
 * Lista imagens já existentes em icones_conquistas/temas/ no bucket Academy (reutilizar URL sem novo upload).
 * @returns {Promise<Array<{ fileName: string, url: string }>>}
 */
export const fetchAcademyTrophyTemasList = async () => {
  try {
    const response = await api.get('/uploads/academy-trophy-temas-list');
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error('Resposta inválida do servidor');
  } catch (error) {
    console.error('Erro ao listar troféus temas:', error);
    if (error.response) {
      const message =
        error.response.data?.message || error.response.data?.error || 'Erro ao listar imagens';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique se o servidor está rodando.');
    }
    throw error;
  }
};

export const uploadImage = async (file, onProgress = null, folder = null) => {
  try {
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido. Use apenas imagens (jpg, jpeg, png, gif, webp).');
    }

    // Validar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`Arquivo muito grande. Tamanho máximo permitido: ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
    }

    // 1. Gerar Signed URL (passar folder se fornecido)
    const uploadData = await generateImageUploadUrl(file.name, file.type, file.size, folder);
    console.log(`✅ Signed URL gerada: ${uploadData.fileName}`);

    // 2. Fazer upload direto para GCS com retry
    let uploadSuccess = false;
    let lastError = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await uploadToGCS(uploadData.uploadUrl, file, onProgress);
        uploadSuccess = true;
        break;
      } catch (error) {
        lastError = error;
        
        // Se for erro 403 (URL expirada), tentar gerar nova URL
        if (error.message.includes('403') && attempt < maxRetries) {
          console.log(`Tentativa ${attempt} falhou, gerando nova URL...`);
          const newUploadData = await generateImageUploadUrl(file.name, file.type, file.size, folder);
          uploadData.uploadUrl = newUploadData.uploadUrl;
          uploadData.fileName = newUploadData.fileName;
          uploadData.bucket = newUploadData.bucket;
          
          // Esperar um pouco antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        // Se não for erro recuperável ou última tentativa, lançar erro
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }

    if (!uploadSuccess) {
      throw lastError || new Error('Falha no upload após múltiplas tentativas');
    }

    // 3. Construir URL pública do arquivo
    const publicUrl = `https://storage.googleapis.com/${uploadData.bucket}/${uploadData.fileName}`;
    console.log(`✅ Upload concluído: ${publicUrl}`);

    // 4. Retornar dados do upload
    return {
      url: publicUrl,
      fileName: uploadData.fileName,
      bucket: uploadData.bucket
    };
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'Erro ao fazer upload da imagem';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique se o servidor está rodando.');
    } else {
      throw error;
    }
  }
};

export default {
  uploadImage,
  uploadAcademyTrophyImage,
  fetchAcademyTrophyTemasList,
  generateImageUploadUrl,
  uploadToGCS
};
