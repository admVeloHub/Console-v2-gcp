// VERSION: v1.11.0 | DATE: 2026-06-05 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.11.0 - exportAnaliseIAToXLSX: abas Análise do Diálogo e Critérios GPT (schema LISTA); remove Emoção/Nuance
// CHANGELOG: v1.10.0 - Export: data/hora ligação via horaLigacao absoluta (formatDataHoraLigacao)
// CHANGELOG: v1.9.1 - Release push GitHub 2026-04-10
// CHANGELOG: v1.9.0 - Excel Nota IA: coluna a partir de qualidade_avaliacoes.avaliacaoIA (sem GET audio_analise)
// CHANGELOG: v1.8.2 - Excel Nota IA: concorrência 2 + pausa entre lotes (mitiga 429 no /audio-analise/result)
// CHANGELOG: v1.8.1 - PDF: cabeçalho de coluna "Atendimento" (antes "Atendimento em")
// CHANGELOG: v1.8.0 - Excel: somenteAnaliseAudioIA + Nota IA (batch getAvaliacaoGPTByAvaliacaoId); PDF alinhado a colunas Atendimento / só IA / status
// CHANGELOG: v1.7.0 - Export: coluna Áudio Processado com pending|done|failed e legado boolean
// CHANGELOG: v1.6.0 - Atualização de métricas: substituído dominioAssunto por registroAtendimento, adicionado conformidadeTicket e naoConsultouBot

import * as XLSX from 'xlsx';
import { getAvaliacoes } from './qualidadeAPI';
import { getFuncionarios } from './qualidadeAPI';
import { formatDataHoraLigacao } from '../utils/qualidadeDataLigacao';
import {
  normalizeAudioAnaliseResult,
  CRITERIOS_IA_ORDEM,
  CRITERIO_IA_LABELS
} from '../utils/qualidadeAudioAnaliseNormalize';

const boolExport = (v) => {
  if (v === true) return 'Sim';
  if (v === false) return 'Não';
  return 'N/A';
};

const formatAudioPipelineTreated = (t) => {
  if (t === true || t === 'done') return 'Concluído';
  if (t === 'failed') return 'Falha';
  if (t === 'pending' || t === false) return 'Pendente';
  if (t == null || t === '') return '';
  return String(t);
};

