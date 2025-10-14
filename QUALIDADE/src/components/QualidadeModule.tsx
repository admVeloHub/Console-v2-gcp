// VERSION: v1.0.1 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
// CORREÇÃO: Removida aba "Relatórios Gestão" do módulo de qualidade

import React, { useState, useEffect } from 'react';
import { Plus, Users, FileText, Bot } from 'lucide-react';
import { Avaliacao, AvaliacaoFormData, Funcionario } from '../types';
import { getAvaliacoes, addAvaliacao, updateAvaliacao, deleteAvaliacao, getFuncionariosAtivos, migrarArquivosAntigos } from '../utils/storage';
import AvaliacaoForm from './AvaliacaoForm';
import AvaliacaoList from './AvaliacaoList';
import RelatorioAgenteComponent from './RelatorioAgente';
import GPTIntegration from './GPTIntegration';
import ConfirmationDialog from './ConfirmationDialog';

type QualidadeView = 'avaliacoes' | 'relatorio-agente' | 'gpt';

const QualidadeModule: React.FC = () => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [currentView, setCurrentView] = useState<QualidadeView>('avaliacoes');
  const [showAvaliacaoForm, setShowAvaliacaoForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingAvaliacao, setEditingAvaliacao] = useState<Avaliacao | null>(null);
  const [deletingAvaliacaoId, setDeletingAvaliacaoId] = useState<string | null>(null);
  const [selectedColaboradorNome, setSelectedColaboradorNome] = useState<string>('');
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<Avaliacao | null>(null);

  useEffect(() => {
    const inicializarModulo = async () => {
      try {
        // Primeiro, migrar arquivos antigos se necessário
        await migrarArquivosAntigos();
        
        // Depois carregar dados
        carregarDados();
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        // Tentar carregar dados mesmo se a migração falhar
        carregarDados();
      }
    };
    
    inicializarModulo();
    
    // Listener para atualizações de dados de qualidade
    const handleQualidadeDataUpdated = (event: CustomEvent) => {
      console.log('🔄 Evento de atualização de qualidade recebido:', event.detail);
      carregarDados();
    };
    
    // Listener para sincronização entre abas/instâncias
    const syncChannel = new BroadcastChannel('velotax-qualidade-sync');
    const handleBroadcastSync = (event: MessageEvent) => {
      if (event.data.type === 'QUALIDADE_DATA_UPDATED') {
        console.log('📡 Sincronização de qualidade recebida via BroadcastChannel:', event.data);
        carregarDados();
      }
    };
    
    window.addEventListener('qualidadeDataUpdated', handleQualidadeDataUpdated as EventListener);
    syncChannel.addEventListener('message', handleBroadcastSync);
    
    // Cleanup
    return () => {
      window.removeEventListener('qualidadeDataUpdated', handleQualidadeDataUpdated as EventListener);
      syncChannel.removeEventListener('message', handleBroadcastSync);
      syncChannel.close();
    };
  }, []);

  const carregarDados = () => {
    try {
      console.log('🔄 Carregando dados de qualidade...');
      
      const data = getAvaliacoes();
      console.log('📊 Avaliações carregadas:', data);
      console.log('📊 Total de avaliações:', data.length);
      
      setAvaliacoes(data);
      
      const funcionariosAtivos = getFuncionariosAtivos();
      console.log('👥 Funcionários ativos carregados:', funcionariosAtivos.length);
      
      setFuncionarios(funcionariosAtivos);
      
      console.log('✅ Dados de qualidade carregados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    }
  };

  // Função para teste manual
  const testarCarregamento = () => {
    console.log('🧪 === TESTE MANUAL DE CARREGAMENTO ===');
    carregarDados();
    
    // Verificar localStorage diretamente
    const rawData = localStorage.getItem('qualidade_avaliacoes');
    console.log('🧪 Dados brutos no localStorage:', rawData);
    
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        console.log('🧪 Dados parseados:', parsed);
        console.log('🧪 É array?', Array.isArray(parsed));
        console.log('🧪 Quantidade:', parsed.length);
      } catch (e) {
        console.error('🧪 Erro ao parsear dados:', e);
      }
    }
  };

  const handleSubmitAvaliacao = async (data: AvaliacaoFormData) => {
    try {
      console.log('🔍 === QUALIDADE MODULE - HANDLE SUBMIT ===');
      console.log('🔍 Dados recebidos:', data);
      console.log('🔍 Arquivo de ligação:', data.arquivoLigacao);
      console.log('🔍 Tipo do arquivo:', typeof data.arquivoLigacao);
      console.log('🔍 É File?', data.arquivoLigacao instanceof File);
      
      if (editingAvaliacao) {
        console.log('🔍 Editando avaliação existente...');
        const updatedAvaliacao = await updateAvaliacao(editingAvaliacao.id, {
          colaboradorNome: data.colaboradorNome,
          avaliador: data.avaliador,
          mes: data.mes,
          ano: data.ano,
          saudacaoAdequada: data.saudacaoAdequada,
          escutaAtiva: data.escutaAtiva,
          resolucaoQuestao: data.resolucaoQuestao,
          empatiaCordialidade: data.empatiaCordialidade,
          direcionouPesquisa: data.direcionouPesquisa,
          procedimentoIncorreto: data.procedimentoIncorreto,
          encerramentoBrusco: data.encerramentoBrusco,
          observacoesModeracao: data.observacoesModeracao
        });
        
        if (updatedAvaliacao) {
          setAvaliacoes(prev => prev.map(a => a.id === editingAvaliacao.id ? updatedAvaliacao : a));
        }
      } else {
        console.log('🔍 Criando nova avaliação...');
        const novaAvaliacao = await addAvaliacao(data);
        console.log('🔍 Nova avaliação retornada:', novaAvaliacao);
        setAvaliacoes(prev => [...prev, novaAvaliacao]);
      }
      
      setShowAvaliacaoForm(false);
      setEditingAvaliacao(null);
      carregarDados();
    } catch (error) {
      console.error('❌ Erro ao salvar avaliação:', error);
    }
  };

  const handleEditAvaliacao = (avaliacao: Avaliacao) => {
    setEditingAvaliacao(avaliacao);
    setShowAvaliacaoForm(true);
  };

  const handleDeleteAvaliacao = (id: string) => {
    setDeletingAvaliacaoId(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAvaliacao = () => {
    if (deletingAvaliacaoId) {
      try {
        deleteAvaliacao(deletingAvaliacaoId);
        setAvaliacoes(prev => prev.filter(a => a.id !== deletingAvaliacaoId));
      } catch (error) {
        console.error('Erro ao excluir avaliação:', error);
      }
    }
    setShowDeleteDialog(false);
    setDeletingAvaliacaoId(null);
  };

  const handleViewAvaliacao = (avaliacao: Avaliacao) => {
    console.log('🔍 === VISUALIZANDO AVALIAÇÃO ===');
    console.log('🔍 Avaliação selecionada:', avaliacao);
    console.log('🔍 ID:', avaliacao.id);
    console.log('🔍 Colaborador:', avaliacao.colaboradorNome);
    console.log('🔍 Data:', avaliacao.dataAvaliacao);
    console.log('🔍 arquivoLigacao:', avaliacao.arquivoLigacao);
    console.log('🔍 arquivoDrive:', avaliacao.arquivoDrive);
    console.log('🔍 nomeArquivo:', avaliacao.nomeArquivo);
    console.log('🔍 Tipo do arquivoLigacao:', typeof avaliacao.arquivoLigacao);
    console.log('🔍 Length do arquivoLigacao:', avaliacao.arquivoLigacao ? avaliacao.arquivoLigacao.length : 'N/A');
    
    // Verificar se há arquivo válido
    const hasValidFile = 
      (avaliacao.arquivoLigacao && 
       typeof avaliacao.arquivoLigacao === 'string' && 
       avaliacao.arquivoLigacao.length > 0 &&
       avaliacao.arquivoLigacao.startsWith('data:audio/')) ||
      (avaliacao.arquivoDrive && 
       typeof avaliacao.arquivoDrive === 'object' && 
       avaliacao.arquivoDrive.id) ||
      (avaliacao.arquivoLigacao && 
       typeof avaliacao.arquivoLigacao === 'object' && 
       'name' in avaliacao.arquivoLigacao);
       
    console.log('🔍 Tem arquivo válido?', hasValidFile);
    
    if (!hasValidFile) {
      console.log('⚠️ === NENHUM ARQUIVO VÁLIDO ENCONTRADO ===');
      console.log('⚠️ Tentando buscar avaliação completa no localStorage...');
      
      try {
        const { getAvaliacaoById } = require('../utils/storage');
        const avaliacaoCompleta = getAvaliacaoById(avaliacao.id);
        
        if (avaliacaoCompleta) {
          console.log('🔍 Avaliação completa encontrada:', avaliacaoCompleta);
          console.log('🔍 arquivoLigacao completo:', avaliacaoCompleta.arquivoLigacao);
          console.log('🔍 arquivoDrive completo:', avaliacaoCompleta.arquivoDrive);
          
          // Usar a avaliação completa se ela tiver arquivo
          if ((avaliacaoCompleta.arquivoLigacao && 
               typeof avaliacaoCompleta.arquivoLigacao === 'string' && 
               avaliacaoCompleta.arquivoLigacao.length > 0) ||
              (avaliacaoCompleta.arquivoDrive && 
               avaliacaoCompleta.arquivoDrive.id)) {
            console.log('✅ Usando avaliação completa com arquivo');
            setSelectedAvaliacao(avaliacaoCompleta);
          } else {
            console.log('❌ Avaliação completa também não tem arquivo');
            setSelectedAvaliacao(avaliacao);
          }
        } else {
          console.log('❌ Avaliação completa não encontrada');
          setSelectedAvaliacao(avaliacao);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar avaliação completa:', error);
        setSelectedAvaliacao(avaliacao);
      }
    } else {
      console.log('✅ Arquivo válido encontrado, usando avaliação original');
      setSelectedAvaliacao(avaliacao);
    }
    
    setCurrentView('gpt');
  };

  const handleGPTAnalysisComplete = () => {
    carregarDados();
  };

  const getNavigationClass = (view: QualidadeView) => {
	return `flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
		currentView === view
			? 'bg-[#000058] text-white'
			: 'text-gray-700 hover:bg-gray-100'
	}`;
};

  const renderCurrentView = () => {
    switch (currentView) {
      case 'avaliacoes':
        return (
          <AvaliacaoList
            avaliacoes={avaliacoes}
            onEdit={handleEditAvaliacao}
            onDelete={handleDeleteAvaliacao}
            onView={handleViewAvaliacao}
          />
        );
      
      case 'relatorio-agente':
        return selectedColaboradorNome ? (
          <RelatorioAgenteComponent
            colaboradorNome={selectedColaboradorNome}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Selecione um colaborador para ver o relatório individual.</p>
          </div>
        );
      
      
      case 'gpt':
        return selectedAvaliacao ? (
          <GPTIntegration
            avaliacao={selectedAvaliacao}
            onAnalysisComplete={handleGPTAnalysisComplete}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Selecione uma avaliação para análise GPT.</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Cabeçalho interno oculto (consolidado no App) */}
      <div className="hidden">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Módulo de Qualidade</h1>
              <p className="text-gray-600 mt-1">Avaliação e monitoramento da qualidade das ligações</p>
            </div>
            {currentView === 'avaliacoes' && (
              <button className="bg-[#000058] text-white px-6 py-3 rounded-lg">
                Nova Avaliação
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navegação compacta com ação lateral */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-2 sm:px-3 lg:px-4">
          <div className="flex items-center justify-between">
            <nav className="flex space-x-1 overflow-x-auto">
              <button onClick={() => setCurrentView('avaliacoes')} className={getNavigationClass('avaliacoes')}>
                <FileText size={18} />
                <span className="text-sm">Avaliações</span>
              </button>
              <button onClick={() => setCurrentView('relatorio-agente')} className={getNavigationClass('relatorio-agente')}>
                <Users size={18} />
                <span className="text-sm">Relatório do Agente</span>
              </button>
              <button onClick={() => setCurrentView('gpt')} className={getNavigationClass('gpt')}>
                <Bot size={18} />
                <span className="text-sm">Agente GPT</span>
              </button>
            </nav>

            {currentView === 'avaliacoes' && (
              <div className="flex items-center space-x-2">
                                 <button
                   onClick={testarCarregamento}
                   className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm flex items-center space-x-2"
                   title="Testar carregamento de dados"
                 >
                   🧪
                   <span>Testar</span>
                 </button>
                 <button
                   onClick={async () => {
                     try {
                       console.log('🔄 Iniciando migração manual...');
                       const resultado = await migrarArquivosAntigos();
                       
                       let mensagem = `✅ Migração concluída!\n\n`;
                       mensagem += `📊 Estatísticas:\n`;
                       mensagem += `• Total de avaliações: ${resultado.total}\n`;
                       mensagem += `• Arquivos migrados: ${resultado.migrados}\n`;
                       mensagem += `• Arquivos removidos: ${resultado.removidos}\n\n`;
                       
                       if (resultado.migrados > 0) {
                         mensagem += `🎵 ${resultado.migrados} arquivos de áudio agora funcionam!\n`;
                       }
                       
                       if (resultado.removidos > 0) {
                         mensagem += `🗑️ ${resultado.removidos} arquivos inacessíveis foram removidos.\n`;
                       }
                       
                       if (resultado.migrados === 0 && resultado.removidos === 0) {
                         mensagem += `ℹ️ Nenhuma ação necessária.\n`;
                       }
                       
                       mensagem += `\nRecarregando dados...`;
                       
                       alert(mensagem);
                       carregarDados();
                     } catch (error) {
                       console.error('❌ Erro na migração:', error);
                       alert('❌ Erro na migração. Verifique o console.');
                     }
                   }}
                   className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center space-x-2"
                   title="Migrar arquivos antigos para Base64"
                 >
                   🔄
                   <span>Migrar</span>
                 </button>
                <button
                  onClick={() => setShowAvaliacaoForm(true)}
                  className="px-3 py-2 bg-[#000058] text-white rounded-lg hover:opacity-90 transition-colors text-sm flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Nova Avaliação</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal compacto */}
      <main className="w-full px-2 sm:px-3 lg:px-4 py-3">
        {/* Seletor de Colaborador para Relatório Individual */}
        {currentView === 'relatorio-agente' && (
          <div className="mb-3 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um Colaborador</label>
            <select
              value={selectedColaboradorNome}
              onChange={(e) => {
                setSelectedColaboradorNome(e.target.value);
              }}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000058] focus:border-transparent"
            >
              <option value="">Selecione um colaborador</option>
              {funcionarios.map((funcionario) => (
                <option key={funcionario.id} value={funcionario.nomeCompleto}>
                  {funcionario.nomeCompleto} - {funcionario.empresa}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Seletor de Avaliação para GPT */}
        {currentView === 'gpt' && (
          <div className="mb-3 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecione uma Avaliação para Análise GPT</label>
            <select
              value={selectedAvaliacao?.id || ''}
              onChange={(e) => {
                const avaliacao = avaliacoes.find(a => a.id === e.target.value);
                setSelectedAvaliacao(avaliacao || null);
              }}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000058] focus:border-transparent"
            >
              <option value="">Selecione uma avaliação</option>
              {avaliacoes.map((avaliacao) => (
                <option key={avaliacao.id} value={avaliacao.id}>
                  {avaliacao.colaboradorNome} - {avaliacao.mes} {avaliacao.ano} ({avaliacao.pontuacaoTotal} pts)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Renderização da View Atual */}
        {renderCurrentView()}
      </main>

      {/* Formulário de Avaliação */}
      {showAvaliacaoForm && (
        <AvaliacaoForm
          initialData={editingAvaliacao ? {
            colaboradorNome: editingAvaliacao.colaboradorNome,
            avaliador: editingAvaliacao.avaliador,
            mes: editingAvaliacao.mes,
            ano: editingAvaliacao.ano,
            saudacaoAdequada: editingAvaliacao.saudacaoAdequada,
            escutaAtiva: editingAvaliacao.escutaAtiva,
            resolucaoQuestao: editingAvaliacao.resolucaoQuestao,
            empatiaCordialidade: editingAvaliacao.empatiaCordialidade,
            direcionouPesquisa: editingAvaliacao.direcionouPesquisa,
            procedimentoIncorreto: editingAvaliacao.procedimentoIncorreto,
            encerramentoBrusco: editingAvaliacao.encerramentoBrusco,
            observacoesModeracao: editingAvaliacao.observacoesModeracao
          } : undefined}
          isEditing={!!editingAvaliacao}
          onSubmit={handleSubmitAvaliacao}
          onCancel={() => {
            setShowAvaliacaoForm(false);
            setEditingAvaliacao(null);
          }}
        />
      )}

      {/* Dialog de Confirmação de Exclusão */}
      {showDeleteDialog && (
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          title="Excluir Avaliação"
          message="Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita."
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={confirmDeleteAvaliacao}
          onCancel={() => {
            setShowDeleteDialog(false);
            setDeletingAvaliacaoId(null);
          }}
          isDestructive={true}
        />
      )}
    </div>
  );
};

export default QualidadeModule;
