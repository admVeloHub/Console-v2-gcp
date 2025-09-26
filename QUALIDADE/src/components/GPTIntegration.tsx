import React, { useState, useEffect } from 'react';
import { Bot, Play, Loader, AlertCircle, ExternalLink, Settings, Volume2, Download, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Avaliacao, AvaliacaoGPT } from '../types';
import { salvarAvaliacaoGPT, getAvaliacaoGPT } from '../utils/storage';
import { analyzeCallWithGPT, getGPTStatus } from '../services/gptService';
import GPTConfig from './GPTConfig';
import GPTAnalysisDetail from './GPTAnalysisDetail';

// Componente para verificar e mostrar arquivos de gravação
const ArquivoGravacaoCheck: React.FC<{ avaliacao: Avaliacao }> = ({ avaliacao }) => {
  const [temArquivo, setTemArquivo] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkArquivo = async () => {
      setIsLoading(true);
      try {
        const verificarArquivoAudio = async (avaliacao: Avaliacao) => {
          console.log('🔍 === VERIFICANDO ARQUIVO DE ÁUDIO (Componente) ===');
          console.log('🔍 ID da avaliação:', avaliacao.id);
          console.log('🔍 arquivoLigacao:', avaliacao.arquivoLigacao);
          console.log('🔍 arquivoDrive:', avaliacao.arquivoDrive);
          console.log('🔍 nomeArquivo:', avaliacao.nomeArquivo);
          
          // Verificar Base64
          if (avaliacao.arquivoLigacao && 
              typeof avaliacao.arquivoLigacao === 'string' && 
              avaliacao.arquivoLigacao.length > 0 &&
              avaliacao.arquivoLigacao.startsWith('data:audio/')) {
            console.log('✅ Arquivo Base64 encontrado');
            return {
              tipo: 'local',
              dados: avaliacao.arquivoLigacao,
              nome: avaliacao.nomeArquivo || 'Arquivo de áudio'
            };
          }
          
          // Verificar Google Drive
          if (avaliacao.arquivoDrive && 
              typeof avaliacao.arquivoDrive === 'object' && 
              avaliacao.arquivoDrive.id) {
            console.log('✅ Arquivo Google Drive encontrado');
            return {
              tipo: 'drive',
              dados: avaliacao.arquivoDrive,
              nome: avaliacao.arquivoDrive.name
            };
          }
          
          // Verificar File object
          if (avaliacao.arquivoLigacao && 
              typeof avaliacao.arquivoLigacao === 'object' && 
              'name' in avaliacao.arquivoLigacao) {
            console.log('✅ File object encontrado');
            return {
              tipo: 'file',
              dados: avaliacao.arquivoLigacao,
              nome: avaliacao.arquivoLigacao.name
            };
          }
          
          console.log('❌ Nenhum arquivo válido encontrado');
          return null;
        };

        const arquivo = await verificarArquivoAudio(avaliacao);
        setTemArquivo(arquivo);
      } catch (error) {
        console.error('❌ Erro ao verificar arquivo:', error);
        setTemArquivo(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkArquivo();
  }, [avaliacao]);

  if (isLoading) {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Verificando arquivo de áudio...</span>
        </div>
      </div>
    );
  }

  if (!temArquivo) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Volume2 className="h-6 w-6 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-800">Gravação da Ligação</h4>
            <p className="text-sm text-blue-700">
              {temArquivo.nome || 'Arquivo de áudio'}
            </p>
            <p className="text-xs text-blue-600">
              Tipo: {temArquivo.tipo === 'local' ? 'Local (Base64)' : 
                    temArquivo.tipo === 'drive' ? 'Google Drive' : 
                    temArquivo.tipo === 'file' ? 'File Object' : 'Desconhecido'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              try {
                // Placeholder para função de play que precisa ser implementada
                console.log('Play audio clicado');
              } catch (error) {
                console.error('Erro ao reproduzir:', error);
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Reproduzir gravação"
          >
            <Play className="h-4 w-4" />
            <span>Reproduzir</span>
          </button>
          <button
            onClick={async () => {
              try {
                // Placeholder para função de download que precisa ser implementada
                console.log('Download audio clicado');
              } catch (error) {
                console.error('Erro ao baixar:', error);
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title="Baixar gravação"
          >
            <Download className="h-4 w-4" />
            <span>Baixar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para o botão de análise GPT
const BotaoAnaliseGPT: React.FC<{ 
  avaliacao: Avaliacao; 
  isAnalyzing: boolean; 
  onStartAnalysis: () => void; 
}> = ({ avaliacao, isAnalyzing, onStartAnalysis }) => {
  const [temArquivo, setTemArquivo] = React.useState<any>(null);
  const [isCheckingFile, setIsCheckingFile] = React.useState(true);

  React.useEffect(() => {
    const checkArquivo = async () => {
      setIsCheckingFile(true);
      try {
        const verificarArquivoAudio = async (avaliacao: Avaliacao) => {
          console.log('🔍 === VERIFICANDO ARQUIVO PARA ANÁLISE GPT ===');
          console.log('🔍 ID da avaliação:', avaliacao.id);
          console.log('🔍 arquivoLigacao:', avaliacao.arquivoLigacao);
          console.log('🔍 arquivoDrive:', avaliacao.arquivoDrive);
          
          // Verificar Base64
          if (avaliacao.arquivoLigacao && 
              typeof avaliacao.arquivoLigacao === 'string' && 
              avaliacao.arquivoLigacao.length > 0 &&
              avaliacao.arquivoLigacao.startsWith('data:audio/')) {
            console.log('✅ Arquivo Base64 válido para análise');
            return true;
          }
          
          // Verificar Google Drive
          if (avaliacao.arquivoDrive && 
              typeof avaliacao.arquivoDrive === 'object' && 
              avaliacao.arquivoDrive.id) {
            console.log('✅ Arquivo Google Drive válido para análise');
            return true;
          }
          
          // Verificar File object
          if (avaliacao.arquivoLigacao && 
              typeof avaliacao.arquivoLigacao === 'object' && 
              'name' in avaliacao.arquivoLigacao) {
            console.log('✅ File object válido para análise');
            return true;
          }
          
          console.log('❌ Nenhum arquivo válido para análise');
          return false;
        };

        const arquivo = await verificarArquivoAudio(avaliacao);
        setTemArquivo(arquivo);
      } catch (error) {
        console.error('❌ Erro ao verificar arquivo para análise:', error);
        setTemArquivo(false);
      } finally {
        setIsCheckingFile(false);
      }
    };

    checkArquivo();
  }, [avaliacao]);

  if (isCheckingFile) {
    return (
      <div className="space-y-3">
        <div className="w-full bg-gray-200 text-gray-600 py-3 px-6 rounded-lg flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
          <span>Verificando arquivo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={onStartAnalysis}
        disabled={isAnalyzing || !temArquivo}
        className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isAnalyzing ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Analisando...</span>
          </>
        ) : (
          <>
            <Play className="h-5 w-5" />
            <span>Iniciar Análise com GPT</span>
          </>
        )}
      </button>
      
      {!temArquivo && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              <strong>Arquivo de áudio não encontrado.</strong><br />
              Faça upload de um arquivo de áudio para iniciar a análise GPT.
            </p>
          </div>
        </div>
      )}
      
      {temArquivo && (
        <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 text-center">
            ✅ Arquivo de áudio detectado - Pronto para análise
          </p>
        </div>
      )}
    </div>
  );
};

// Componente para indicar status da análise GPT
const IndicadorAnaliseGPT: React.FC<{ 
  avaliacao: Avaliacao; 
  analysisResult: any; 
}> = ({ avaliacao, analysisResult }) => {
  const [temArquivo, setTemArquivo] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkArquivo = async () => {
      setIsLoading(true);
      try {
        const verificarArquivoAudio = async (avaliacao: Avaliacao) => {
          // Verificar Base64
          if (avaliacao.arquivoLigacao && 
              typeof avaliacao.arquivoLigacao === 'string' && 
              avaliacao.arquivoLigacao.length > 0 &&
              avaliacao.arquivoLigacao.startsWith('data:audio/')) {
            return true;
          }
          
          // Verificar Google Drive
          if (avaliacao.arquivoDrive && 
              typeof avaliacao.arquivoDrive === 'object' && 
              avaliacao.arquivoDrive.id) {
            return true;
          }
          
          // Verificar File object
          if (avaliacao.arquivoLigacao && 
              typeof avaliacao.arquivoLigacao === 'object' && 
              'name' in avaliacao.arquivoLigacao) {
            return true;
          }
          
          return false;
        };

        const arquivo = await verificarArquivoAudio(avaliacao);
        setTemArquivo(arquivo);
      } catch (error) {
        console.error('❌ Erro ao verificar arquivo para indicador:', error);
        setTemArquivo(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkArquivo();
  }, [avaliacao]);

  if (isLoading) {
    return null; // Não mostrar nada durante carregamento
  }

  // Não mostrar se já há análise
  if (analysisResult) {
    return null;
  }

  // Mostrar apenas se tem arquivo
  if (!temArquivo) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <div className="flex items-center space-x-3">
        <Bot className="h-5 w-5 text-yellow-600" />
        <div>
          <h4 className="font-medium text-yellow-800">Nenhuma Análise GPT Disponível</h4>
          <p className="text-sm text-yellow-700">
            Clique em "Iniciar Análise com GPT" para gerar uma análise automática desta ligação.
          </p>
        </div>
      </div>
    </div>
  );
};

interface GPTIntegrationProps {
  avaliacao: Avaliacao;
  onAnalysisComplete: (avaliacaoGPT: AvaliacaoGPT) => void;
}

const GPTIntegration: React.FC<GPTIntegrationProps> = ({
  avaliacao,
  onAnalysisComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AvaliacaoGPT | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['analise', 'moderacao', 'detalhes', 'recomendacoes']));
  const [showConfig, setShowConfig] = useState(false);
  const [gptStatus, setGptStatus] = useState<any>(null);
  const [showAnalysisDetail, setShowAnalysisDetail] = useState(false);

  // Carregar status do GPT e análise existente ao montar o componente
  useEffect(() => {
    const status = getGPTStatus();
    setGptStatus(status);
    
    // Verificar se já existe uma análise GPT para esta avaliação
    const existingAnalysis = getAvaliacaoGPT(avaliacao.id);
    
    if (existingAnalysis) {
      setAnalysisResult(existingAnalysis);
      setShowAnalysisDetail(true);
    }
  }, [avaliacao.id]);

  // Análise com GPT real ou fallback
  const analyzeWithGPT = async (): Promise<any> => {
    try {
      const result = await analyzeCallWithGPT({
        id: avaliacao.id,
        colaboradorNome: avaliacao.colaboradorNome,
        arquivoLigacao: avaliacao.arquivoLigacao,
        nomeArquivo: avaliacao.nomeArquivo
      });
      
      return result;
    } catch (error) {
      console.error('Erro na análise GPT:', error);
      throw error;
    }
  };

  const handleStartAnalysis = async () => {
    console.log('🔍 === INICIANDO ANÁLISE GPT ===');
    console.log('🔍 Avaliação completa:', avaliacao);
    console.log('🔍 ID da avaliação:', avaliacao.id);
    console.log('🔍 arquivoLigacao:', avaliacao.arquivoLigacao);
    console.log('🔍 arquivoDrive:', avaliacao.arquivoDrive);
    console.log('🔍 nomeArquivo:', avaliacao.nomeArquivo);
    console.log('🔍 Tipo do arquivoLigacao:', typeof avaliacao.arquivoLigacao);
    
    // Verificar se há arquivo disponível
    const arquivoInfo = await verificarArquivoAudio(avaliacao);
    console.log('🔍 Resultado da verificação:', arquivoInfo);
    
    if (!arquivoInfo) {
      console.log('❌ Nenhum arquivo de áudio disponível para análise');
      setError('Nenhum arquivo de áudio disponível para análise');
      return;
    }
    
    console.log('✅ Arquivo detectado, prosseguindo com análise...');

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeWithGPT();
      
      const avaliacaoGPT: Omit<AvaliacaoGPT, 'id' | 'avaliacaoId' | 'createdAt'> = {
        analiseGPT: result.analiseDetalhada,
        pontuacaoGPT: result.pontuacao,
        criteriosGPT: result.criterios,
        confianca: result.confianca,
        palavrasCriticas: result.palavrasCriticas || [],
        calculoDetalhado: result.calculoDetalhado || []
      };

      const savedGPT = salvarAvaliacaoGPT(avaliacao.id, avaliacaoGPT);
      setAnalysisResult(savedGPT);
      setShowAnalysisDetail(true);
      onAnalysisComplete(savedGPT);
      
    } catch (err) {
      setError('Erro ao analisar com GPT. Tente novamente.');
      console.error('Erro na análise GPT:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleModeration = () => {
    if (analysisResult) {
      // Aqui você pode implementar a lógica de moderação
      // Por exemplo, salvar as observações de moderação
      setModerationNotes('');
    }
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



  // Função para verificar se há arquivo de áudio disponível
  const verificarArquivoAudio = async (avaliacao: Avaliacao) => {
    console.log('🔍 === VERIFICANDO ARQUIVO DE ÁUDIO ===');
    console.log('🔍 ID da avaliação:', avaliacao.id);
    console.log('🔍 Avaliação completa:', avaliacao);
    console.log('🔍 arquivoLigacao:', avaliacao.arquivoLigacao);
    console.log('🔍 arquivoDrive:', avaliacao.arquivoDrive);
    console.log('🔍 nomeArquivo:', avaliacao.nomeArquivo);
    console.log('🔍 Tipo do arquivoLigacao:', typeof avaliacao.arquivoLigacao);
    console.log('🔍 Tipo do arquivoDrive:', typeof avaliacao.arquivoDrive);
    console.log('🔍 Length do arquivoLigacao:', avaliacao.arquivoLigacao ? avaliacao.arquivoLigacao.length : 'N/A');

    // 1. Verificar se tem arquivo no localStorage (Base64 atual)
    if (avaliacao.arquivoLigacao && 
        typeof avaliacao.arquivoLigacao === 'string' && 
        avaliacao.arquivoLigacao.length > 0) {
      console.log('✅ Arquivo encontrado no localStorage');
      
      // Verificar se é Base64 válido
      if (avaliacao.arquivoLigacao.startsWith('data:audio/')) {
        console.log('✅ Arquivo Base64 válido detectado');
        return {
          tipo: 'local',
          dados: avaliacao.arquivoLigacao,
          nome: avaliacao.nomeArquivo || 'Arquivo de áudio'
        };
      } else {
        console.log('⚠️ Arquivo encontrado mas não é Base64 válido');
      }
    }

    // 2. Verificar se tem arquivo no Google Drive
    if (avaliacao.arquivoDrive && 
        typeof avaliacao.arquivoDrive === 'object' && 
        avaliacao.arquivoDrive.id) {
      console.log('✅ Arquivo encontrado no Google Drive:', avaliacao.arquivoDrive.name);
      return {
        tipo: 'drive',
        dados: avaliacao.arquivoDrive,
        nome: avaliacao.arquivoDrive.name
      };
    }

    // 3. Verificar se é um File object (durante upload)
    if (avaliacao.arquivoLigacao && 
        typeof avaliacao.arquivoLigacao === 'object' && 
        'name' in avaliacao.arquivoLigacao && 
        'size' in avaliacao.arquivoLigacao) {
      console.log('✅ File object detectado:', avaliacao.arquivoLigacao.name);
      return {
        tipo: 'file',
        dados: avaliacao.arquivoLigacao,
        nome: avaliacao.arquivoLigacao.name
      };
    }

    // 4. Verificar formatos antigos (blob URLs)
    if (avaliacao.arquivoLigacao && 
        typeof avaliacao.arquivoLigacao === 'string' && 
        (avaliacao.arquivoLigacao.startsWith('blob:') || 
         avaliacao.arquivoLigacao.startsWith('http'))) {
      console.log('⚠️ Arquivo antigo (blob/http) detectado');
      return {
        tipo: 'url',
        dados: avaliacao.arquivoLigacao,
        nome: avaliacao.nomeArquivo || 'Arquivo de áudio'
      };
    }

    // 5. Debug adicional para investigar o problema
    console.log('❌ === NENHUM ARQUIVO VÁLIDO ENCONTRADO ===');
    console.log('🔍 Propriedades da avaliação:', Object.keys(avaliacao));
    console.log('🔍 Valores das propriedades de arquivo:');
    console.log('  - arquivoLigacao:', avaliacao.arquivoLigacao);
    console.log('  - arquivoDrive:', avaliacao.arquivoDrive);
    console.log('  - nomeArquivo:', avaliacao.nomeArquivo);
    
    // Tentar buscar a avaliação completa no localStorage
    try {
      console.log('🔍 Tentando buscar avaliação completa no localStorage...');
      const { getAvaliacaoById } = await import('../utils/storage');
      const avaliacaoCompleta = getAvaliacaoById(avaliacao.id);
      
      if (avaliacaoCompleta) {
        console.log('🔍 Avaliação completa encontrada:', avaliacaoCompleta);
        
        if (avaliacaoCompleta.arquivoLigacao) {
          console.log('✅ Arquivo encontrado na avaliação completa (localStorage)');
          return {
            tipo: 'local',
            dados: avaliacaoCompleta.arquivoLigacao,
            nome: avaliacaoCompleta.nomeArquivo || 'Arquivo de áudio'
          };
        }
        
        if (avaliacaoCompleta.arquivoDrive) {
          console.log('✅ Arquivo encontrado na avaliação completa (Google Drive)');
          return {
            tipo: 'drive',
            dados: avaliacaoCompleta.arquivoDrive,
            nome: avaliacaoCompleta.arquivoDrive.name
          };
        }
      } else {
        console.log('❌ Avaliação completa não encontrada no localStorage');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar avaliação completa:', error);
    }

    console.log('❌ CONCLUSÃO: Nenhum arquivo de áudio válido encontrado');
    return null;
  };

  // Função para reproduzir áudio
  const playAudio = async () => {
    const arquivoInfo = await verificarArquivoAudio(avaliacao);
    if (!arquivoInfo) {
      alert('Nenhum arquivo de áudio disponível para reprodução.');
      return;
    }

    try {
      console.log('🎵 Tentando reproduzir áudio...');
      
      // Verificar se é Base64
      if (typeof avaliacao.arquivoLigacao === 'string' && avaliacao.arquivoLigacao.startsWith('data:audio/')) {
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
        
      } else if (typeof avaliacao.arquivoLigacao === 'string' && (avaliacao.arquivoLigacao.startsWith('blob:') || avaliacao.arquivoLigacao.startsWith('http'))) {
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
        
      } else if (avaliacao.arquivoLigacao && typeof avaliacao.arquivoLigacao === 'object' && 'name' in avaliacao.arquivoLigacao) {
        // Se for um File object (durante criação)
        console.log('📁 File object detectado, criando URL temporária...');
        
        const blobUrl = URL.createObjectURL(avaliacao.arquivoLigacao as File);
        const audio = new Audio();
        audio.volume = 0.8;
        
        audio.addEventListener('canplay', () => {
          console.log('✅ Áudio pronto para reprodução');
          audio.play().catch(err => {
            console.error('❌ Erro ao iniciar reprodução:', err);
            alert('Erro ao reproduzir o áudio. Verifique as permissões do navegador.');
          });
        });
        
        audio.addEventListener('ended', () => {
          URL.revokeObjectURL(blobUrl);
          console.log('🧹 Blob URL limpa após reprodução');
        });
        
        audio.src = blobUrl;
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
    const arquivoInfo = await verificarArquivoAudio(avaliacao);
    if (!arquivoInfo) {
      alert('Nenhum arquivo de áudio disponível para download.');
      return;
    }

    try {
      console.log('📥 Tentando baixar áudio:', avaliacao.arquivoLigacao);
      
      // Se for um File object (durante criação)
      if (avaliacao.arquivoLigacao && typeof avaliacao.arquivoLigacao === 'object' && 'name' in avaliacao.arquivoLigacao) {
        console.log('📁 File object detectado, criando download direto...');
        
        const blobUrl = URL.createObjectURL(avaliacao.arquivoLigacao as File);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = (avaliacao.arquivoLigacao as File).name || `gravacao_ligacao_${avaliacao.id}.wav`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpar blob URL
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        console.log('✅ Download concluído para File object');
        return;
      }
      
      // Se for Base64
      if (typeof avaliacao.arquivoLigacao === 'string' && avaliacao.arquivoLigacao.startsWith('data:audio/')) {
        console.log('📥 Arquivo Base64 detectado, convertendo para download...');
        
        try {
          const { convertBase64ToBlob } = await import('../utils/storage');
          const blob = convertBase64ToBlob(avaliacao.arquivoLigacao);
          
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = avaliacao.nomeArquivo || `gravacao_ligacao_${avaliacao.id}.wav`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Limpar blob URL
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
          console.log('✅ Download concluído para Base64');
          return;
          
        } catch (error) {
          console.error('❌ Erro ao converter Base64 para download:', error);
          alert('Erro ao processar o arquivo para download.');
          return;
        }
      }
      
      // Se for URL (fallback para compatibilidade)
      if (typeof avaliacao.arquivoLigacao === 'string' && (avaliacao.arquivoLigacao.startsWith('blob:') || avaliacao.arquivoLigacao.startsWith('http'))) {
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
      
      const response = await fetch(avaliacao.arquivoLigacao as string);
      
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
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Agente GPT</h3>
          <p className="text-sm text-gray-600">
            Análise automática de qualidade das ligações
          </p>
        </div>
        <button
          onClick={() => setShowConfig(true)}
          className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
          title="Configurar API GPT"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Acesso Rápido à Gravação */}
      <ArquivoGravacaoCheck avaliacao={avaliacao} />

      {/* Status da API GPT */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-5 w-5 text-purple-600" />
            <div>
              <h4 className="font-medium text-purple-800">Status da API GPT</h4>
              <p className="text-sm text-purple-600">
                {gptStatus?.configured ? 'API OpenAI configurada e funcionando' : 'API não configurada - usando modo fallback'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              gptStatus?.configured ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {gptStatus?.configured ? '✅ Ativo' : '⚠️ Fallback'}
            </span>
            <button
              onClick={() => setShowConfig(true)}
              className="text-xs text-purple-600 hover:text-purple-800 underline"
            >
              {gptStatus?.configured ? 'Reconfigurar' : 'Configurar'}
            </button>
          </div>
        </div>
      </div>

      {/* Link para Central de Artigos */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <ExternalLink className="h-5 w-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-800">Central de Artigos da Velotax</h4>
            <p className="text-sm text-blue-700">
              Base de conhecimento com procedimentos e diretrizes para análise
            </p>
            <a
              href="https://sites.google.com/velotax.com.br/ca-modcod2?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Acessar Central de Artigos →
            </a>
          </div>
        </div>
      </div>

      {/* Botão de Análise */}
      <div className="mb-6">
        <BotaoAnaliseGPT 
          avaliacao={avaliacao} 
          isAnalyzing={isAnalyzing} 
          onStartAnalysis={handleStartAnalysis} 
        />
      </div>

      {/* Erro */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Resultado da Análise - SEMPRE VISÍVEL */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Header da Análise com Controle de Expansão */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-purple-800">Análise Completa do Agente GPT</h3>
                  <p className="text-sm text-purple-700">
                    {showAnalysisDetail ? 'Todas as informações detalhadas estão visíveis' : 'Clique para expandir e ver todas as análises'}
                  </p>
                  {/* Indicador de análise existente */}
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      ✅ Análise GPT Disponível
                    </span>
                    <span className="text-xs text-purple-600">
                      Pontuação: {analysisResult.pontuacaoGPT} pts | Confiança: {analysisResult.confianca}%
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAnalysisDetail(!showAnalysisDetail)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title={showAnalysisDetail ? "Recolher análises detalhadas" : "Expandir análises detalhadas"}
              >
                {showAnalysisDetail ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>Recolher</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>Expandir</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Conteúdo da Análise - Expandível */}
          {showAnalysisDetail && (
            <div>
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 text-center">
                  🎯 <strong>Análise GPT Expandida:</strong> Todas as informações detalhadas estão visíveis abaixo
                </p>
              </div>
              
              {/* Verificação de segurança */}
              {analysisResult && (
                <GPTAnalysisDetail 
                  avaliacaoGPT={analysisResult}
                  avaliacao={avaliacao}
                />
              )}
              
              {/* Fallback se houver erro */}
              {!analysisResult && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-700 text-center">
                    ❌ Erro: Dados da análise GPT não estão disponíveis
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Seção Colapsável - Moderação */}
          <div className="border border-gray-200 rounded-lg">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('moderacao')}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-gray-800">Moderação da Avaliação GPT</h4>
              </div>
              <span className="text-sm text-gray-500">
                {expandedSections.has('moderacao') ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedSections.has('moderacao') && (
              <div className="p-4 border-t border-gray-200 bg-purple-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações de Moderação
                    </label>
                    <textarea
                      value={moderationNotes}
                      onChange={(e) => setModerationNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Adicione suas observações sobre a análise do GPT..."
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleModeration}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Salvar Moderação
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indicador quando não há análise GPT */}
      <IndicadorAnaliseGPT 
        avaliacao={avaliacao} 
        analysisResult={analysisResult} 
      />

      {/* Informações sobre o Agente GPT */}
      <div className="mt-8 space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Critérios de Avaliação</h5>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Saudação Adequada:</span>
              <span className="font-medium">+10 pts</span>
            </div>
            <div className="flex justify-between">
              <span>Escuta Ativa:</span>
              <span className="font-medium">+25 pts</span>
            </div>
            <div className="flex justify-between">
              <span>Resolução da Questão:</span>
              <span className="font-medium">+40 pts</span>
            </div>
            <div className="flex justify-between">
              <span>Empatia e Cordialidade:</span>
              <span className="font-medium">+15 pts</span>
            </div>
            <div className="flex justify-between">
              <span>Direcionamento de Pesquisa:</span>
              <span className="font-medium">+10 pts</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Procedimento Incorreto:</span>
              <span className="font-medium">-60 pts</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Encerramento Brusco:</span>
              <span className="font-medium">-100 pts</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="text-sm font-semibold text-blue-800 mb-2">Processo de Moderação</h5>
          <p className="text-sm text-blue-700">
            A moderação humana é essencial para validar as análises do GPT e fornecer feedback 
            para melhorar continuamente a precisão do sistema. Cada análise deve ser revisada 
            por um moderador qualificado.
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h5 className="text-sm font-semibold text-green-800 mb-2">Novos Recursos de Análise</h5>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• <strong>Resumo da Solicitação</strong>: Identificação automática da necessidade do cliente</li>
            <li>• <strong>Resumo do Atendimento</strong>: Métricas detalhadas da interação</li>
            <li>• <strong>Pontos Críticos</strong>: Destaque automático de falhas graves</li>
            <li>• <strong>Recomendações de Ação</strong>: Sugestões específicas para melhoria</li>
            <li>• <strong>Validação por Critério</strong>: Moderação detalhada de cada aspecto</li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h5 className="text-sm font-semibold text-green-800 mb-2">Integração com API OpenAI</h5>
          <div className="text-sm text-green-700 space-y-2">
            <div className="font-medium">Status Atual:</div>
            <p>• <strong>API GPT:</strong> {gptStatus?.configured ? '✅ Configurada e funcionando' : '⚠️ Não configurada - usando modo fallback'}</p>
            <p>• <strong>Modelo:</strong> {gptStatus?.model || 'gpt-4o-mini'}</p>
            <p>• <strong>Fallback:</strong> {gptStatus?.fallbackEnabled ? '✅ Ativado' : '❌ Desativado'}</p>
            
            {!gptStatus?.configured && (
              <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-xs text-yellow-700">
                  <strong>Para ativar análises automáticas:</strong> Clique em "Configurar" e insira sua chave da API OpenAI.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h5 className="text-sm font-semibold text-purple-800 mb-2">Fluxo de Automação Gradual</h5>
          <div className="text-sm text-purple-700 space-y-2">
            <div className="font-medium">Fase 1: Revisão 100%</div>
            <p>• Todas as chamadas são revisadas por moderadores humanos</p>
            <div className="font-medium">Fase 2: Triagem Inteligente</div>
            <p>• Revisão apenas de casos críticos (nota menor que 80%, palavras-chave críticas)</p>
            <div className="font-medium">Fase 3: Monitoramento Contínuo</div>
            <p>• GPT monitora autonomamente, humano apenas audita amostras</p>
            <div className="text-xs text-purple-600 mt-2">
              <strong>Objetivo:</strong> Reduzir 60-80% da carga manual de moderação
            </div>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h5 className="text-sm font-semibold text-yellow-800 mb-2">Critérios de Triagem Automática</h5>
          <div className="text-sm text-yellow-700 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-medium">Revisão Obrigatória:</div>
                <ul className="text-xs space-y-1 mt-1">
                  <li>• Nota abaixo de 80%</li>
                  <li>• Palavras-chave críticas (jurídicas, financeiras)</li>
                  <li>• Casos marcados como "incertos" pelo GPT</li>
                  <li>• Pontuação negativa</li>
                </ul>
              </div>
              <div>
                <div className="font-medium">Revisão Opcional:</div>
                <ul className="text-xs space-y-1 mt-1">
                  <li>• Nota entre 80-90%</li>
                  <li>• Casos de alta confiança do GPT</li>
                  <li>• Padrões consistentes de atendimento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Configuração */}
      {showConfig && (
        <GPTConfig onClose={() => setShowConfig(false)} />
      )}
    </div>
  );
};

export default GPTIntegration;
