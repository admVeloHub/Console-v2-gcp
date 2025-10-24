// Vercel Blob Storage Integration
import { put, del, list } from '@vercel/blob';
import { VERCEL_BLOB_CONFIG } from '../config/vercelBlob';

export interface BlobFile {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

// Função para verificar se o Vercel Blob está configurado
export const isVercelBlobConfigured = (): boolean => {
  return !!VERCEL_BLOB_CONFIG.token && VERCEL_BLOB_CONFIG.token !== '';
};

// Função para salvar arquivo no Vercel Blob
export const saveAudioFileToBlob = async (file: File, evaluationId: string): Promise<BlobFile> => {
  try {
    console.log('🔍 === SALVANDO ARQUIVO NO VERCEL BLOB ===');
    console.log('🔍 Nome do arquivo:', file.name);
    console.log('🔍 Tamanho:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('🔍 Tipo MIME:', file.type);
    console.log('🔍 ID da avaliação:', evaluationId);
    
    // Verificar se está configurado
    if (!isVercelBlobConfigured()) {
      throw new Error('Vercel Blob não está configurado. Configure a variável BLOB_READ_WRITE_TOKEN no Vercel.');
    }
    
    // Verificar tamanho do arquivo
    if (file.size > VERCEL_BLOB_CONFIG.maxFileSize) {
      throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Tamanho máximo: ${(VERCEL_BLOB_CONFIG.maxFileSize / 1024 / 1024).toFixed(0)}MB`);
    }
    
    // Verificar tipo de arquivo
    if (!VERCEL_BLOB_CONFIG.allowedMimeTypes.includes(file.type)) {
      throw new Error(`Tipo de arquivo não suportado: ${file.type}. Tipos permitidos: ${VERCEL_BLOB_CONFIG.allowedMimeTypes.join(', ')}`);
    }
    
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `audio_${evaluationId}_${timestamp}.${fileExtension}`;
    const filePath = `${VERCEL_BLOB_CONFIG.folderStructure.base}/${VERCEL_BLOB_CONFIG.folderStructure.audio}/${fileName}`;
    
    console.log('🔍 Caminho do arquivo:', filePath);
    
    // Upload do arquivo
    const blob = await put(filePath, file, {
      access: 'public',
      token: VERCEL_BLOB_CONFIG.token
    });
    
    console.log('✅ Arquivo salvo no Vercel Blob:', blob.url);
    console.log('🔍 Detalhes do blob:', {
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt
    });
    
    return {
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: new Date(blob.uploadedAt)
    };
    
  } catch (error) {
    console.error('❌ Erro ao salvar arquivo no Vercel Blob:', error);
    throw error;
  }
};

// Função para deletar arquivo do Vercel Blob
export const deleteAudioFileFromBlob = async (url: string): Promise<boolean> => {
  try {
    console.log('🔍 === DELETANDO ARQUIVO DO VERCEL BLOB ===');
    console.log('🔍 URL do arquivo:', url);
    
    if (!isVercelBlobConfigured()) {
      console.warn('⚠️ Vercel Blob não configurado, não é possível deletar arquivo');
      return false;
    }
    
    await del(url, {
      token: VERCEL_BLOB_CONFIG.token
    });
    
    console.log('✅ Arquivo deletado do Vercel Blob');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao deletar arquivo do Vercel Blob:', error);
    return false;
  }
};

// Função para listar arquivos do Vercel Blob
export const listAudioFilesFromBlob = async (): Promise<BlobFile[]> => {
  try {
    console.log('🔍 === LISTANDO ARQUIVOS DO VERCEL BLOB ===');
    
    if (!isVercelBlobConfigured()) {
      console.warn('⚠️ Vercel Blob não configurado');
      return [];
    }
    
    const { blobs } = await list({
      prefix: `${VERCEL_BLOB_CONFIG.folderStructure.base}/${VERCEL_BLOB_CONFIG.folderStructure.audio}/`,
      token: VERCEL_BLOB_CONFIG.token
    });
    
    console.log('✅ Arquivos listados:', blobs.length);
    
    return blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: new Date(blob.uploadedAt)
    }));
    
  } catch (error) {
    console.error('❌ Erro ao listar arquivos do Vercel Blob:', error);
    return [];
  }
};

// Função para verificar se deve usar Vercel Blob
export const shouldUseVercelBlob = (fileSize: number): boolean => {
  // Usar Vercel Blob para arquivos maiores que 1MB
  const minBlobSize = 1 * 1024 * 1024; // 1MB
  return fileSize > minBlobSize && isVercelBlobConfigured();
};
