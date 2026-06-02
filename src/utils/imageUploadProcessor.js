// VERSION: v1.6.0 | DATE: 2026-06-01 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.6.0 - avisos → img_avisos; destaques → img_destaques (bucket mediabank_velohub)
/**
 * Processador de uploads assíncronos de imagens
 * Encontra imagens temporárias no markdown ou HTML, faz upload para GCS e substitui URLs
 */

import { getTemporaryImageFile, getTemporaryImage, removeTemporaryImage } from './imageStorage';
import { uploadImage } from '../services/uploadAPI';

/**
 * Mapear pageId para pasta no GCS
 * @param {string} pageId - ID da página
 * @returns {string} Pasta no GCS
 */
const getFolderFromPageId = (pageId) => {
  const folderMap = {
    'velonews': 'img_velonews',
    'artigos': 'img_artigos',
    'bot_perguntas': 'img_bot_perguntas',
    'botPerguntas': 'img_bot_perguntas',
    'destaques': 'img_destaques',
    'avisos': 'img_avisos',
  };
  
  return folderMap[pageId] || 'img_velonews'; // Padrão para compatibilidade
};

/**
 * Retry automático de upload
 * @param {Function} uploadFn - Função de upload que retorna { url, fileName, bucket }
 * @param {number} maxRetries - Número máximo de tentativas (padrão: 3)
 * @param {number} delayMs - Delay entre tentativas em ms (padrão: 1000)
 * @returns {Promise<{url: string, fileName: string, bucket: string}>} Objeto com URL completa, caminho relativo e bucket
 */
