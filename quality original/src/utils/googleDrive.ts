// Google Drive Integration
import { GOOGLE_DRIVE_CONFIG } from '../config/googleDrive';

interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  scope: string;
}

interface DriveFile {
  id: string;
  name: string;
  webViewLink: string;
  size: number;
  mimeType: string;
}

class GoogleDriveService {
  private config: GoogleDriveConfig;
  private accessToken: string | null = null;
  private folderId: string | null = null;

  constructor() {
    this.config = {
      clientId: 'YOUR_GOOGLE_CLIENT_ID', // Configurar no Google Cloud Console
      apiKey: 'YOUR_GOOGLE_API_KEY',
      scope: 'https://www.googleapis.com/auth/drive.file'
    };
  }

  // Configurar pasta específica
  async setTargetFolder(folderName: string, createIfNotExists: boolean = true): Promise<void> {
    try {
      console.log('🔍 === CONFIGURANDO PASTA ESPECÍFICA ===');
      console.log('🔍 Nome da pasta:', folderName);
      
      // Buscar pasta existente
      this.folderId = await this.findOrCreateFolder(folderName, createIfNotExists);
      
      if (this.folderId) {
        console.log('✅ Pasta configurada:', folderName, 'ID:', this.folderId);
      } else {
        console.log('⚠️ Pasta não encontrada e não foi possível criar');
      }
    } catch (error) {
      console.error('❌ Erro ao configurar pasta:', error);
      throw error;
    }
  }

  // Buscar ou criar pasta
  private async findOrCreateFolder(folderName: string, createIfNotExists: boolean): Promise<string | null> {
    try {
      // Buscar pasta existente
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.files && result.files.length > 0) {
          console.log('✅ Pasta encontrada:', result.files[0].id);
          return result.files[0].id;
        }
      }

      // Criar pasta se não existir e for permitido
      if (createIfNotExists) {
        console.log('🔄 Criando pasta:', folderName);
        return await this.createFolder(folderName);
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar/criar pasta:', error);
      return null;
    }
  }

  // Criar nova pasta
  private async createFolder(folderName: string): Promise<string | null> {
    try {
      const metadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: ['root']
      };

      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Pasta criada:', result.id);
        return result.id;
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao criar pasta:', error);
      return null;
    }
  }

  // Inicializar Google Drive
  async initialize(): Promise<boolean> {
    try {
      console.log('🔍 === INICIANDO GOOGLE DRIVE ===');
      
      // Carregar Google API
      await this.loadGoogleAPI();
      
      // Verificar se já está autenticado
      if (await this.isAuthenticated()) {
        console.log('✅ Google Drive já autenticado');
        return true;
      }

      // Fazer login
      await this.authenticate();
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar Google Drive:', error);
      return false;
    }
  }

  // Carregar Google API
  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          window.gapi.client.init({
            clientId: this.config.clientId,
            apiKey: this.config.apiKey,
            scope: this.config.scope
          }).then(() => {
            resolve();
          }).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Verificar autenticação
  private async isAuthenticated(): Promise<boolean> {
    try {
      const auth2 = window.gapi.auth2.getAuthInstance();
      return auth2.isSignedIn.get();
    } catch {
      return false;
    }
  }

  // Fazer login
  private async authenticate(): Promise<void> {
    try {
      const auth2 = window.gapi.auth2.getAuthInstance();
      const user = await auth2.signIn();
      this.accessToken = user.getAuthResponse().access_token;
      console.log('✅ Google Drive autenticado com sucesso');
    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      throw error;
    }
  }

  // Upload de arquivo
  async uploadFile(file: File): Promise<DriveFile> {
    try {
      console.log('🔍 === UPLOAD PARA GOOGLE DRIVE ===');
      console.log('🔍 Arquivo:', file.name, 'Tamanho:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('🔍 Pasta de destino:', this.folderId ? 'Configurada' : 'Raiz');

      // Verificar se está autenticado
      if (!this.accessToken) {
        await this.authenticate();
      }

      // Criar metadata do arquivo
      const metadata: any = {
        name: `HCs_Audio_${Date.now()}_${file.name}`,
        mimeType: file.type
      };

      // Usar pasta específica se configurada
      if (this.folderId) {
        metadata.parents = [this.folderId];
        console.log('📁 Salvando na pasta específica:', this.folderId);
      } else {
        metadata.parents = ['root'];
        console.log('📁 Salvando na raiz do Drive');
      }

      // Upload do arquivo
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: form
      });

      if (!response.ok) {
        throw new Error(`Upload falhou: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ Arquivo enviado para Google Drive:', {
        id: result.id,
        nome: result.name,
        tamanho: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        link: result.webViewLink,
        pasta: this.folderId ? 'Específica' : 'Raiz'
      });

      return {
        id: result.id,
        name: result.name,
        webViewLink: result.webViewLink,
        size: file.size,
        mimeType: file.type
      };
    } catch (error) {
      console.error('❌ Erro no upload para Google Drive:', error);
      throw error;
    }
  }

  // Obter link de download
  async getDownloadLink(fileId: string): Promise<string> {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=webContentLink`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao obter link de download');
      }

      const result = await response.json();
      return result.webContentLink;
    } catch (error) {
      console.error('❌ Erro ao obter link de download:', error);
      throw error;
    }
  }

  // Deletar arquivo
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Erro ao deletar arquivo:', error);
      return false;
    }
  }
}

