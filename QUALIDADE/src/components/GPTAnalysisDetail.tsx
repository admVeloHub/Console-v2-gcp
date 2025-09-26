import React, { useState } from 'react';
import { 
  Bot, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  MessageSquare, 
  Award,
  Volume2,
  Play,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { AvaliacaoGPT, Avaliacao } from '../types';

interface GPTAnalysisDetailProps {
  avaliacaoGPT: AvaliacaoGPT;
  avaliacao: Avaliacao;
}

const GPTAnalysisDetail: React.FC<GPTAnalysisDetailProps> = ({
  avaliacaoGPT,
  avaliacao
}) => {
  // Por padrão, todas as seções ficam EXPANDIDAS para fácil acesso
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['resumo', 'analise', 'recomendacoes', 'detalhes']));
  const [showAllExpanded, setShowAllExpanded] = useState(true);

  const getConfidenceClass = (confianca: number) => {
    if (confianca >= 90) return 'text-green-600 bg-green-100';
    if (confianca >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confianca: number) => {
    if (confianca >= 90) return 'Alta';
    if (confianca >= 80) return 'Média';
    return 'Baixa';
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Função para expandir/colapsar todas as seções
  const toggleAllSections = () => {
    if (showAllExpanded) {
      setExpandedSections(new Set());
      setShowAllExpanded(false);
    } else {
      setExpandedSections(new Set(['resumo', 'analise', 'recomendacoes', 'detalhes']));
      setShowAllExpanded(true);
    }
  };

  // Função para verificar se o arquivo está disponível
  const checkFileAvailability = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.log('❌ Arquivo não acessível via HEAD:', error);
      return false;
    }
  };

  // Função para reproduzir áudio
  const playAudio = async () => {
    if (!avaliacao.arquivoLigacao) {
      alert('Nenhum arquivo de áudio disponível para reprodução.');
      return;
    }

    try {
      console.log('🎵 Tentando reproduzir áudio...');
      
      // Verificar se é Base64
      if (avaliacao.arquivoLigacao.startsWith('data:audio/')) {
        console.log('✅ Arquivo Base64 detectado, convertendo para Blob...');
        
        try {
          // Converter Base64 para Blob
          const { convertBase64ToBlob } = await import('../utils/storage');
          const blob = convertBase64ToBlob(avaliacao.arquivoLigacao);
          
          // Criar URL temporária para o blob
          const blobUrl = URL.createObjectURL(blob);
          console.log('✅ Blob URL criada:', blobUrl);
          
          // Reproduzir áudio
          const audio = new Audio();
          audio.volume = 0.8;
          
          audio.addEventListener('loadstart', () => {
            console.log('🎵 Iniciando carregamento do áudio...');
          });
          
          audio.addEventListener('loadedmetadata', () => {
            console.log('📋 Metadados carregados - Duração:', audio.duration);
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
        
      } else if (avaliacao.arquivoLigacao.startsWith('blob:') || avaliacao.arquivoLigacao.startsWith('http')) {
        // Fallback para URLs antigas (compatibilidade)
        console.log('⚠️ URL antiga detectada, tentando reprodução direta...');
        
        const audio = new Audio();
        audio.volume = 0.8;
        
        audio.addEventListener('error', (e) => {
          console.error('❌ Erro ao carregar áudio:', e);
          alert('Erro ao reproduzir o áudio. O arquivo pode estar corrompido ou inacessível.');
        });
        
        audio.src = avaliacao.arquivoLigacao;
        audio.load();
        
      } else {
        alert('Formato de arquivo não suportado para reprodução.');
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar áudio:', error);
      alert('Erro ao processar o arquivo de áudio. Verifique se o arquivo está disponível.');
    }
  };

  // Função para baixar áudio
  const downloadAudio = async () => {
    if (!avaliacao.arquivoLigacao) {
      alert('Nenhum arquivo de áudio disponível para download.');
      return;
    }

    try {
      console.log('📥 Tentando baixar áudio:', avaliacao.arquivoLigacao);
      
      // Verificar se o arquivo está disponível
      const isAvailable = await checkFileAvailability(avaliacao.arquivoLigacao);
      
      if (!isAvailable) {
        console.log('⚠️ Arquivo não acessível via HEAD, tentando download direto...');
      }

      // Tentar download direto primeiro
      if (avaliacao.arquivoLigacao.startsWith('blob:') || avaliacao.arquivoLigacao.startsWith('http')) {
        try {
          // Criar link de download
          const link = document.createElement('a');
          link.href = avaliacao.arquivoLigacao;
          
          // Definir nome do arquivo
          const fileName = avaliacao.nomeArquivo || `gravacao_ligacao_${avaliacao.id}.wav`;
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
      
      const response = await fetch(avaliacao.arquivoLigacao);
      
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
      const fileName = avaliacao.nomeArquivo || `gravacao_ligacao_${avaliacao.id}.wav`;
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
      {/* Header com Controle Global */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-purple-800">Análise Completa do Agente GPT</h3>
              <p className="text-sm text-purple-700">
                Todas as informações detalhadas estão sempre visíveis para consulta
              </p>
            </div>
          </div>
          <button
            onClick={toggleAllSections}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            title={showAllExpanded ? "Colapsar todas as seções" : "Expandir todas as seções"}
          >
            {showAllExpanded ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span>Ocultar Tudo</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Mostrar Tudo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Acesso Rápido à Gravação */}
      {avaliacao.arquivoLigacao && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="h-6 w-6 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800">Gravação da Ligação</h4>
                <p className="text-sm text-blue-700">
                  {avaliacao.nomeArquivo || 'Arquivo de áudio'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={playAudio}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Reproduzir gravação"
              >
                <Play className="h-4 w-4" />
                <span>Reproduzir</span>
              </button>
              <button
                onClick={downloadAudio}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Baixar gravação"
              >
                <Download className="h-4 w-4" />
                <span>Baixar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seção SEMPRE VISÍVEL - Resumo Executivo */}
      <div className="border border-gray-200 rounded-lg">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors bg-gradient-to-r from-yellow-50 to-orange-50"
          onClick={() => toggleSection('resumo')}
        >
          <div className="flex items-center space-x-3">
            <Award className="h-5 w-5 text-yellow-600" />
            <h4 className="font-medium text-gray-800">🏆 Resumo Executivo GPT</h4>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getConfidenceClass(avaliacaoGPT.confianca)}`}>
              {getConfidenceText(avaliacaoGPT.confianca)} Confiança
            </span>
            <span className="text-sm text-gray-500">
              {expandedSections.has('resumo') ? '▼' : '▶'}
            </span>
          </div>
        </div>
        
        {/* Conteúdo SEMPRE VISÍVEL */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-white rounded-lg border border-yellow-200 shadow-sm">
              <div className="text-3xl font-bold text-purple-600">
                {avaliacaoGPT.pontuacaoGPT}
              </div>
              <div className="text-sm text-gray-600">Pontos GPT</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
              <div className="text-3xl font-bold text-blue-600">
                {avaliacao.pontuacaoTotal}
              </div>
              <div className="text-sm text-gray-600">Pontos Avaliador</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200 shadow-sm">
              <div className={`text-3xl font-bold ${Math.abs(avaliacaoGPT.pontuacaoGPT - avaliacao.pontuacaoTotal) <= 10 ? 'text-green-600' : 'text-orange-600'}`}>
                {Math.abs(avaliacaoGPT.pontuacaoGPT - avaliacao.pontuacaoTotal)}
              </div>
              <div className="text-sm text-gray-600">Diferença</div>
            </div>
          </div>
          
          {/* Palavras Críticas - SEMPRE VISÍVEL */}
          {avaliacaoGPT.palavrasCriticas && avaliacaoGPT.palavrasCriticas.length > 0 && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">🚨 Palavras Críticas Detectadas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {avaliacaoGPT.palavrasCriticas.map((palavra, index) => (
                  <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">
                    {palavra}
                  </span>
                ))}
              </div>
              <p className="text-xs text-red-700 mt-2">
                ⚠️ Estas palavras indicam situações que requerem atenção imediata e podem necessitar de escalonamento.
              </p>
            </div>
          )}

          {/* Análise de Confiança - SEMPRE VISÍVEL */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Nível de Confiança da Análise</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    avaliacaoGPT.confianca >= 90 ? 'bg-green-500' : 
                    avaliacaoGPT.confianca >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${avaliacaoGPT.confianca}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">{avaliacaoGPT.confianca}%</span>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              {avaliacaoGPT.confianca >= 90 ? '✅ Análise de alta confiança - Pode ser usada para feedback direto' :
               avaliacaoGPT.confianca >= 80 ? '⚠️ Análise de confiança média - Recomenda-se revisão humana' :
               '❌ Análise de baixa confiança - Necessita revisão obrigatória'}
            </p>
          </div>
        </div>
      </div>

      {/* Seção SEMPRE VISÍVEL - Análise Detalhada */}
      <div className="border border-gray-200 rounded-lg">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors bg-gradient-to-r from-blue-50 to-indigo-50"
          onClick={() => toggleSection('analise')}
        >
          <div className="flex items-center space-x-3">
            <Bot className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-gray-800">🤖 Análise Detalhada por Critérios</h4>
          </div>
          <span className="text-sm text-gray-500">
            {expandedSections.has('analise') ? '▼' : '▶'}
          </span>
        </div>
        
        {/* Conteúdo SEMPRE VISÍVEL */}
        <div className="p-4 border-t border-gray-200 bg-blue-50">
          <div className="mb-4">
            <h5 className="font-medium text-gray-800 mb-3">Critérios Avaliados pelo GPT</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`flex items-center space-x-3 p-3 rounded-lg border shadow-sm ${
                avaliacaoGPT.criteriosGPT.saudacaoAdequada ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                {avaliacaoGPT.criteriosGPT.saudacaoAdequada ? 
                  <CheckCircle className="h-5 w-5 text-green-600" /> : 
                  <AlertCircle className="h-5 w-5 text-red-600" />
                }
                <div>
                  <span className="font-medium">Saudação Adequada</span>
                  <div className="text-sm text-gray-600">+10 pontos</div>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg border shadow-sm ${
                avaliacaoGPT.criteriosGPT.escutaAtiva ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                {avaliacaoGPT.criteriosGPT.escutaAtiva ? 
                  <CheckCircle className="h-5 w-5 text-green-600" /> : 
                  <AlertCircle className="h-5 w-5 text-red-600" />
                }
                <div>
                  <span className="font-medium">Escuta Ativa</span>
                  <div className="text-sm text-gray-600">+25 pontos</div>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg border shadow-sm ${
                avaliacaoGPT.criteriosGPT.resolucaoQuestao ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                {avaliacaoGPT.criteriosGPT.resolucaoQuestao ? 
                  <CheckCircle className="h-5 w-5 text-green-600" /> : 
                  <AlertCircle className="h-5 w-5 text-red-600" />
                }
                <div>
                  <span className="font-medium">Resolução da Questão</span>
                  <div className="text-sm text-gray-600">+40 pontos</div>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg border shadow-sm ${
                avaliacaoGPT.criteriosGPT.empatiaCordialidade ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                {avaliacaoGPT.criteriosGPT.empatiaCordialidade ? 
                  <CheckCircle className="h-5 w-5 text-green-600" /> : 
                  <AlertCircle className="h-5 w-5 text-red-600" />
                }
                <div>
                  <span className="font-medium">Empatia e Cordialidade</span>
                  <div className="text-sm text-gray-600">+15 pontos</div>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg border shadow-sm ${
                avaliacaoGPT.criteriosGPT.direcionouPesquisa ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                {avaliacaoGPT.criteriosGPT.direcionouPesquisa ? 
                  <CheckCircle className="h-5 w-5 text-green-600" /> : 
                  <AlertCircle className="h-5 w-5 text-red-600" />
                }
                <div>
                  <span className="font-medium">Direcionou para Pesquisa</span>
                  <div className="text-sm text-gray-600">+10 pontos</div>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg border shadow-sm ${
                !avaliacaoGPT.criteriosGPT.procedimentoIncorreto ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                {!avaliacaoGPT.criteriosGPT.procedimentoIncorreto ? 
                  <CheckCircle className="h-5 w-5 text-green-600" /> : 
                  <AlertCircle className="h-5 w-5 text-red-600" />
                }
                <div>
                  <span className="font-medium">Procedimento Correto</span>
                  <div className="text-sm text-gray-600">-60 pontos se incorreto</div>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg border shadow-sm ${
                !avaliacaoGPT.criteriosGPT.encerramentoBrusco ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                {!avaliacaoGPT.criteriosGPT.encerramentoBrusco ? 
                  <CheckCircle className="h-5 w-5 text-green-600" /> : 
                  <AlertCircle className="h-5 w-5 text-red-600" />
                }
                <div>
                  <span className="font-medium">Encerramento Adequado</span>
                  <div className="text-sm text-gray-600">-100 pontos se brusco</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="font-medium text-gray-800 mb-2">📝 Análise Completa do GPT</h5>
            <div className="bg-white p-4 rounded border text-sm whitespace-pre-line max-h-96 overflow-y-auto shadow-sm">
              {avaliacaoGPT.analiseGPT}
            </div>
          </div>
        </div>
      </div>

      {/* Seção SEMPRE VISÍVEL - Recomendações e Melhorias */}
      <div className="border border-gray-200 rounded-lg">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors bg-gradient-to-r from-green-50 to-emerald-50"
          onClick={() => toggleSection('recomendacoes')}
        >
          <div className="flex items-center space-x-3">
            <Lightbulb className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-gray-800">💡 Recomendações e Melhorias</h4>
          </div>
          <span className="text-sm text-gray-500">
            {expandedSections.has('recomendacoes') ? '▼' : '▶'}
          </span>
        </div>
        
        {/* Conteúdo SEMPRE VISÍVEL */}
        <div className="p-4 border-t border-gray-200 bg-green-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
              <h6 className="font-medium text-green-800 mb-3 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Pontos Fortes Identificados</span>
              </h6>
              <div className="space-y-2 text-sm text-green-700">
                {avaliacaoGPT.criteriosGPT.saudacaoAdequada && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Saudação adequada e profissional</span>
                  </div>
                )}
                {avaliacaoGPT.criteriosGPT.escutaAtiva && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Escuta ativa demonstrada</span>
                  </div>
                )}
                {avaliacaoGPT.criteriosGPT.resolucaoQuestao && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Questão resolvida adequadamente</span>
                  </div>
                )}
                {avaliacaoGPT.criteriosGPT.empatiaCordialidade && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Empatia e cordialidade mantidas</span>
                  </div>
                )}
                {avaliacaoGPT.criteriosGPT.direcionouPesquisa && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Direcionamento adequado para pesquisa</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
              <h6 className="font-medium text-orange-800 mb-3 flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Áreas de Melhoria</span>
              </h6>
              <div className="space-y-2 text-sm text-orange-700">
                {!avaliacaoGPT.criteriosGPT.saudacaoAdequada && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span>Melhorar apresentação inicial</span>
                  </div>
                )}
                {!avaliacaoGPT.criteriosGPT.escutaAtiva && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span>Desenvolver escuta ativa</span>
                  </div>
                )}
                {!avaliacaoGPT.criteriosGPT.resolucaoQuestao && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span>Focar na resolução efetiva</span>
                  </div>
                )}
                {!avaliacaoGPT.criteriosGPT.empatiaCordialidade && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span>Desenvolver empatia</span>
                  </div>
                )}
                {!avaliacaoGPT.criteriosGPT.direcionouPesquisa && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span>Melhorar direcionamento</span>
                  </div>
                )}
                {avaliacaoGPT.criteriosGPT.procedimentoIncorreto && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span>Revisar procedimentos</span>
                  </div>
                )}
                {avaliacaoGPT.criteriosGPT.encerramentoBrusco && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span>Melhorar encerramento</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recomendações de Treinamento - SEMPRE VISÍVEL */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h6 className="font-medium text-blue-800 mb-3 flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Recomendações de Treinamento</span>
            </h6>
            <div className="text-sm text-blue-700 space-y-2">
              {avaliacaoGPT.pontuacaoGPT < 70 && (
                <p>• <strong>Treinamento Intensivo:</strong> Necessário para melhorar pontuação geral</p>
              )}
              {avaliacaoGPT.pontuacaoGPT >= 70 && avaliacaoGPT.pontuacaoGPT < 85 && (
                <p>• <strong>Treinamento Focado:</strong> Melhorar pontos específicos identificados</p>
              )}
              {avaliacaoGPT.pontuacaoGPT >= 85 && (
                <p>• <strong>Reforço Positivo:</strong> Manter padrão de excelência</p>
              )}
              {avaliacaoGPT.palavrasCriticas && avaliacaoGPT.palavrasCriticas.length > 0 && (
                <p>• <strong>Treinamento Específico:</strong> Procedimentos para situações críticas</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seção SEMPRE VISÍVEL - Informações Adicionais */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h5 className="font-medium text-gray-800 mb-3">📊 Informações da Análise</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Confiança da Análise:</span>
            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getConfidenceClass(avaliacaoGPT.confianca)}`}>
              {getConfidenceText(avaliacaoGPT.confianca)} ({avaliacaoGPT.confianca}%)
            </span>
          </div>
          <div>
            <span className="font-medium">Diferença de Pontuação:</span>
            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
              Math.abs(avaliacaoGPT.pontuacaoGPT - avaliacao.pontuacaoTotal) <= 10 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {Math.abs(avaliacaoGPT.pontuacaoGPT - avaliacao.pontuacaoTotal)} pontos
            </span>
          </div>
          <div>
            <span className="font-medium">Palavras Críticas:</span>
            <span className="ml-2">
              {avaliacaoGPT.palavrasCriticas && avaliacaoGPT.palavrasCriticas.length > 0 
                ? `${avaliacaoGPT.palavrasCriticas.length} detectadas` 
                : 'Nenhuma detectada'}
            </span>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
              avaliacaoGPT.confianca >= 90 ? 'bg-green-100 text-green-800' : 
              avaliacaoGPT.confianca >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              {avaliacaoGPT.confianca >= 90 ? 'Pronto para uso' : 
               avaliacaoGPT.confianca >= 80 ? 'Revisão recomendada' : 'Revisão obrigatória'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer com Lembrete */}
      <div className="bg-green-50 rounded-lg border border-green-200 p-4 text-center">
        <p className="text-sm text-green-700">
          ✅ <strong>Análise Completa Sempre Disponível:</strong> Todas as informações do GPT estão sempre visíveis para consulta rápida e eficiente.
        </p>
      </div>
    </div>
  );
};

export default GPTAnalysisDetail;