const retryUpload = async (uploadFn, maxRetries = 3, delayMs = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await uploadFn();
      if (attempt > 1) {
        console.log(`✅ Upload bem-sucedido na tentativa ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Tentativa ${attempt}/${maxRetries} falhou:`, error.message);
      
      if (attempt < maxRetries) {
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw new Error(`Upload falhou após ${maxRetries} tentativas: ${lastError?.message || 'Erro desconhecido'}`);
};

/**
 * Processar uploads de imagens temporárias no markdown
 * @param {string} markdown - Markdown contendo imagens temporárias no formato ![temp:uuid](blob:url)
 * @param {string} pageId - ID da página (ex: 'velonews', 'artigos')
 * @param {Function} onProgress - Callback de progresso (opcional): (current, total) => void
 * @returns {Promise<{markdown: string, imageUrls: string[], imageFileNames: string[]}>} Objeto com markdown atualizado, URLs completas e caminhos relativos
 */
export const processImageUploads = async (markdown, pageId, onProgress = null) => {
  if (!markdown || typeof markdown !== 'string') {
    console.log('⚠️ [processImageUploads] Markdown vazio ou inválido');
    return { markdown, imageUrls: [], imageFileNames: [] };
  }

  console.log(`🔍 [processImageUploads] Analisando markdown (${markdown.length} caracteres)`);
  console.log(`🔍 [processImageUploads] Primeiros 500 caracteres:`, markdown.substring(0, 500));

  // Encontrar todas imagens temporárias no formato markdown: ![temp:uuid](blob:url)
  const tempImageMarkdownRegex = /!\[temp:([a-f0-9-]+)\]\(blob:[^)]+\)/g;
  const markdownMatches = [...markdown.matchAll(tempImageMarkdownRegex)];
  
  // Encontrar todas imagens temporárias no formato HTML: <img alt="temp:uuid" src="blob:url" ... />
  const tempImageHtmlRegex = /<img[^>]*alt=["']temp:([a-f0-9-]+)["'][^>]*src=["'](blob:[^"']+)["'][^>]*>/gi;
  const htmlMatches = [...markdown.matchAll(tempImageHtmlRegex)];
  
  // Combinar matches e extrair UUIDs únicos
  const imageMap = new Map(); // uuid -> { type: 'markdown'|'html', match: string, uuid: string, src?: string }
  
  markdownMatches.forEach(match => {
    const uuid = match[1];
    if (!imageMap.has(uuid)) {
      imageMap.set(uuid, { type: 'markdown', match: match[0], uuid });
    }
  });
  
  // Processar matches HTML - pode ter alt antes ou depois de src
  htmlMatches.forEach(match => {
    const uuid = match[1];
    const src = match[2];
    if (!imageMap.has(uuid)) {
      imageMap.set(uuid, { type: 'html', match: match[0], uuid, src });
    }
  });
  
  // Também procurar com src antes de alt (ordem inversa)
  const tempImageHtmlRegex2 = /<img[^>]*src=["'](blob:[^"']+)["'][^>]*alt=["']temp:([a-f0-9-]+)["'][^>]*>/gi;
  const htmlMatches2 = [...markdown.matchAll(tempImageHtmlRegex2)];
  htmlMatches2.forEach(match => {
    const uuid = match[2];
    const src = match[1];
    if (!imageMap.has(uuid)) {
      imageMap.set(uuid, { type: 'html', match: match[0], uuid, src });
    }
  });
  
  const matches = Array.from(imageMap.values());
  
  if (matches.length === 0) {
    console.log('ℹ️ [processImageUploads] Nenhuma imagem temporária encontrada no markdown');
    // Verificar se há imagens no formato diferente
    const anyImageRegex = /!\[([^\]]*)\]\(([^)]+)\)|<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
    const anyImages = [...markdown.matchAll(anyImageRegex)];
    if (anyImages.length > 0) {
      console.log(`⚠️ [processImageUploads] Encontradas ${anyImages.length} imagem(ns) no markdown, mas nenhuma no formato temporário:`);
      anyImages.forEach((match, i) => {
        console.log(`   Imagem ${i + 1}: ${match[0].substring(0, 100)}...`);
      });
    }
    return { markdown, imageUrls: [], imageFileNames: [] };
  }

  console.log(`🔍 [processImageUploads] Encontradas ${matches.length} imagem(ns) temporária(s) para processar:`);
  matches.forEach((match, i) => {
    console.log(`   ${i + 1}. Tipo: ${match.type}, UUID: ${match.uuid}`);
  });

  let processedMarkdown = markdown;
  const uploadPromises = [];
  const uploadResults = new Map(); // uuid -> { success: boolean, url?: string, error?: string }

  // Processar cada imagem encontrada
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const uuid = match.uuid;
    
    // Callback de progresso
    if (onProgress) {
      onProgress(i + 1, matches.length);
    }

    // Criar promise de upload com retry
    const uploadPromise = retryUpload(async () => {
      console.log(`⬆️ Fazendo upload da imagem ${i + 1}/${matches.length} (UUID: ${uuid}, Tipo: ${match.type})`);
      
      // Recuperar arquivo (IndexedDB ou legado base64 no localStorage)
      const file = await getTemporaryImageFile(uuid, pageId);
      if (!file) {
        throw new Error(`Arquivo não encontrado para UUID: ${uuid}`);
      }

      // Mapear pageId para pasta no GCS
      const folder = getFolderFromPageId(pageId);
      console.log(`📁 [processImageUploads] Usando pasta: ${folder} para pageId: ${pageId}`);

      // Fazer upload para GCS - retorna objeto { url, fileName, bucket }
      const uploadResult = await uploadImage(file, null, folder);
      console.log(`✅ Upload concluído: ${uploadResult.url} (fileName: ${uploadResult.fileName})`);
      
      return uploadResult;
    })
    .then(result => {
      uploadResults.set(uuid, { success: true, url: result.url, fileName: result.fileName });
      return { uuid, url: result.url, fileName: result.fileName, success: true, type: match.type };
    })
    .catch(error => {
      uploadResults.set(uuid, { success: false, error: error.message });
      return { uuid, error: error.message, success: false, type: match.type };
    });

    uploadPromises.push(uploadPromise);
  }

  // Aguardar todos uploads concluírem
  const results = await Promise.all(uploadPromises);

  // Verificar se algum upload falhou
  const failedUploads = results.filter(r => !r.success);
  if (failedUploads.length > 0) {
    const errorMessages = failedUploads.map(r => `UUID ${r.uuid}: ${r.error}`).join('\n');
    throw new Error(`Falha no upload de ${failedUploads.length} imagem(ns):\n${errorMessages}`);
  }

  // Arrays para armazenar URLs completas e caminhos relativos das imagens processadas
  const imageUrls = [];
  const imageFileNames = [];

  // Substituir todas URLs temporárias pelas URLs do GCS
  for (const { uuid, url, fileName, type } of results) {
    imageUrls.push(url);

    if (fileName) {
      imageFileNames.push(fileName);
    }

    const imageData = getTemporaryImage(uuid, pageId);
    const altText = imageData ? imageData.fileName : 'Imagem';

    if (type === 'markdown') {
      const regex = new RegExp(`!\\[temp:${uuid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\(blob:[^)]+\\)`, 'g');
      processedMarkdown = processedMarkdown.replace(regex, `![${altText}](${url})`);
    } else if (type === 'html') {
      const htmlRegex = new RegExp(`<img([^>]*alt=["']temp:${uuid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*src=["'])blob:[^"']+(["'][^>]*)>`, 'gi');
      processedMarkdown = processedMarkdown.replace(htmlRegex, (match) => {
        return match
          .replace(/alt=["']temp:[^"']+["']/i, `alt="${altText}"`)
          .replace(/src=["']blob:[^"']+["']/i, `src="${url}"`);
      });
    }

    await removeTemporaryImage(uuid, pageId);
  }

  console.log(`✅ Todas ${matches.length} imagem(ns) processadas com sucesso`);
  console.log(`📋 URLs completas das imagens:`, imageUrls);
  console.log(`📋 Caminhos relativos (fileName):`, imageFileNames);
  return { markdown: processedMarkdown, imageUrls, imageFileNames };
};

/**
 * Verificar se há imagens temporárias no markdown
 * @param {string} markdown - Markdown a ser verificado
 * @returns {boolean} True se houver imagens temporárias
 */
export const hasTemporaryImages = (markdown) => {
  if (!markdown || typeof markdown !== 'string') {
    return false;
  }
  
  // Procurar no formato markdown: ![temp:uuid](blob:url)
  const tempImageMarkdownRegex = /!\[temp:([a-f0-9-]+)\]\(blob:[^)]+\)/g;
  if (tempImageMarkdownRegex.test(markdown)) {
    return true;
  }
  
  // Procurar no formato HTML: <img src="blob:..." alt="temp:uuid" ... />
  const tempImageHtmlRegex = /<img[^>]*alt=["']temp:([a-f0-9-]+)["'][^>]*src=["']blob:[^"']+["'][^>]*>/gi;
  return tempImageHtmlRegex.test(markdown);
};

/**
 * Contar quantas imagens temporárias existem no markdown
 * @param {string} markdown - Markdown a ser verificado (pode conter HTML também)
 * @returns {number} Número de imagens temporárias
 */
export const countTemporaryImages = (markdown) => {
  if (!markdown || typeof markdown !== 'string') {
    console.log('⚠️ [countTemporaryImages] Markdown vazio ou inválido');
    return 0;
  }
  
  // Procurar no formato markdown: ![temp:uuid](blob:url)
  const tempImageMarkdownRegex = /!\[temp:([a-f0-9-]+)\]\(blob:[^)]+\)/g;
  const markdownMatches = [...markdown.matchAll(tempImageMarkdownRegex)];
  console.log(`🔍 [countTemporaryImages] Matches markdown: ${markdownMatches.length}`);
  
  // Procurar no formato HTML: <img ... alt="temp:uuid" ... src="blob:..." ... />
  // Aceita tanto aspas simples quanto duplas e ordem flexível dos atributos
  const tempImageHtmlRegex = /<img[^>]*alt=["']temp:([a-f0-9-]+)["'][^>]*src=["']blob:[^"']+["'][^>]*>/gi;
  const htmlMatches = [...markdown.matchAll(tempImageHtmlRegex)];
  console.log(`🔍 [countTemporaryImages] Matches HTML: ${htmlMatches.length}`);
  
  // Também procurar com src antes do alt (ordem diferente)
  const tempImageHtmlRegex2 = /<img[^>]*src=["']blob:[^"']+["'][^>]*alt=["']temp:([a-f0-9-]+)["'][^>]*>/gi;
  const htmlMatches2 = [...markdown.matchAll(tempImageHtmlRegex2)];
  console.log(`🔍 [countTemporaryImages] Matches HTML (ordem inversa): ${htmlMatches2.length}`);
  
  // Combinar UUIDs únicos (pode haver duplicatas entre markdown e HTML)
  const uniqueUuids = new Set();
  markdownMatches.forEach(match => uniqueUuids.add(match[1]));
  htmlMatches.forEach(match => uniqueUuids.add(match[1]));
  htmlMatches2.forEach(match => uniqueUuids.add(match[1]));
  
  console.log(`🔍 [countTemporaryImages] Total UUIDs únicos encontrados: ${uniqueUuids.size}`);
  
  return uniqueUuids.size;
};

export default {
  processImageUploads,
  hasTemporaryImages,
  countTemporaryImages
};

