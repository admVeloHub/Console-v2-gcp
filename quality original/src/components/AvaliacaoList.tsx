import React, { useState } from 'react';
import { Edit, Trash2, Eye, Bot, Volume2, Play, Download, AlertTriangle } from 'lucide-react';
import { Avaliacao, MESES, ANOS } from '../types';

interface AvaliacaoListProps {
  avaliacoes: Avaliacao[];
  onEdit: (avaliacao: Avaliacao) => void;
  onDelete: (id: string) => void;
  onView: (avaliacao: Avaliacao) => void;
}

const AvaliacaoList: React.FC<AvaliacaoListProps> = ({
  avaliacoes,
  onEdit,
  onDelete,
  onView
}) => {
  const [filterMes, setFilterMes] = useState<string>('');
  const [filterAno, setFilterAno] = useState<number>(0);
  const [filterColaborador, setFilterColaborador] = useState<string>('');
  const [expandedColaboradores, setExpandedColaboradores] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const filteredAvaliacoes = avaliacoes.filter(avaliacao => {
    if (filterMes && avaliacao.mes !== filterMes) return false;
    if (filterAno && avaliacao.ano !== filterAno) return false;
    if (filterColaborador && !avaliacao.colaboradorNome.toLowerCase().includes(filterColaborador.toLowerCase())) return false;
    return true;
  });

  // Agrupar avaliações por colaborador
  const avaliacoesAgrupadas = filteredAvaliacoes.reduce((acc, avaliacao) => {
    const colaboradorId = avaliacao.colaboradorId;
    if (!acc[colaboradorId]) {
      acc[colaboradorId] = {
        colaboradorNome: avaliacao.colaboradorNome,
        colaboradorId: colaboradorId,
        avaliacoes: []
      };
    }
    acc[colaboradorId].avaliacoes.push(avaliacao);
    return acc;
  }, {} as Record<string, { colaboradorNome: string; colaboradorId: string; avaliacoes: Avaliacao[] }>);

  // Ordenar avaliações de cada colaborador por data (mais recente primeiro)
  Object.values(avaliacoesAgrupadas).forEach(grupo => {
    grupo.avaliacoes.sort((a, b) => 
      new Date(b.dataAvaliacao).getTime() - new Date(a.dataAvaliacao).getTime()
    );
  });

  // Ordenar colaboradores por nome
  const colaboradoresOrdenados = Object.values(avaliacoesAgrupadas).sort((a, b) => 
    a.colaboradorNome.localeCompare(b.colaboradorNome)
  );

  // Debug: Verificar avaliações e arquivos de áudio
  console.log('🔍 AvaliacaoList - Total de avaliações:', avaliacoes.length);
  console.log('🔍 AvaliacaoList - Avaliações filtradas:', filteredAvaliacoes.length);
  console.log('🔍 AvaliacaoList - Colaboradores agrupados:', colaboradoresOrdenados.length);
  avaliacoes.forEach((av, index) => {
    console.log(`🔍 Avaliação ${index + 1}:`, {
      id: av.id,
      colaborador: av.colaboradorNome,
      temArquivo: !!av.arquivoLigacao,
      tipoArquivo: av.arquivoLigacao ? (av.arquivoLigacao.startsWith('data:') ? 'Base64' : 'URL') : 'Nenhum'
    });
  });

  const getStatusClass = (pontuacao: number) => {
    if (pontuacao >= 80) return 'text-green-600 bg-green-100';
    if (pontuacao >= 60) return 'text-yellow-600 bg-yellow-100';
    if (pontuacao >= 0) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusText = (pontuacao: number) => {
    if (pontuacao >= 80) return 'Excelente';
    if (pontuacao >= 60) return 'Bom';
    if (pontuacao >= 0) return 'Regular';
    return 'Insuficiente';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleColaboradorExpansion = (colaboradorId: string) => {
    const newExpandedColaboradores = new Set(expandedColaboradores);
    if (newExpandedColaboradores.has(colaboradorId)) {
      newExpandedColaboradores.delete(colaboradorId);
    } else {
      newExpandedColaboradores.add(colaboradorId);
    }
    setExpandedColaboradores(newExpandedColaboradores);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const hasAudioFile = (avaliacao: Avaliacao): boolean => {
    // Verificar se existe arquivo de ligação
    if (avaliacao.arquivoLigacao) {
      if (typeof avaliacao.arquivoLigacao === 'string') {
        // Base64 string
        if (avaliacao.arquivoLigacao.startsWith('data:audio/')) {
          return true;
        }
        if (avaliacao.arquivoLigacao.startsWith('http') || avaliacao.arquivoLigacao.startsWith('blob:')) {
          return true;
        }
      }
      
      // File object
      if (avaliacao.arquivoLigacao && typeof avaliacao.arquivoLigacao === 'object' && 'name' in avaliacao.arquivoLigacao) {
        return true;
      }
    }
    
    // Se tem nomeArquivo mas não arquivoLigacao, verificar se existe no localStorage
    if (avaliacao.nomeArquivo && !avaliacao.arquivoLigacao) {
      try {
        const avaliacoes = JSON.parse(localStorage.getItem('qualidade_avaliacoes') || '[]');
        const avaliacaoCompleta = avaliacoes.find((a: any) => a.id === avaliacao.id);
        
        if (avaliacaoCompleta && avaliacaoCompleta.arquivoLigacao) {
          return true;
        }
      } catch (error) {
        console.error('Erro ao verificar localStorage:', error);
      }
    }
    
    return false;
  };

  // Função para reproduzir áudio
  const playAudio = async (arquivoLigacao: string) => {
    try {
      console.log('🎵 Tentando reproduzir áudio...');
      
      // Verificar se é Base64
      if (arquivoLigacao.startsWith('data:audio/')) {
        console.log('✅ Arquivo Base64 detectado, convertendo para Blob...');
        
        try {
          // Converter Base64 para Blob
          const { convertBase64ToBlob } = await import('../utils/storage');
          const blob = convertBase64ToBlob(arquivoLigacao);
          
          // Criar URL temporária para o blob
          const blobUrl = URL.createObjectURL(blob);
          console.log('✅ Blob URL criada:', blobUrl);
          
          // Reproduzir áudio
          const audio = new Audio();
          audio.volume = 0.8;
          
          audio.addEventListener('loadstart', () => {
            console.log('🎵 Iniciando carregamento do áudio...');
          });
          
          audio.addEventListener('canplay', () => {
            console.log('✅ Áudio pronto para reprodução');
            audio.play().catch(err => {
              console.error('❌ Erro ao iniciar reprodução:', err);
              alert('Erro ao reproduzir o áudio. Verifique as permissões do navegador.');
            });
          });
          
          audio.addEventListener('error', (e) => {
            console.error('❌ Erro ao carregar áudio:', e);
            alert('Erro ao reproduzir o áudio. O arquivo pode estar corrompido.');
          });
          
          audio.addEventListener('ended', () => {
            // Limpar blob URL após reprodução
            URL.revokeObjectURL(blobUrl);
            console.log('🧹 Blob URL limpa após reprodução');
          });
          
          audio.src = blobUrl;
          audio.load();
          
        } catch (error) {
          console.error('❌ Erro ao converter Base64 para Blob:', error);
          alert('Erro ao processar o arquivo de áudio. O arquivo pode estar corrompido.');
        }
        
      } else if (arquivoLigacao.startsWith('blob:') || arquivoLigacao.startsWith('http')) {
        // Tentar migrar arquivo antigo automaticamente
        console.log('⚠️ Arquivo antigo detectado, tentando migração automática...');
        
        try {
          const response = await fetch(arquivoLigacao);
          if (response.ok) {
            const blob = await response.blob();
            
            // Converter para Base64
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  resolve(reader.result);
                } else {
                  reject(new Error('Falha ao converter para Base64'));
                }
              };
              reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
              reader.readAsDataURL(blob);
            });
            
            console.log('✅ Arquivo migrado automaticamente, reproduzindo...');
            
            // Reproduzir o Base64 convertido
            const { convertBase64ToBlob } = await import('../utils/storage');
            const novoBlob = convertBase64ToBlob(base64);
            const blobUrl = URL.createObjectURL(novoBlob);
            
            const audio = new Audio();
            audio.volume = 0.8;
            
            audio.addEventListener('ended', () => {
              URL.revokeObjectURL(blobUrl);
            });
            
            audio.src = blobUrl;
            audio.load();
            
            // TODO: Atualizar o arquivo no localStorage para Base64
            console.log('💡 Considere recarregar a página para migração permanente');
            
          } else {
            throw new Error('Arquivo não acessível');
          }
          
         } catch (error) {
           console.error('❌ Falha na migração automática:', error);
           alert('Arquivo de áudio não acessível. Clique no botão "Migrar" para resolver o problema.');
         }
        
      } else {
        alert('Formato de arquivo não suportado para reprodução.');
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar áudio:', error);
      alert('Erro ao processar o arquivo de áudio. Verifique se o arquivo está disponível.');
    }
  };

  // Função para baixar áudio
  const downloadAudio = async (arquivoLigacao: string, nomeArquivo?: string) => {
    try {
      console.log('📥 Tentando baixar áudio...');
      
      // Verificar se é Base64
      if (arquivoLigacao.startsWith('data:audio/')) {
        console.log('✅ Arquivo Base64 detectado, convertendo para download...');
        
        try {
          // Converter Base64 para Blob
          const { convertBase64ToBlob } = await import('../utils/storage');
          const blob = convertBase64ToBlob(arquivoLigacao);
          
          // Criar URL temporária para download
          const blobUrl = URL.createObjectURL(blob);
          console.log('✅ Blob URL criada para download:', blobUrl);
          
          // Criar link de download
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = nomeArquivo || 'audio_ligacao.mp3';
          
          // Simular clique
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Limpar blob URL após download
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
            console.log('🧹 Blob URL limpa após download');
          }, 1000);
          
          console.log('✅ Download iniciado com sucesso');
          
        } catch (error) {
          console.error('❌ Erro ao converter Base64 para download:', error);
          alert('Erro ao processar o arquivo para download. O arquivo pode estar corrompido.');
        }
        
      } else if (arquivoLigacao.startsWith('blob:') || arquivoLigacao.startsWith('http')) {
        // Fallback para URLs antigas (compatibilidade)
        console.log('⚠️ URL antiga detectada, tentando download direto...');
        
        try {
          // Criar link de download
          const link = document.createElement('a');
          link.href = arquivoLigacao;
          
          // Definir nome do arquivo
          const fileName = nomeArquivo || `gravacao_ligacao_${Date.now()}.wav`;
          link.download = fileName;
          
          // Adicionar ao DOM temporariamente
          document.body.appendChild(link);
          
          // Simular clique
          link.click();
          
          // Remover do DOM
          document.body.removeChild(link);
          
          console.log('✅ Download iniciado:', fileName);
          return;
        } catch (directError) {
          console.log('⚠️ Download direto falhou, tentando fetch...', directError);
        }
      }

      // Se download direto falhou, tentar fetch
      console.log('📁 Fazendo fetch do arquivo...');
      
      const response = await fetch(arquivoLigacao);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Criar URL do blob
      const url = window.URL.createObjectURL(blob);
      
      // Criar link de download
      const link = document.createElement('a');
      link.href = url;
      
      // Definir nome do arquivo
      const fileName = nomeArquivo || `gravacao_ligacao_${Date.now()}.wav`;
      link.download = fileName;
      
      // Adicionar ao DOM temporariamente
      document.body.appendChild(link);
      
      // Simular clique
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download concluído via fetch:', fileName);
      
    } catch (error) {
      console.error('❌ Erro no download:', error);
      
      // Verificar se é um problema de rede
      if (error instanceof Error && error.message.includes('HTTP error')) {
        alert('Erro ao baixar o arquivo. Verifique se o arquivo está disponível no servidor.');
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Erro de conexão. Verifique sua conexão com a internet.');
      } else {
        alert('Erro ao processar o download do arquivo. Tente novamente.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Filtros de Avaliação</h3>
          <button
            onClick={toggleFilters}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Mês
                </label>
                <select
                  value={filterMes}
                  onChange={(e) => setFilterMes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                >
                  <option value="">Todos os meses</option>
                  {MESES.map((mes) => (
                    <option key={mes} value={mes}>
                      {mes}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Ano
                </label>
                <select
                  value={filterAno}
                  onChange={(e) => setFilterAno(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                >
                  <option value={0}>Todos os anos</option>
                  {ANOS.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Colaborador
                </label>
                <input
                  type="text"
                  value={filterColaborador}
                  onChange={(e) => setFilterColaborador(e.target.value)}
                  placeholder="Nome do colaborador"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterMes('');
                    setFilterAno(0);
                    setFilterColaborador('');
                  }}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Avaliações */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">
                              Avaliações ({filteredAvaliacoes.length})
                            </h3>
                            <button
                              onClick={() => {
                                console.log('🧪 === TESTE MANUAL ===');
                                console.log('Total de avaliações:', avaliacoes.length);
                                avaliacoes.forEach((av, index) => {
                                  console.log(`Avaliação ${index + 1}:`, {
                                    id: av.id,
                                    colaborador: av.colaboradorNome,
                                    temArquivo: !!av.arquivoLigacao,
                                    arquivoLigacao: av.arquivoLigacao,
                                    nomeArquivo: av.nomeArquivo
                                  });
                                });
                              }}
                              className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                              title="Testar dados das avaliações"
                            >
                              🧪 Testar
                            </button>
                          </div>
                        </div>

        {colaboradoresOrdenados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhuma avaliação encontrada com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {colaboradoresOrdenados.map((grupo) => (
              <div key={grupo.colaboradorId} className="hover:bg-gray-50 transition-colors">
                {/* Cabeçalho Colapsável */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleColaboradorExpansion(grupo.colaboradorId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Cabeçalho */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {grupo.colaboradorNome}
                          </h4>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {grupo.avaliacoes.length} avaliações
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClass(grupo.avaliacoes[0]?.pontuacaoTotal || 0)}`}>
                            {getStatusText(grupo.avaliacoes[0]?.pontuacaoTotal || 0)}
                          </span>
                          <span className="text-lg font-bold text-gray-800">
                            {grupo.avaliacoes[0]?.pontuacaoTotal || 0} pts
                          </span>
                          {/* Ícone de expansão */}
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${expandedColaboradores.has(grupo.colaboradorId) ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conteúdo Expansível */}
                {expandedColaboradores.has(grupo.colaboradorId) && (
                  <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50">
                    <div className="pt-4 space-y-4">
                      {/* Lista de todas as avaliações do colaborador */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-700 mb-3">Todas as Monitorias:</h5>
                        {grupo.avaliacoes.map((avaliacao) => (
                          <div key={avaliacao.id} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  {avaliacao.mes} {avaliacao.ano}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  📅 {formatDate(avaliacao.dataAvaliacao)}
                                </span>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClass(avaliacao.pontuacaoTotal)}`}>
                                  {getStatusText(avaliacao.pontuacaoTotal)} {avaliacao.pontuacaoTotal} pts
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onView(avaliacao);
                                  }}
                                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                  title="Visualizar avaliação"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(avaliacao);
                                  }}
                                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                  title="Editar avaliação"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(avaliacao.id);
                                  }}
                                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                  title="Excluir avaliação"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            {/* Acesso Rápido à Gravação */}
                            {hasAudioFile(avaliacao) ? (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200 mb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <Volume2 className="h-4 w-4 text-blue-600" />
                                    <div>
                                      <h6 className="font-medium text-blue-800 text-sm">Gravação da Ligação</h6>
                                      <p className="text-xs text-blue-700">
                                        {avaliacao.nomeArquivo || 'Arquivo de áudio'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playAudio(avaliacao.arquivoLigacao!);
                                      }}
                                      className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                                      title="Reproduzir gravação"
                                    >
                                      <Play className="h-3 w-3" />
                                      <span>Reproduzir</span>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        downloadAudio(avaliacao.arquivoLigacao!, avaliacao.nomeArquivo);
                                      }}
                                      className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                                      title="Baixar gravação"
                                    >
                                      <Download className="h-3 w-3" />
                                      <span>Baixar</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3">
                                <div className="flex items-center space-x-3">
                                  <Volume2 className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <h6 className="font-medium text-gray-600 text-sm">Gravação da Ligação</h6>
                                    <p className="text-xs text-gray-500">
                                      Nenhum arquivo de áudio anexado
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Critérios da avaliação */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div className={`px-2 py-1 rounded ${avaliacao.saudacaoAdequada ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                Saudação: {avaliacao.saudacaoAdequada ? '✓' : '✗'}
                              </div>
                              <div className={`px-2 py-1 rounded ${avaliacao.escutaAtiva ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                Escuta: {avaliacao.escutaAtiva ? '✓' : '✗'}
                              </div>
                              <div className={`px-2 py-1 rounded ${avaliacao.resolucaoQuestao ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                Resolução: {avaliacao.resolucaoQuestao ? '✓' : '✗'}
                              </div>
                              <div className={`px-2 py-1 rounded ${avaliacao.empatiaCordialidade ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                Empatia: {avaliacao.empatiaCordialidade ? '✓' : '✗'}
                              </div>
                              <div className={`px-2 py-1 rounded ${avaliacao.direcionouPesquisa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                Pesquisa: {avaliacao.direcionouPesquisa ? '✓' : '✗'}
                              </div>
                              <div className={`px-2 py-1 rounded ${avaliacao.procedimentoIncorreto ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                                Procedimento: {avaliacao.procedimentoIncorreto ? '✗' : '✓'}
                              </div>
                              <div className={`px-2 py-1 rounded ${avaliacao.encerramentoBrusco ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                                Encerramento: {avaliacao.encerramentoBrusco ? '✗' : '✓'}
                              </div>
                              <div className={`px-2 py-1 rounded ${avaliacao.moderado ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {avaliacao.moderado ? 'Moderado' : 'Pendente'}
                              </div>
                            </div>

                            {/* Avaliador */}
                            <div className="mt-3 text-xs text-gray-600">
                              <span className="font-medium">Avaliador:</span> {avaliacao.avaliador}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Comparativo GPT vs Avaliador (usando a primeira avaliação) */}
                      {grupo.avaliacoes[0]?.avaliacaoGPT && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-center space-x-3 mb-3">
                            <Bot className="h-5 w-5 text-purple-600" />
                            <h5 className="font-medium text-purple-800">Comparativo GPT vs Avaliador</h5>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                              <div className="text-2xl font-bold text-purple-600">
                                {grupo.avaliacoes[0]?.avaliacaoGPT.pontuacaoGPT}
                              </div>
                              <div className="text-xs text-gray-600">Pontos GPT</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                              <div className="text-2xl font-bold text-blue-600">
                                {grupo.avaliacoes[0]?.pontuacaoTotal}
                              </div>
                              <div className="text-xs text-gray-600">Pontos Avaliador</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                              <div className={`text-2xl font-bold ${Math.abs(grupo.avaliacoes[0]?.avaliacaoGPT.pontuacaoGPT - grupo.avaliacoes[0]?.pontuacaoTotal) <= 10 ? 'text-green-600' : 'text-orange-600'}`}>
                                {Math.abs(grupo.avaliacoes[0]?.avaliacaoGPT.pontuacaoGPT - grupo.avaliacoes[0]?.pontuacaoTotal)}
                              </div>
                              <div className="text-xs text-gray-600">Diferença</div>
                            </div>
                          </div>
                          
                          {/* Palavras Críticas */}
                          {grupo.avaliacoes[0]?.avaliacaoGPT.palavrasCriticas && grupo.avaliacoes[0]?.avaliacaoGPT.palavrasCriticas.length > 0 && (
                            <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                              <div className="flex items-center space-x-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800">Palavras Críticas Identificadas</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {grupo.avaliacoes[0]?.avaliacaoGPT.palavrasCriticas.map((palavra, index) => (
                                  <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                    {palavra}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Informações Gerais */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h5 className="font-medium text-gray-700 mb-3">Informações Gerais</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Total de Avaliações:</span> {grupo.avaliacoes.length}
                          </div>
                          <div>
                            <span className="font-medium">Média de Pontos:</span> {
                              Math.round(grupo.avaliacoes.reduce((sum, av) => sum + av.pontuacaoTotal, 0) / grupo.avaliacoes.length)
                            } pts
                          </div>
                          <div>
                            <span className="font-medium">Melhor Avaliação:</span> {
                              Math.max(...grupo.avaliacoes.map(av => av.pontuacaoTotal))
                            } pts
                          </div>
                          <div>
                            <span className="font-medium">Pior Avaliação:</span> {
                              Math.min(...grupo.avaliacoes.map(av => av.pontuacaoTotal))
                            } pts
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvaliacaoList;