// Exportar avaliações para Excel (XLSX)
export const exportAvaliacoesToExcel = async () => {
  try {
    const avaliacoes = await getAvaliacoes();
    
    if (avaliacoes.length === 0) {
      alert('Não há avaliações para exportar');
      return;
    }

    // Criar workbook
    const workbook = XLSX.utils.book_new();

    // Criar dados da planilha com todos os campos do schema
    const headers = [
      'ID', 'Colaborador', 'Avaliador', 'Mês', 'Ano', 'Data Ligação',
      'Saudação Adequada', 'Escuta Ativa', 'Clareza/Objetividade', 'Resolução Questão',
      'Registro do Atendimento', 'Empatia/Cordialidade', 'Direcionou Pesquisa',
      'Não Consultou Bot', 'Inconformidade no Ticket', 'Procedimento Incorreto', 'Encerramento Brusco', 'Pontuação Total',
      'Somente análise IA', 'Nota IA',
      'Observações', 'Nome Arquivo Áudio', 'Áudio Enviado', 'Áudio Processado',
      'Data Criação Áudio', 'Data Atualização Áudio', 'Data Criação', 'Data Atualização'
    ];

    const dados = [
      headers,
      ...avaliacoes.map(avaliacao => [
        avaliacao._id,
        avaliacao.colaboradorNome || '',
        avaliacao.avaliador || '',
        avaliacao.mes || '',
        avaliacao.ano || '',
        avaliacao.dataLigacao
          ? formatDataHoraLigacao(avaliacao.dataLigacao, avaliacao.horaLigacao, avaliacao)
          : '',
        avaliacao.saudacaoAdequada ? 'Sim' : 'Não',
        avaliacao.escutaAtiva ? 'Sim' : 'Não',
        avaliacao.clarezaObjetividade !== undefined ? (avaliacao.clarezaObjetividade ? 'Sim' : 'Não') : '',
        avaliacao.resolucaoQuestao ? 'Sim' : 'Não',
        avaliacao.registroAtendimento ? 'Sim' : 'Não',
        avaliacao.empatiaCordialidade ? 'Sim' : 'Não',
        avaliacao.direcionouPesquisa ? 'Sim' : 'Não',
        avaliacao.naoConsultouBot !== undefined ? (avaliacao.naoConsultouBot ? 'Sim' : 'Não') : '',
        avaliacao.conformidadeTicket !== undefined ? (avaliacao.conformidadeTicket ? 'Sim' : 'Não') : '',
        avaliacao.procedimentoIncorreto ? 'Sim' : 'Não',
        avaliacao.encerramentoBrusco ? 'Sim' : 'Não',
        avaliacao.pontuacaoTotal || 0,
        avaliacao.somenteAnaliseAudioIA === true ? 'Sim' : 'Não',
        avaliacao.avaliacaoIA != null && !Number.isNaN(Number(avaliacao.avaliacaoIA))
          ? Number(avaliacao.avaliacaoIA)
          : '',
        avaliacao.observacoes || avaliacao.observacoesModeracao || '',
        avaliacao.nomeArquivoAudio || '',
        avaliacao.audioSent ? 'Sim' : 'Não',
        formatAudioPipelineTreated(avaliacao.audioTreated),
        avaliacao.audioCreatedAt ? new Date(avaliacao.audioCreatedAt).toLocaleDateString('pt-BR') + ' ' + new Date(avaliacao.audioCreatedAt).toLocaleTimeString('pt-BR') : '',
        avaliacao.audioUpdatedAt ? new Date(avaliacao.audioUpdatedAt).toLocaleDateString('pt-BR') + ' ' + new Date(avaliacao.audioUpdatedAt).toLocaleTimeString('pt-BR') : '',
        avaliacao.createdAt ? new Date(avaliacao.createdAt).toLocaleDateString('pt-BR') + ' ' + new Date(avaliacao.createdAt).toLocaleTimeString('pt-BR') : '',
        avaliacao.updatedAt ? new Date(avaliacao.updatedAt).toLocaleDateString('pt-BR') + ' ' + new Date(avaliacao.updatedAt).toLocaleTimeString('pt-BR') : ''
      ])
    ];

    // Criar worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(dados);
    
    // Ajustar largura das colunas
    const colWidths = [
      { wch: 25 }, // ID
      { wch: 20 }, // Colaborador
      { wch: 20 }, // Avaliador
      { wch: 10 }, // Mês
      { wch: 8 },  // Ano
      { wch: 15 }, // Data Ligação
      { wch: 18 }, // Saudação Adequada
      { wch: 12 }, // Escuta Ativa
      { wch: 20 }, // Clareza/Objetividade
      { wch: 18 }, // Resolução Questão
      { wch: 25 }, // Registro do Atendimento
      { wch: 20 }, // Empatia/Cordialidade
      { wch: 18 }, // Direcionou Pesquisa
      { wch: 18 }, // Não Consultou Bot
      { wch: 22 }, // Inconformidade no Ticket
      { wch: 20 }, // Procedimento Incorreto
      { wch: 18 }, // Encerramento Brusco
      { wch: 15 }, // Pontuação Total
      { wch: 18 }, // Somente análise IA
      { wch: 12 }, // Nota IA
      { wch: 30 }, // Observações
      { wch: 30 }, // Nome Arquivo Áudio
      { wch: 15 }, // Áudio Enviado
      { wch: 18 }, // Áudio Processado
      { wch: 20 }, // Data Criação Áudio
      { wch: 20 }, // Data Atualização Áudio
      { wch: 20 }, // Data Criação
      { wch: 20 }  // Data Atualização
    ];
    worksheet['!cols'] = colWidths;

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Avaliações');

    // Gerar nome do arquivo com data
    const dataAtual = new Date().toISOString().split('T')[0];
    const nomeArquivo = `avaliacoes_qualidade_${dataAtual}.xlsx`;

    // Download
    XLSX.writeFile(workbook, nomeArquivo);

    console.log('✅ Exportação para Excel (XLSX) concluída:', avaliacoes.length, 'avaliações');
  } catch (error) {
    console.error('❌ Erro ao exportar para Excel:', error);
    alert('Erro ao exportar dados para Excel');
  }
};

