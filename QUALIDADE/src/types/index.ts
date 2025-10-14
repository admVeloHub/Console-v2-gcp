// VERSION: v1.0.1 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
// CORREÇÃO: Removido colaboradorId, usando apenas colaboradorNome conforme schema MongoDB aprovado

export interface Funcionario {
  id: string;
  nomeCompleto: string;
  dataAniversario: string;
  empresa: string;
  dataContratado: string;
  telefone?: string;
  atuacao?: string;
  escala?: string;
  acessos: Acesso[];
  desligado: boolean;
  dataDesligamento?: string;
  afastado: boolean;
  dataAfastamento?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Acesso {
  id: string;
  sistema: string;
  perfil?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuncionarioFormData {
  nomeCompleto: string;
  dataAniversario: string;
  empresa: string;
  dataContratado: string;
  telefone?: string;
  atuacao?: string;
  escala?: string;
  desligado: boolean;
  dataDesligamento?: string;
  afastado: boolean;
  dataAfastamento?: string;
}

export interface AcessoFormData {
  sistema: string;
  perfil?: string;
  observacoes?: string;
}

// Módulo de Qualidade
export interface Avaliacao {
  id: string;
  colaboradorNome: string;
  avaliador: string;
  mes: string;
  ano: number;
  dataAvaliacao: string;
  arquivoLigacao?: string; // Base64 para arquivos pequenos
  arquivoDrive?: DriveFile; // Dados do Google Drive para arquivos grandes
  nomeArquivo?: string;
  saudacaoAdequada: boolean;
  escutaAtiva: boolean;
  resolucaoQuestao: boolean;
  empatiaCordialidade: boolean;
  direcionouPesquisa: boolean;
  procedimentoIncorreto: boolean;
  encerramentoBrusco: boolean;
  moderado: boolean;
  observacoesModeracao: string;
  pontuacaoTotal: number;
  avaliacaoGPT?: AvaliacaoGPT;
  createdAt: string;
  updatedAt: string;
}

export interface AvaliacaoGPT {
  id: string;
  avaliacaoId: string;
  analiseGPT: string;
  pontuacaoGPT: number;
  criteriosGPT: {
    saudacaoAdequada: boolean;
    escutaAtiva: boolean;
    resolucaoQuestao: boolean;
    empatiaCordialidade: boolean;
    direcionouPesquisa: boolean;
    procedimentoIncorreto: boolean;
    encerramentoBrusco: boolean;
  };
  confianca: number; // 0-100
  palavrasCriticas?: string[]; // Palavras-chave críticas mencionadas pelo cliente
  calculoDetalhado?: string[]; // Cálculo detalhado da pontuação por critério
  createdAt: string;
}

export interface AvaliacaoFormData {
  colaboradorNome: string;
  avaliador: string;
  mes: string;
  ano: number;
  saudacaoAdequada: boolean;
  escutaAtiva: boolean;
  resolucaoQuestao: boolean;
  empatiaCordialidade: boolean;
  direcionouPesquisa: boolean;
  procedimentoIncorreto: boolean;
  encerramentoBrusco: boolean;
  arquivoLigacao?: File;
  observacoesModeracao?: string;
}

export interface RelatorioAgente {
  colaboradorNome: string;
  avaliacoes: Avaliacao[];
  mediaAvaliador: number;
  mediaGPT: number;
  totalAvaliacoes: number;
  melhorNota: number;
  piorNota: number;
  tendencia: 'melhorando' | 'piorando' | 'estavel';
}

export interface RelatorioGestao {
  mes: string;
  ano: number;
  totalAvaliacoes: number;
  mediaGeral: number;
  top3Melhores: Array<{
    colaboradorNome: string;
    nota: number;
    posicao: number;
  }>;
  top3Piores: Array<{
    colaboradorNome: string;
    nota: number;
    posicao: number;
  }>;
  colaboradores: Array<{
    colaboradorNome: string;
    nota: number;
    posicao: number;
  }>;
}

export interface MesesAno {
  mes: string;
  ano: number;
}

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const ANOS = [2025, 2026, 2027, 2028];

// Constantes de pontuação
export const PONTUACAO = {
  SAUDACAO_ADEQUADA: 10,
  ESCUTA_ATIVA: 25,
  RESOLUCAO_QUESTAO: 40,
  EMPATIA_CORDIALIDADE: 15,
  DIRECIONOU_PESQUISA: 10,
  PROCEDIMENTO_INCORRETO: -60,
  ENCERRAMENTO_BRUSCO: -100
};

// Interface para arquivos do Google Drive
export interface DriveFile {
  id: string;
  name: string;
  webViewLink: string;
  size: number;
  mimeType: string;
}
