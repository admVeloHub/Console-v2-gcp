// VERSION: v1.1.0 | DATE: 2026-05-08 | AUTHOR: VeloHub Development Team
/**
 * Utilitário para gerenciar imagens temporárias
 * — Metadados no localStorage (pequeno)
 * — Binários no IndexedDB (evita QuotaExceededError do localStorage com base64)
 */

const getStorageKey = (pageId) => {
  return `velohub_temp_images_${pageId}`;
};

const idbKey = (pageId, uuid) => `${pageId}::${uuid}`;

const IDB_NAME = 'velohub_temp_image_blobs';
const IDB_STORE = 'blobs';
const IDB_VERSION = 1;

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null;

function openImageBlobDB() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB não disponível neste ambiente'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
    });
  }
  return dbPromise;
}

/**
 * @param {string} pageId
 * @param {string} uuid
 * @param {Blob} blob
 */
async function idbPutBlob(pageId, uuid, blob) {
  const db = await openImageBlobDB();
  const key = idbKey(pageId, uuid);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(IDB_STORE).put(blob, key);
  });
}

/**
 * @param {string} pageId
 * @param {string} uuid
 * @returns {Promise<Blob | undefined>}
 */
async function idbGetBlob(pageId, uuid) {
  try {
    const db = await openImageBlobDB();
    const key = idbKey(pageId, uuid);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      tx.onerror = () => reject(tx.error);
      const request = tx.objectStore(IDB_STORE).get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch {
    return undefined;
  }
}

/**
 * @param {string} pageId
 * @param {string} uuid
 */
async function idbDeleteBlob(pageId, uuid) {
  try {
    const db = await openImageBlobDB();
    const key = idbKey(pageId, uuid);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(IDB_STORE).delete(key);
    });
  } catch {
    /* ignore */
  }
}

/**
 * @param {string} pageId
 */
async function idbDeleteAllForPage(pageId) {
  try {
    const db = await openImageBlobDB();
    const prefix = `${pageId}::`;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore(IDB_STORE);
      const req = store.openKeyCursor();
      req.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (typeof cursor.key === 'string' && cursor.key.startsWith(prefix)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    });
  } catch {
    /* ignore */
  }
}

/**
 * @param {File} file
 * @returns {Promise<string>}
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Fallback legado: grava base64 no localStorage (pode estourar quota em imagens grandes).
 */
async function saveTemporaryImageLegacyBase64(file, uuid, blobUrl, pageId, existingImages) {
  const storageKey = getStorageKey(pageId);
  const base64 = await fileToBase64(file);
  const imageData = {
    uuid,
    blobUrl,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    base64,
    timestamp: Date.now(),
    storage: 'localStorage_base64'
  };
  existingImages[uuid] = imageData;
  localStorage.setItem(storageKey, JSON.stringify(existingImages));
}

/**
 * Salvar imagem temporária (IndexedDB + metadados no localStorage)
 * @param {File} file
 * @param {string} uuid
 * @param {string} blobUrl
 * @param {string} pageId
 * @returns {Promise<void>}
 */
export const saveTemporaryImage = async (file, uuid, blobUrl, pageId) => {
  const storageKey = getStorageKey(pageId);
  const existingImages = getAllTemporaryImages(pageId);

  try {
    await idbPutBlob(pageId, uuid, file);

    const imageData = {
      uuid,
      blobUrl,
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      timestamp: Date.now(),
      storage: 'idb'
    };

    existingImages[uuid] = imageData;
    localStorage.setItem(storageKey, JSON.stringify(existingImages));
    console.log(`✅ Imagem temporária salva (IndexedDB): ${uuid} (${file.name})`);
  } catch (idbError) {
    console.warn('⚠️ Armazenamento IndexedDB falhou, tentando legado (localStorage base64):', idbError?.message || idbError);
    try {
      await saveTemporaryImageLegacyBase64(file, uuid, blobUrl, pageId, existingImages);
      console.log(`✅ Imagem temporária salva (legado base64): ${uuid} (${file.name})`);
    } catch (LEGACY_ERROR) {
      console.error('❌ Erro ao salvar imagem temporária:', LEGACY_ERROR);
      await idbDeleteBlob(pageId, uuid).catch(() => {});
      throw LEGACY_ERROR;
    }
  }
};

const base64ToFile = (base64, fileName, fileType) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], fileName, { type: fileType });
};

export const getTemporaryImage = (uuid, pageId) => {
  try {
    const allImages = getAllTemporaryImages(pageId);
    return allImages[uuid] || null;
  } catch (error) {
    console.error('❌ Erro ao recuperar imagem temporária:', error);
    return null;
  }
};

/**
 * @param {string} uuid
 * @param {string} pageId
 * @returns {Promise<File | null>}
 */
export const getTemporaryImageFile = async (uuid, pageId) => {
  try {
    const imageData = getTemporaryImage(uuid, pageId);
    if (!imageData) return null;

    if (imageData.base64) {
      return base64ToFile(imageData.base64, imageData.fileName, imageData.fileType);
    }

    const blob = await idbGetBlob(pageId, uuid);
    if (blob) {
      return new File([blob], imageData.fileName, { type: imageData.fileType || blob.type || 'image/jpeg' });
    }

    return null;
  } catch (error) {
    console.error('❌ Erro ao recuperar arquivo da imagem temporária:', error);
    return null;
  }
};

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
 * @param {string} uuid
 * @param {string} pageId
 * @returns {Promise<void>}
 */
export const removeTemporaryImage = async (uuid, pageId) => {
  try {
    await idbDeleteBlob(pageId, uuid);
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
 * @param {string} pageId
 * @returns {Promise<void>}
 */
export const clearAllTemporaryImages = async (pageId) => {
  try {
    await idbDeleteAllForPage(pageId);
    const storageKey = getStorageKey(pageId);
    localStorage.removeItem(storageKey);
    console.log(`✅ Todas imagens temporárias removidas para: ${pageId}`);
  } catch (error) {
    console.error('❌ Erro ao limpar imagens temporárias:', error);
  }
};

/**
 * Limpar imagens temporárias antigas (mais de 7 dias)
 * @param {string} pageId
 * @returns {Promise<void>}
 */
export const cleanOldTemporaryImages = async (pageId) => {
  try {
    const allImages = getAllTemporaryImages(pageId);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const storageKey = getStorageKey(pageId);

    const cleaned = {};
    let removedCount = 0;

    for (const uuid of Object.keys(allImages)) {
      if (allImages[uuid].timestamp > sevenDaysAgo) {
        cleaned[uuid] = allImages[uuid];
      } else {
        removedCount++;
        await idbDeleteBlob(pageId, uuid);
      }
    }

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