// Exportar análises IA para Excel (XLSX)
export const exportAnaliseIAToXLSX = async (analisesGPT, colaboradorNome, mes, ano) => {
  try {
    if (!analisesGPT || analisesGPT.length === 0) {
      alert('Não há análises IA para exportar');
      return;
    }

    // Criar workbook
    const workbook = XLSX.utils.book_new();

    // === ABA 1: DADOS PRINCIPAIS ===
    const headersPrincipais = [
      'ID', 'Colaborador', 'Data Ligação', 'Data Análise',
      'Pontuação Calculada', 'Observação GPT', 'Palavras Críticas',
      'Saudação Adequada', 'Escuta Ativa', 'Clareza/Objetividade',
      'Resolução Questão', 'Registro do Atendimento', 'Empatia/Cordialidade',
      'Direcionou Pesquisa', 'Não Consultou Bot', 'Inconformidade no Ticket',
      'Procedimento Incorreto', 'Encerramento Brusco'
    ];

    const dadosPrincipais = [
      headersPrincipais,
      ...analisesGPT.map((analise) => {
        const norm = normalizeAudioAnaliseResult(analise);
        const criterios = norm.criteriosDetalhados || {};
        const palavras = (norm.palavrasCriticas || []).join('; ');

        return [
          norm._id || norm.avaliacaoId || '',
          colaboradorNome || norm.colaboradorNome || '',
          norm.dataLigacao
            ? formatDataHoraLigacao(norm.dataLigacao, norm.horaLigacao, analise.avaliacaoMonitorId || analise)
            : '',
          norm.createdAt ? new Date(norm.createdAt).toLocaleDateString('pt-BR') : '',
          norm.pontuacaoCalculada != null ? norm.pontuacaoCalculada : 'N/A',
          norm.observacaoGPT || 'N/A',
          palavras || 'N/A',
          boolExport(criterios.saudacaoAdequada),
          boolExport(criterios.escutaAtiva),
          boolExport(criterios.clarezaObjetividade),
          boolExport(criterios.resolucaoQuestao),
          boolExport(criterios.registroAtendimento),
          boolExport(criterios.empatiaCordialidade),
          boolExport(criterios.direcionouPesquisa),
          boolExport(criterios.naoConsultouBot),
          boolExport(criterios.conformidadeTicket),
          boolExport(criterios.procedimentoIncorreto),
          boolExport(criterios.encerramentoBrusco)
        ];
      })
    ];

    const worksheetPrincipais = XLSX.utils.aoa_to_sheet(dadosPrincipais);
    const colWidthsPrincipais = [
      { wch: 25 }, { wch: 20 }, { wch: 18 }, { wch: 14 },
      { wch: 16 }, { wch: 50 }, { wch: 30 },
      { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 22 },
      { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 20 }, { wch: 18 }
    ];
    worksheetPrincipais['!cols'] = colWidthsPrincipais;
    XLSX.utils.book_append_sheet(workbook, worksheetPrincipais, 'Dados Principais');

    // === ABA 2: ANÁLISE DO DIÁLOGO (Gemini) ===
    const headersDialogo = [
      'ID', 'Colaborador',
      'Temperatura Nota', 'Temperatura Classificação', 'Temperatura Avaliação',
      'Tensão Nota', 'Tensão Classificação', 'Tensão Avaliação',
      'Comportamento Vocal Nota', 'Comportamento Vocal Classificação', 'Comportamento Vocal Avaliação',
      'Considerações Classificação', 'Considerações Avaliação'
    ];

    const dadosDialogo = [
      headersDialogo,
      ...analisesGPT.map((analise) => {
        const norm = normalizeAudioAnaliseResult(analise);
        const d = norm.analiseDialogo || {};
        const t = d.temperatura || {};
        const tn = d.tensao || {};
        const cv = d.comportamentoVocal || {};
        const cons = d.consideracoes || {};
        return [
          norm._id || norm.avaliacaoId || '',
          colaboradorNome || norm.colaboradorNome || '',
          t.nota != null ? t.nota : 'N/A',
          t.classificacao || 'N/A',
          t.avaliacao || 'N/A',
          tn.nota != null ? tn.nota : 'N/A',
          tn.classificacao || 'N/A',
          tn.avaliacao || 'N/A',
          cv.nota != null ? cv.nota : 'N/A',
          cv.classificacao || 'N/A',
          cv.avaliacao || 'N/A',
          cons.classificacao || 'N/A',
          cons.avaliacao || 'N/A'
        ];
      })
    ];

    const worksheetDialogo = XLSX.utils.aoa_to_sheet(dadosDialogo);
    worksheetDialogo['!cols'] = [
      { wch: 25 }, { wch: 20 },
      { wch: 14 }, { wch: 22 }, { wch: 40 },
      { wch: 14 }, { wch: 22 }, { wch: 40 },
      { wch: 18 }, { wch: 28 }, { wch: 40 },
      { wch: 28 }, { wch: 50 }
    ];
    XLSX.utils.book_append_sheet(workbook, worksheetDialogo, 'Análise do Diálogo');

    // === ABA 3: CRITÉRIOS GPT ===
    const headersCriterios = ['ID', 'Colaborador', ...CRITERIOS_IA_ORDEM.map((k) => CRITERIO_IA_LABELS[k] || k)];

    const dadosCriterios = [
      headersCriterios,
      ...analisesGPT.map((analise) => {
        const norm = normalizeAudioAnaliseResult(analise);
        const c = norm.criteriosDetalhados || {};
        return [
          norm._id || norm.avaliacaoId || '',
          colaboradorNome || norm.colaboradorNome || '',
          ...CRITERIOS_IA_ORDEM.map((k) => boolExport(c[k]))
        ];
      })
    ];

    const worksheetCriterios = XLSX.utils.aoa_to_sheet(dadosCriterios);
    worksheetCriterios['!cols'] = [{ wch: 25 }, { wch: 20 }, ...CRITERIOS_IA_ORDEM.map(() => ({ wch: 22 }))];
    XLSX.utils.book_append_sheet(workbook, worksheetCriterios, 'Critérios GPT');

    // === ABA 4: RESUMO ESTATÍSTICO ===
    const totalAnalises = analisesGPT.length;
    const pontuacoes = analisesGPT
      .map((a) => normalizeAudioAnaliseResult(a).pontuacaoCalculada)
      .filter((p) => p != null && !Number.isNaN(Number(p)));

    const mediaPontuacao = pontuacoes.length > 0
      ? (pontuacoes.reduce((sum, p) => sum + p, 0) / pontuacoes.length).toFixed(2)
      : 0;

    const comPalavrasCriticas = analisesGPT.filter((a) => {
      const norm = normalizeAudioAnaliseResult(a);
      return Array.isArray(norm.palavrasCriticas) && norm.palavrasCriticas.length > 0;
    }).length;

    const dadosResumo = [
      ['Métrica', 'Valor'],
      ['Total de Análises', totalAnalises],
      ['Média de Pontuação Calculada', mediaPontuacao],
      ['Análises com Palavras Críticas', comPalavrasCriticas],
      ['Taxa Palavras Críticas', totalAnalises > 0 ? `${((comPalavrasCriticas / totalAnalises) * 100).toFixed(2)}%` : '0%'],
      ['Colaborador', colaboradorNome || 'N/A'],
      ['Período', mes && ano ? `${mes}/${ano}` : 'Todos'],
      ['Data de Exportação', new Date().toLocaleDateString('pt-BR')],
      ['Hora de Exportação', new Date().toLocaleTimeString('pt-BR')]
    ];

    const worksheetResumo = XLSX.utils.aoa_to_sheet(dadosResumo);
    const colWidthsResumo = [
      { wch: 25 }, { wch: 20 }
    ];
    worksheetResumo['!cols'] = colWidthsResumo;
    XLSX.utils.book_append_sheet(workbook, worksheetResumo, 'Resumo');

    // Gerar nome do arquivo
    const dataAtual = new Date().toISOString().split('T')[0];
    const nomeColaboradorArquivo = colaboradorNome ? colaboradorNome.replace(/\s+/g, '_') : 'Todos';
    const periodoArquivo = mes && ano ? `_${mes}_${ano}` : '';
    const nomeArquivo = `analise_ia_${nomeColaboradorArquivo}${periodoArquivo}_${dataAtual}.xlsx`;

    // Download
    XLSX.writeFile(workbook, nomeArquivo);

    console.log('✅ Exportação Análise IA (XLSX) concluída:', totalAnalises, 'análises');
  } catch (error) {
    console.error('❌ Erro ao exportar Análise IA:', error);
    alert('Erro ao exportar dados da Análise IA');
  }
};

