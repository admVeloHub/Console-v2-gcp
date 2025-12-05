// VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
/**
 * Utilitário para gerenciar imagens temporárias no localStorage
 * Armazena blob URLs e arquivos File para upload posterior
 */

/**
 * Obter chave do localStorage para uma página específica
 * @param {string} pageId - ID da página (ex: 'velonews', 'artigos')
 * @returns {string} Chave do localStorage
 */
const getStorageKey = (pageId) => {
  return `velohub_temp_images_${pageId}`;
};

/**
 * Salvar imagem temporária no localStorage
 * @param {File} file - Arquivo de imagem
 * @param {string} uuid - UUID único da imagem
 * @param {string} blobUrl - URL do blob criado
 * @param {string} pageId - ID da página
 * @returns {Promise<void>}
 */
export const saveTemporaryImage = async (file, uuid, blobUrl, pageId) => {
  try {
    const storageKey = getStorageKey(pageId);
    const existingImages = getAllTemporaryImages(pageId);
    
    // Converter File para base64 para armazenar no localStorage
    const base64 = await fileToBase64(file);
    
    const imageData = {
      uuid,
      blobUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      base64,
      timestamp: Date.now()
    };
    
    existingImages[uuid] = imageData;
    
    localStorage.setItem(storageKey, JSON.stringify(existingImages));
    console.log(`✅ Imagem temporária salva: ${uuid} (${file.name})`);
  } catch (error) {
    console.error('❌ Erro ao salvar imagem temporária:', error);
    throw error;
  }
};

/**
 * Converter File para base64
 * @param {File} file - Arquivo a ser convertido
 * @returns {Promise<string>} Base64 string
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64,
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Converter base64 de volta para File
 * @param {string} base64 - String base64
 * @param {string} fileName - Nome do arquivo
 * @param {string} fileType - Tipo MIME
 * @returns {File} Objeto File
 */
const base64ToFile = (base64, fileName, fileType) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], fileName, { type: fileType });
};

/**
 * Recuperar imagem temporária do localStorage
 * @param {string} uuid - UUID da imagem
 * @param {string} pageId - ID da página
 * @returns {Object|null} Dados da imagem ou null se não encontrada
 */
export const getTemporaryImage = (uuid, pageId) => {
  try {
    const storageKey = getStorageKey(pageId);
    const allImages = getAllTemporaryImages(pageId);
    return allImages[uuid] || null;
  } catch (error) {
    console.error('❌ Erro ao recuperar imagem temporária:', error);
    return null;
  }
};

/**
 * Recuperar arquivo File de uma imagem temporária
 * @param {string} uuid - UUID da imagem
 * @param {string} pageId - ID da página
 * @returns {File|null} Arquivo File ou null se não encontrado
 */
export const getTemporaryImageFile = (uuid, pageId) => {
  try {
    const imageData = getTemporaryImage(uuid, pageId);
    if (!imageData) return null;
    
    return base64ToFile(imageData.base64, imageData.fileName, imageData.fileType);
  } catch (error) {
    console.error('❌ Erro ao recuperar arquivo da imagem temporária:', error);
    return null;
  }
};

/**
 * Listar todas imagens temporárias de uma página
 * @param {string} pageId - ID da página
 * @returns {Object} Objeto com todas imagens temporárias (chave: uuid, valor: imageData)
 */
export const getAllTemporaryImages = (pageId) => {
  try {
    const storageKey = getStorageKey(pageId);
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('❌ Erro ao listar imagens temporárias:', error);
    return {};
  }
};

/**
 * Remover imagem temporária do localStorage
 * @param {string} uuid - UUID da imagem
 * @param {string} pageId - ID da página
 */
export const removeTemporaryImage = (uuid, pageId) => {
  try {
    const storageKey = getStorageKey(pageId);
    const allImages = getAllTemporaryImages(pageId);
    delete allImages[uuid];
    localStorage.setItem(storageKey, JSON.stringify(allImages));
    console.log(`✅ Imagem temporária removida: ${uuid}`);
  } catch (error) {
    console.error('❌ Erro ao remover imagem temporária:', error);
  }
};

/**
 * Limpar todas imagens temporárias de uma página
 * @param {string} pageId - ID da página
 */
export const clearAllTemporaryImages = (pageId) => {
  try {
    const storageKey = getStorageKey(pageId);
    localStorage.removeItem(storageKey);
    console.log(`✅ Todas imagens temporárias removidas para: ${pageId}`);
  } catch (error) {
    console.error('❌ Erro ao limpar imagens temporárias:', error);
  }
};

/**
 * Limpar imagens temporárias antigas (mais de 7 dias)
 * @param {string} pageId - ID da página
 */
export const cleanOldTemporaryImages = (pageId) => {
  try {
    const allImages = getAllTemporaryImages(pageId);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const storageKey = getStorageKey(pageId);
    
    const cleaned = {};
    let removedCount = 0;
    
    Object.keys(allImages).forEach(uuid => {
      if (allImages[uuid].timestamp > sevenDaysAgo) {
        cleaned[uuid] = allImages[uuid];
      } else {
        removedCount++;
      }
    });
    
    localStorage.setItem(storageKey, JSON.stringify(cleaned));
    if (removedCount > 0) {
      console.log(`✅ ${removedCount} imagens temporárias antigas removidas`);
    }
  } catch (error) {
    console.error('❌ Erro ao limpar imagens temporárias antigas:', error);
  }
};

export default {
  saveTemporaryImage,
  getTemporaryImage,
  getTemporaryImageFile,
  getAllTemporaryImages,
  removeTemporaryImage,
  clearAllTemporaryImages,
  cleanOldTemporaryImages
};

