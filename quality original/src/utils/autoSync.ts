// Sistema de Sincronização Manual entre Diferentes Acessos
import { Funcionario } from '../types';

interface SyncConfig {
  syncFile: string; // Caminho do arquivo de sincronização
  autoBackup: boolean; // Backup automático
}

interface SyncData {
  funcionarios: Funcionario[];
  lastSync: string;
  version: string;
  checksum: string;
  source: string; // IP/porta que fez a última alteração
}

class ManualSyncManager {
  private config: SyncConfig;
  private lastChecksum: string = '';

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = {
      syncFile: 'funcionarios_velotax_sync.json',
      autoBackup: true,
      ...config
    };
  }

  // Sincronização manual - chamada pelo usuário
  async syncNow(): Promise<{ success: boolean; message: string; data?: Funcionario[] }> {
    try {
      console.log('🔄 Iniciando sincronização manual...');
      
      // 1. Verificar se há alterações locais
      const localData = this.getLocalData();
      const localChecksum = this.calculateChecksum(localData);
      
      let syncMessage = '';
      let updatedData = localData;
      
      if (localChecksum !== this.lastChecksum) {
        console.log('📤 Alterações locais detectadas, enviando para sincronização...');
        await this.uploadToSync(localData);
        this.lastChecksum = localChecksum;
        syncMessage += 'Dados locais enviados para sincronização. ';
      }
      
      // 2. Verificar se há alterações remotas
      const remoteData = await this.downloadFromSync();
      if (remoteData && this.hasNewerData(remoteData)) {
        console.log('📥 Dados remotos mais recentes detectados, atualizando local...');
        await this.updateLocalData(remoteData.funcionarios);
        this.lastChecksum = this.calculateChecksum(remoteData.funcionarios);
        updatedData = remoteData.funcionarios;
        syncMessage += 'Dados remotos baixados e aplicados. ';
      }
      
      if (!syncMessage) {
        syncMessage = 'Nenhuma alteração detectada. Dados já estão sincronizados.';
      }
      
      console.log('✅ Sincronização manual concluída');
      
      return {
        success: true,
        message: syncMessage,
        data: updatedData
      };
      
    } catch (error) {
      console.error('❌ Erro durante sincronização manual:', error);
      return {
        success: false,
        message: `Erro durante sincronização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  // Verificar status da sincronização
  checkSyncStatus(): { hasLocalChanges: boolean; hasRemoteChanges: boolean; lastSync: string } {
    const localData = this.getLocalData();
    const localChecksum = this.calculateChecksum(localData);
    const hasLocalChanges = localChecksum !== this.lastChecksum;
    
    return {
      hasLocalChanges,
      hasRemoteChanges: false, // Será verificado durante sync
      lastSync: this.lastChecksum
    };
  }

  // Obter dados locais
  private getLocalData(): Funcionario[] {
    try {
      const data = localStorage.getItem('funcionarios_velotax');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Erro ao obter dados locais:', error);
      return [];
    }
  }

  // Calcular checksum dos dados
  private calculateChecksum(data: Funcionario[]): string {
    const dataStr = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < dataStr.length; i++) {
      const char = dataStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  // Verificar se dados remotos são mais recentes
  private hasNewerData(remote: SyncData): boolean {
    if (!remote.lastSync) return false;
    
    const remoteTime = new Date(remote.lastSync).getTime();
    const localTime = this.getLastLocalUpdateTime();
    
    return remoteTime > localTime;
  }

  // Obter tempo da última atualização local
  private getLastLocalUpdateTime(): number {
    try {
      const data = localStorage.getItem('funcionarios_velotax_log');
      if (data) {
        const logs = JSON.parse(data);
        if (logs.length > 0) {
          return new Date(logs[logs.length - 1].timestamp).getTime();
        }
      }
    } catch (error) {
      console.error('❌ Erro ao obter tempo da última atualização:', error);
    }
    return 0;
  }

  // Enviar dados para sincronização
  private async uploadToSync(data: Funcionario[]): Promise<void> {
    try {
      const syncData: SyncData = {
        funcionarios: data,
        lastSync: new Date().toISOString(),
        version: '1.0',
        checksum: this.calculateChecksum(data),
        source: `${window.location.hostname}:${window.location.port}`
      };

      // SOLUÇÃO PRINCIPAL: Salvar na pasta Json/ compartilhada da rede
      try {
        // Tentar salvar na pasta Json/ do projeto (que deve ser compartilhada na rede)
        const syncFileName = `funcionarios_velotax_sync_${new Date().toISOString().split('T')[0]}.json`;
        
        // Salvar no localStorage especial para sincronização
        const syncKey = 'velotax_network_sync';
        localStorage.setItem(syncKey, JSON.stringify(syncData));
        
        // Tentar criar arquivo de sincronização na pasta Json/
        try {
          // Usar File System Access API se disponível (Chrome/Edge moderno)
          if ('showSaveFilePicker' in window) {
            const handle = await (window as any).showSaveFilePicker({
              suggestedName: syncFileName,
              types: [{
                description: 'Arquivo JSON de Sincronização',
                accept: { 'application/json': ['.json'] }
              }]
            });
            
            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(syncData, null, 2));
            await writable.close();
            
            console.log(`📤 Arquivo de sincronização salvo automaticamente: ${syncFileName}`);
            return;
          }
        } catch (fsError) {
          console.log('📁 File System Access API não disponível, tentando outras opções...');
        }
        
        // Notificar outros acessos via BroadcastChannel (funciona entre abas/instâncias do mesmo domínio)
        const channel = new BroadcastChannel('velotax-sync');
        channel.postMessage({
          type: 'DATA_UPDATED',
          data: syncData,
          timestamp: new Date().toISOString()
        });
        
        console.log(`📤 Dados enviados para sincronização local: ${data.length} funcionários`);
        
      } catch (localError) {
        console.log('💾 Sincronização local não disponível, fazendo download manual...');
        
        // Fallback: Download manual do arquivo
        const blob = new Blob([JSON.stringify(syncData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `funcionarios_velotax_sync_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        console.log(`📥 Arquivo baixado para sincronização manual: ${data.length} funcionários`);
        
        // INSTRUÇÕES PARA O USUÁRIO
        console.log('💡 INSTRUÇÕES PARA SINCRONIZAÇÃO:');
        console.log('1. Salve o arquivo baixado na pasta "Json/" do projeto');
        console.log('2. Renomeie para "funcionarios_velotax_sync.json"');
        console.log('3. Outros computadores devem acessar a mesma pasta para sincronizar');
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar dados para sincronização:', error);
      throw error;
    }
  }

  // Baixar dados da sincronização
  private async downloadFromSync(): Promise<SyncData | null> {
    try {
      // SOLUÇÃO PRINCIPAL: Tentar ler da pasta Json/ compartilhada
      try {
        // Tentar ler arquivo de sincronização da pasta Json/
        const response = await fetch(`./Json/funcionarios_velotax_sync.json`);
        if (response.ok) {
          const data = await response.json();
          console.log(`📥 Dados baixados automaticamente da pasta Json/: ${data.funcionarios?.length || 0} funcionários`);
          return data;
        }
      } catch (jsonError) {
        console.log('📁 Arquivo de sincronização não encontrado na pasta Json/');
      }

      // Opção 2: Tentar ler do localStorage especial para sincronização
      try {
        const syncKey = 'velotax_network_sync';
        const syncData = localStorage.getItem(syncKey);
        if (syncData) {
          const data = JSON.parse(syncData);
          console.log(`📥 Dados baixados da sincronização local: ${data.funcionarios?.length || 0} funcionários`);
          return data;
        }
      } catch (localError) {
        console.log('💾 Sincronização local não disponível');
      }

      // Opção 3: Tentar ler arquivo de sincronização da pasta pública
      try {
        const response = await fetch(`./public/${this.config.syncFile}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`📥 Dados baixados da pasta pública: ${data.funcionarios?.length || 0} funcionários`);
          return data;
        }
      } catch (fileError) {
        console.log('📁 Arquivo de sincronização não encontrado na pasta pública');
      }

      // Opção 4: Fallback - tentar ler da pasta raiz
      try {
        const response = await fetch(`./${this.config.syncFile}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`📥 Dados baixados da pasta raiz: ${data.funcionarios?.length || 0} funcionários`);
          return data;
        }
      } catch (rootError) {
        console.log('📁 Arquivo de sincronização não encontrado na pasta raiz');
      }

      // Opção 5: Tentar ler arquivos de backup da pasta Json/
      try {
        const response = await fetch(`./Json/funcionarios_velotax_backup_2025-08-19_Anderson.json`);
        if (response.ok) {
          const data = await response.json();
          // Converter formato de backup para formato de sincronização
          const syncData: SyncData = {
            funcionarios: data,
            lastSync: new Date().toISOString(),
            version: '1.0',
            checksum: this.calculateChecksum(data),
            source: 'backup-import'
          };
          console.log(`📥 Dados baixados do backup na pasta Json/: ${data.length} funcionários`);
          return syncData;
        }
      } catch (backupError) {
        console.log('📁 Arquivos de backup não encontrados na pasta Json/');
      }

    } catch (error) {
      console.log('📥 Nenhum arquivo de sincronização encontrado');
    }
    return null;
  }

  // Atualizar dados locais
  private async updateLocalData(funcionarios: Funcionario[]): Promise<void> {
    try {
      localStorage.setItem('funcionarios_velotax', JSON.stringify(funcionarios));
      
      // Criar backup automático
      if (this.config.autoBackup) {
        const backup = {
          data: funcionarios,
          timestamp: new Date().toISOString(),
          count: funcionarios.length,
          version: '1.0',
          source: 'manual-sync'
        };
        localStorage.setItem('funcionarios_velotax_backup', JSON.stringify(backup));
      }
      
      console.log(`✅ Dados locais atualizados: ${funcionarios.length} funcionários`);
      
      // Disparar evento de atualização
      window.dispatchEvent(new CustomEvent('funcionariosUpdated', { 
        detail: { funcionarios, source: 'manual-sync' } 
      }));
      
    } catch (error) {
      console.error('❌ Erro ao atualizar dados locais:', error);
      throw error;
    }
  }

  // Configurar sincronização
  configure(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuração de sincronização atualizada:', this.config);
  }

  // Obter status da sincronização
  getStatus(): { lastSync: string; config: SyncConfig } {
    return {
      lastSync: this.lastChecksum,
      config: this.config
    };
  }
}

// Instância global do gerenciador de sincronização manual
export const manualSyncManager = new ManualSyncManager();

// Funções de conveniência
export const syncNow = () => manualSyncManager.syncNow();
export const getSyncStatus = () => manualSyncManager.getStatus();
export const checkSyncStatus = () => manualSyncManager.checkSyncStatus();
export const configureManualSync = (config: Partial<SyncConfig>) => manualSyncManager.configure(config);