// Exportar funcionários para Excel/CSV
export const exportFuncionariosToExcel = async () => {
  try {
    const funcionarios = await getFuncionarios();
    
    if (funcionarios.length === 0) {
      alert('Não há funcionários para exportar');
      return;
    }

    // Criar CSV
    const headers = [
      'ID', 'Nome Completo', 'Data Aniversário', 'Empresa', 'Data Contratado',
      'Telefone', 'Atuação', 'Escala', 'Desligado', 'Data Desligamento',
      'Afastado', 'Data Afastamento', 'Total Acessos', 'Acessos'
    ];

    const csvContent = [
      headers.join(','),
      ...funcionarios.map(funcionario => [
        funcionario._id || funcionario.id || 'N/A',
        `"${funcionario.nomeCompleto}"`,
        funcionario.dataAniversario,
        funcionario.empresa,
        funcionario.dataContratado,
        funcionario.telefone || '',
        funcionario.atuacao || '',
        funcionario.escala || '',
        funcionario.desligado ? 'Sim' : 'Não',
        funcionario.dataDesligamento || '',
        funcionario.afastado ? 'Sim' : 'Não',
        funcionario.dataAfastamento || '',
        (funcionario.acessos || []).length,
        `"${(funcionario.acessos || []).map(a => `${a.sistema}${a.perfil ? ` (${a.perfil})` : ''}`).join('; ')}"`
      ].join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `funcionarios_velotax_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ Exportação de funcionários concluída:', funcionarios.length, 'funcionários');
  } catch (error) {
    console.error('❌ Erro ao exportar funcionários:', error);
    alert('Erro ao exportar dados dos funcionários');
  }
};

// Exportar relatório de avaliações para PDF
export const exportAvaliacoesToPDF = async () => {
  try {
    const avaliacoes = await getAvaliacoes();
    
    if (avaliacoes.length === 0) {
      alert('Não há avaliações para exportar');
      return;
    }

    const avalManual = avaliacoes.filter((a) => a.somenteAnaliseAudioIA !== true);
    const totalAvaliacoes = avaliacoes.length;
    const mediaGeral =
      avalManual.length > 0
        ? avalManual.reduce((sum, a) => sum + (a.pontuacaoTotal || 0), 0) / avalManual.length
        : 0;
    const avaliacoesExcelentes = avalManual.filter((a) => a.pontuacaoTotal >= 80).length;
    const avaliacoesBoa = avalManual.filter((a) => a.pontuacaoTotal >= 60 && a.pontuacaoTotal < 80).length;
    const avaliacoesRegular = avalManual.filter((a) => a.pontuacaoTotal >= 40 && a.pontuacaoTotal < 60).length;
    const avaliacoesRuim = avalManual.filter((a) => a.pontuacaoTotal < 40).length;

    // Criar HTML para PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Avaliações - Qualidade</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #000058;
            padding-bottom: 20px;
          }
          h1 { 
            color: #000058; 
            margin: 0;
            font-size: 28px;
          }
          .subtitle {
            color: #666;
            margin: 10px 0;
            font-size: 16px;
          }
          .summary { 
            margin: 20px 0; 
            padding: 20px; 
            background-color: #f9f9f9; 
            border-radius: 8px;
            border-left: 4px solid #000058;
          }
          .summary h3 {
            color: #000058;
            margin-top: 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .stat-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #000058;
          }
          .stat-label {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            font-size: 12px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #000058; 
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .status-excelente { color: #15A237; font-weight: bold; }
          .status-bom { color: #3B82F6; font-weight: bold; }
          .status-regular { color: #F59E0B; font-weight: bold; }
          .status-ruim { color: #EF4444; font-weight: bold; }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Avaliações de Qualidade</h1>
          <div class="subtitle">Velotax - Sistema de Gestão de Qualidade</div>
          <div class="subtitle">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
        </div>
        
        <div class="summary">
          <h3>📊 Resumo Executivo</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${totalAvaliacoes}</div>
              <div class="stat-label">Total de Avaliações</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${mediaGeral.toFixed(2)}</div>
              <div class="stat-label">Média Geral (pontos)</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${avaliacoesExcelentes}</div>
              <div class="stat-label">Excelentes (≥80 pts)</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${avaliacoesBoa}</div>
              <div class="stat-label">Boa (60-79 pts)</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${avaliacoesRegular}</div>
              <div class="stat-label">Regular (40-59 pts)</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${avaliacoesRuim}</div>
              <div class="stat-label">Ruim (<40 pts)</div>
            </div>
          </div>
        </div>
        
        <h3>📋 Detalhamento das Avaliações</h3>
        <table>
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Avaliador</th>
              <th>Atendimento</th>
              <th>Pontuação</th>
              <th>Status</th>
              <th>Só IA</th>
            </tr>
          </thead>
          <tbody>
            ${avaliacoes.map(avaliacao => {
              const soIa = avaliacao.somenteAnaliseAudioIA === true;
              const status = soIa
                ? 'Pendente supervisor'
                : avaliacao.pontuacaoTotal >= 80 ? 'Excelente' : 
                           avaliacao.pontuacaoTotal >= 60 ? 'Bom' : 
                           avaliacao.pontuacaoTotal >= 40 ? 'Regular' : 'Ruim';
              const statusClass = soIa
                ? 'status-regular'
                : avaliacao.pontuacaoTotal >= 80 ? 'status-excelente' : 
                                avaliacao.pontuacaoTotal >= 60 ? 'status-bom' : 
                                avaliacao.pontuacaoTotal >= 40 ? 'status-regular' : 'status-ruim';
              const dataLig = avaliacao.dataLigacao
                ? formatDataHoraLigacao(avaliacao.dataLigacao, avaliacao.horaLigacao, avaliacao)
                : '—';
              
              return `
                <tr>
                  <td>${avaliacao.colaboradorNome}</td>
                  <td>${avaliacao.avaliador}</td>
                  <td>${dataLig}</td>
                  <td>${avaliacao.pontuacaoTotal}</td>
                  <td class="${statusClass}">${status}</td>
                  <td>${soIa ? 'Sim' : 'Não'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Relatório gerado automaticamente pelo Sistema de Gestão de Qualidade Velotax</p>
          <p>Para mais informações, acesse o sistema ou entre em contato com a equipe de qualidade</p>
        </div>
      </body>
      </html>
    `;
    
    // Abrir em nova janela para impressão/salvamento como PDF
    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    
    // Aguardar carregamento e imprimir
    newWindow.onload = () => {
      newWindow.print();
    };

    console.log('✅ Exportação para PDF concluída:', avaliacoes.length, 'avaliações');
  } catch (error) {
    console.error('❌ Erro ao exportar para PDF:', error);
    alert('Erro ao exportar dados para PDF');
  }
};

// Exportar relatório de funcionários para PDF
export const exportFuncionariosToPDF = async () => {
  try {
    const funcionarios = await getFuncionarios();
    
    if (funcionarios.length === 0) {
      alert('Não há funcionários para exportar');
      return;
    }

    // Calcular estatísticas
    const totalFuncionarios = funcionarios.length;
    const funcionariosAtivos = funcionarios.filter(f => !f.desligado && !f.afastado).length;
    const funcionariosDesligados = funcionarios.filter(f => f.desligado).length;
    const funcionariosAfastados = funcionarios.filter(f => f.afastado).length;
    const totalAcessos = funcionarios.reduce((sum, f) => sum + (f.acessos || []).length, 0);

    // Criar HTML para PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Funcionários - Velotax</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #000058;
            padding-bottom: 20px;
          }
          h1 { 
            color: #000058; 
            margin: 0;
            font-size: 28px;
          }
          .subtitle {
            color: #666;
            margin: 10px 0;
            font-size: 16px;
          }
          .summary { 
            margin: 20px 0; 
            padding: 20px; 
            background-color: #f9f9f9; 
            border-radius: 8px;
            border-left: 4px solid #000058;
          }
          .summary h3 {
            color: #000058;
            margin-top: 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .stat-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #000058;
          }
          .stat-label {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            font-size: 11px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
          }
          th { 
            background-color: #000058; 
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .status-ativo { color: #15A237; font-weight: bold; }
          .status-desligado { color: #EF4444; font-weight: bold; }
          .status-afastado { color: #F59E0B; font-weight: bold; }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Funcionários</h1>
          <div class="subtitle">Velotax - Sistema de Gestão de Pessoas</div>
          <div class="subtitle">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
        </div>
        
        <div class="summary">
          <h3>📊 Resumo Executivo</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${totalFuncionarios}</div>
              <div class="stat-label">Total de Funcionários</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${funcionariosAtivos}</div>
              <div class="stat-label">Ativos</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${funcionariosDesligados}</div>
              <div class="stat-label">Desligados</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${funcionariosAfastados}</div>
              <div class="stat-label">Afastados</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${totalAcessos}</div>
              <div class="stat-label">Total de Acessos</div>
            </div>
          </div>
        </div>
        
        <h3>👥 Detalhamento dos Funcionários</h3>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Empresa</th>
              <th>Data Contratação</th>
              <th>Status</th>
              <th>Acessos</th>
              <th>Telefone</th>
            </tr>
          </thead>
          <tbody>
            ${funcionarios.map(funcionario => {
              let status = 'Ativo';
              let statusClass = 'status-ativo';
              
              if (funcionario.desligado) {
                status = 'Desligado';
                statusClass = 'status-desligado';
              } else if (funcionario.afastado) {
                status = 'Afastado';
                statusClass = 'status-afastado';
              }
              
              return `
                <tr>
                  <td>${funcionario.nomeCompleto}</td>
                  <td>${funcionario.empresa}</td>
                  <td>${new Date(funcionario.dataContratado).toLocaleDateString('pt-BR')}</td>
                  <td class="${statusClass}">${status}</td>
                  <td>${(funcionario.acessos || []).length}</td>
                  <td>${funcionario.telefone || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Relatório gerado automaticamente pelo Sistema de Gestão de Pessoas Velotax</p>
          <p>Para mais informações, acesse o sistema ou entre em contato com o RH</p>
        </div>
      </body>
      </html>
    `;
    
    // Abrir em nova janela para impressão/salvamento como PDF
    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    
    // Aguardar carregamento e imprimir
    newWindow.onload = () => {
      newWindow.print();
    };

    console.log('✅ Exportação de funcionários para PDF concluída:', funcionarios.length, 'funcionários');
  } catch (error) {
    console.error('❌ Erro ao exportar funcionários para PDF:', error);
    alert('Erro ao exportar dados dos funcionários para PDF');
  }
};

// Importar dados de funcionários (placeholder)
export const importFuncionariosFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const funcionarios = lines.slice(1).map(line => {
          const values = line.split(',');
          const funcionario = {};
          
          headers.forEach((header, index) => {
            funcionario[header.trim()] = values[index]?.trim() || '';
          });
          
          return funcionario;
        }).filter(f => f.nomeCompleto); // Filtrar linhas vazias
        
        console.log('✅ Importação concluída:', funcionarios.length, 'funcionários');
        resolve(funcionarios);
      } catch (error) {
        console.error('❌ Erro ao processar arquivo:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsText(file);
  });
};

// Importar dados de avaliações (placeholder)
export const importAvaliacoesFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const avaliacoes = lines.slice(1).map(line => {
          const values = line.split(',');
          const avaliacao = {};
          
          headers.forEach((header, index) => {
            avaliacao[header.trim()] = values[index]?.trim() || '';
          });
          
          return avaliacao;
        }).filter(a => a.colaboradorNome); // Filtrar linhas vazias
        
        console.log('✅ Importação concluída:', avaliacoes.length, 'avaliações');
        resolve(avaliacoes);
      } catch (error) {
        console.error('❌ Erro ao processar arquivo:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsText(file);
  });
};