// Instância global
export const googleDriveService = new GoogleDriveService();

// Função helper para decidir onde salvar
export const shouldUseGoogleDrive = (fileSize: number): boolean => {
  const maxLocalStorageSize = 3 * 1024 * 1024; // 3MB (reduzido para evitar problemas de quota)
  return fileSize > maxLocalStorageSize;
};

// Função para verificar se o arquivo é muito grande para qualquer armazenamento
export const isFileTooLarge = (fileSize: number): boolean => {
  const maxAllowedSize = 50 * 1024 * 1024; // 50MB máximo
  return fileSize > maxAllowedSize;
};

// Função para salvar arquivo (localStorage, Vercel Blob ou Google Drive)
export const saveAudioFile = async (file: File, targetFolder?: string, evaluationId?: string): Promise<{
  type: 'local' | 'blob' | 'drive';
  data: string | any;
}> => {
  try {
    console.log('🔍 === SALVANDO ARQUIVO DE ÁUDIO ===');
    console.log('🔍 Nome do arquivo:', file.name);
    console.log('🔍 Tamanho:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('🔍 Tipo MIME:', file.type);
    
    // Verificar se o arquivo é muito grande
    if (isFileTooLarge(file.size)) {
      throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Tamanho máximo permitido: 50MB`);
    }
    
    // Verificar se o Vercel Blob está configurado
    const { isVercelBlobConfigured, shouldUseVercelBlob } = await import('./vercelBlob');
    const hasVercelBlob = isVercelBlobConfigured();
    const shouldUseBlob = shouldUseVercelBlob(file.size);
    
    console.log('🔍 Vercel Blob configurado?', hasVercelBlob);
    console.log('🔍 Deve usar Vercel Blob?', shouldUseBlob);
    
    // Verificar se as credenciais do Google Drive estão configuradas
    const hasValidCredentials = GOOGLE_DRIVE_CONFIG.clientId !== 'YOUR_CLIENT_ID_AQUI' && 
                               GOOGLE_DRIVE_CONFIG.apiKey !== 'YOUR_API_KEY_AQUI';
    
    console.log('🔍 Credenciais Google Drive válidas?', hasValidCredentials);
    
    // Prioridade: Vercel Blob > Google Drive > localStorage
    if (shouldUseBlob && hasVercelBlob) {
      console.log('🔄 Usando Vercel Blob para arquivo grande...');
      const { saveAudioFileToBlob } = await import('./vercelBlob');
      const blobFile = await saveAudioFileToBlob(file, evaluationId || 'unknown');
      console.log('✅ Arquivo salvo no Vercel Blob');
      return { type: 'blob', data: blobFile };
    }
    
    // Se não tem credenciais válidas, verificar se pode usar localStorage
    if (!hasValidCredentials) {
      if (shouldUseGoogleDrive(file.size)) {
        if (hasVercelBlob) {
          throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB) para localStorage. Configure o Vercel Blob ou Google Drive.`);
        } else {
          throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB) para localStorage. Configure o Vercel Blob ou Google Drive para arquivos maiores que 3MB.`);
        }
      }
      
      console.log('⚠️ Credenciais Google Drive não configuradas, usando localStorage...');
      const base64 = await convertFileToBase64(file);
      console.log('✅ Arquivo convertido para Base64 e salvo no localStorage');
      return { type: 'local', data: base64 };
    }
    
    // Se tem credenciais, verificar tamanho
    if (shouldUseGoogleDrive(file.size)) {
      console.log('🔄 Arquivo grande detectado, tentando Google Drive...');
      
      try {
        // Configurar pasta específica se fornecida
        if (targetFolder) {
          await googleDriveService.setTargetFolder(targetFolder);
        }
        
        const driveFile = await googleDriveService.uploadFile(file);
        console.log('✅ Arquivo salvo no Google Drive:', driveFile.name);
        return { type: 'drive', data: driveFile };
      } catch (driveError) {
        console.error('❌ Erro no Google Drive, fallback para localStorage:', driveError);
        console.log('🔄 Convertendo para Base64 como fallback...');
        
        const base64 = await convertFileToBase64(file);
        console.log('✅ Arquivo salvo no localStorage como fallback');
        return { type: 'local', data: base64 };
      }
    } else {
      console.log('🔄 Arquivo pequeno, usando localStorage...');
      const base64 = await convertFileToBase64(file);
      console.log('✅ Arquivo convertido para Base64 e salvo no localStorage');
      return { type: 'local', data: base64 };
    }
  } catch (error) {
    console.error('❌ Erro crítico ao salvar arquivo:', error);
    
    // Último recurso: tentar converter para Base64
    try {
      console.log('🔄 Tentativa de emergência: convertendo para Base64...');
      const base64 = await convertFileToBase64(file);
      console.log('✅ Arquivo salvo no localStorage em modo de emergência');
      return { type: 'local', data: base64 };
    } catch (emergencyError) {
      console.error('❌ Falha total ao salvar arquivo:', emergencyError);
      throw new Error('Não foi possível salvar o arquivo de áudio');
    }
  }
};

// Função para converter arquivo para Base64 (mantida para compatibilidade)
const convertFileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Falha ao converter arquivo para Base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
