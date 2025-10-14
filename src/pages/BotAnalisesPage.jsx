// VERSION: v2.4.2 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState, useCallback, useEffect } from 'react';
import { Typography, Box, Tabs, Tab, Container, Grid, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { QuestionAnswer, People, Schedule, TrendingUp, TrendingDown, DateRange, BarChart, Timeline, PieChart as PieChartIcon, ShowChart, Person, FileDownload, PictureAsPdf } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import BackButton from '../components/common/BackButton';
import botAnalisesService from '../services/botAnalisesService';

const BotAnalisesPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [periodoFiltro, setPeriodoFiltro] = useState('7dias');
  const [exibicaoFiltro, setExibicaoFiltro] = useState('dia');
  const [periodoFiltroGrafico, setPeriodoFiltroGrafico] = useState('7dias');
  const [exibicaoFiltroGrafico, setExibicaoFiltroGrafico] = useState('dia');
  const [metricas, setMetricas] = useState({
    totalPerguntas: 0,
    usuariosAtivos: 0,
    horarioPico: '00:00',
    crescimento: { percentual: 0, positivo: true },
    mediaDiaria: 0
  });
  const [loading, setLoading] = useState(true);
  const [dadosGrafico, setDadosGrafico] = useState({
    totalUso: {},
    feedbacksPositivos: {},
    feedbacksNegativos: {}
  });
  const [dadosPerguntasFrequentes, setDadosPerguntasFrequentes] = useState([]);
  const [dadosRankingAgentes, setDadosRankingAgentes] = useState([]);
  const [listaAtividades, setListaAtividades] = useState([]);
  const [analisesEspecificas, setAnalisesEspecificas] = useState({});
  const [filtroUsuario, setFiltroUsuario] = useState('todos');

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handlePeriodoChange = useCallback((event) => {
    setPeriodoFiltro(event.target.value);
  }, []);

  const handleExibicaoChange = useCallback((event) => {
    setExibicaoFiltro(event.target.value);
  }, []);

  const handlePeriodoGraficoChange = useCallback((event) => {
    setPeriodoFiltroGrafico(event.target.value);
  }, []);

  const handleExibicaoGraficoChange = useCallback((event) => {
    setExibicaoFiltroGrafico(event.target.value);
  }, []);

  const handleFiltroUsuarioChange = useCallback((event) => {
    setFiltroUsuario(event.target.value);
  }, []);

  // Funções de exportação
  const handleExportarXLS = useCallback(() => {
    console.log('🔄 Exportando dados para XLS...');
    
    try {
      // Criar workbook
      const workbook = XLSX.utils.book_new();
      
      // === ABA 1: MÉTRICAS GERAIS ===
      const metricasData = [
        ['Métrica', 'Valor'],
        ['Total de Perguntas', metricas.totalPerguntas],
        ['Usuários Ativos', metricas.usuariosAtivos],
        ['Horário Pico', metricas.horarioPico],
        ['Crescimento', typeof metricas.crescimento === 'object' ? `${metricas.crescimento.percentual}%` : metricas.crescimento],
        ['Média Diária', metricas.mediaDiaria]
      ];
      
      const metricasSheet = XLSX.utils.aoa_to_sheet(metricasData);
      XLSX.utils.book_append_sheet(workbook, metricasSheet, 'Métricas Gerais');
      
      // === ABA 2: DADOS DO GRÁFICO ===
      const graficoData = [['Período', 'Total Uso', 'Feedbacks Positivos', 'Feedbacks Negativos']];
      const periodos = Object.keys(dadosGrafico.totalUso);
      
      periodos.forEach(periodo => {
        graficoData.push([
          periodo,
          dadosGrafico.totalUso[periodo] || 0,
          dadosGrafico.feedbacksPositivos[periodo] || 0,
          dadosGrafico.feedbacksNegativos[periodo] || 0
        ]);
      });
      
      const graficoSheet = XLSX.utils.aoa_to_sheet(graficoData);
      XLSX.utils.book_append_sheet(workbook, graficoSheet, 'Dados do Gráfico');
      
      // === ABA 3: PERGUNTAS FREQUENTES ===
      const perguntasData = [['Pergunta', 'Frequência']];
      dadosPerguntasFrequentes.forEach(item => {
        perguntasData.push([item.name, item.value]);
      });
      
      const perguntasSheet = XLSX.utils.aoa_to_sheet(perguntasData);
      XLSX.utils.book_append_sheet(workbook, perguntasSheet, 'Perguntas Frequentes');
      
      // === ABA 4: RANKING AGENTES ===
      const rankingData = [['Agente', 'Perguntas', 'Sessões', 'Score']];
      dadosRankingAgentes.forEach(agente => {
        rankingData.push([agente.name, agente.perguntas, agente.sessoes, agente.score]);
      });
      
      const rankingSheet = XLSX.utils.aoa_to_sheet(rankingData);
      XLSX.utils.book_append_sheet(workbook, rankingSheet, 'Ranking Agentes');
      
      // === ABA 5: LISTA ATIVIDADES ===
      const atividadesData = [['Usuário', 'Pergunta', 'Data', 'Horário', 'Ação']];
      listaAtividades.forEach(atividade => {
        atividadesData.push([
          atividade.usuario,
          atividade.pergunta,
          atividade.data,
          atividade.horario,
          atividade.acao
        ]);
      });
      
      const atividadesSheet = XLSX.utils.aoa_to_sheet(atividadesData);
      XLSX.utils.book_append_sheet(workbook, atividadesSheet, 'Lista Atividades');
      
      // === ABA 6: INFORMAÇÕES DO PERÍODO ===
      const periodoTexto = periodoFiltro === '1dia' ? '1 dia' : 
                          periodoFiltro === '7dias' ? '7 dias' : 
                          periodoFiltro === '30dias' ? '30 dias' : 
                          periodoFiltro === '90dias' ? '90 dias' : 
                          periodoFiltro === '1ano' ? '1 ano' : periodoFiltro;
      
      const periodoData = [
        ['Informação', 'Valor'],
        ['Período Analisado', periodoTexto],
        ['Data de Exportação', new Date().toLocaleDateString('pt-BR')],
        ['Hora de Exportação', new Date().toLocaleTimeString('pt-BR')],
        ['Filtro de Exibição', exibicaoFiltro],
        ['Total de Registros', Object.keys(dadosGrafico.totalUso).length]
      ];
      
      const periodoSheet = XLSX.utils.aoa_to_sheet(periodoData);
      XLSX.utils.book_append_sheet(workbook, periodoSheet, 'Informações do Período');
      
      // Gerar nome do arquivo com data e período
      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const periodoArquivo = periodoFiltro === '1dia' ? '1_dia' : 
                            periodoFiltro === '7dias' ? '7_dias' : 
                            periodoFiltro === '30dias' ? '30_dias' : 
                            periodoFiltro === '90dias' ? '90_dias' : 
                            periodoFiltro === '1ano' ? '1_ano' : periodoFiltro;
      const nomeArquivo = `Bot_Analises_${periodoArquivo}_${dataAtual}.xlsx`;
      
      // Download
      XLSX.writeFile(workbook, nomeArquivo);
      
      console.log('✅ Exportação XLS concluída com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao exportar XLS:', error);
      alert('Erro ao exportar arquivo XLS. Tente novamente.');
    }
  }, [metricas, dadosGrafico, dadosPerguntasFrequentes, dadosRankingAgentes, listaAtividades]);

  const handleExportarPDF = useCallback(() => {
    console.log('🔄 Exportando consolidação da tela Atividade para PDF...');
    
    try {
      // Criar documento PDF
      const doc = new jsPDF();
      
      // === CABEÇALHO ===
      doc.setFontSize(20);
      doc.setTextColor(0, 102, 204); // Azul VeloHub
      doc.text('Consolidação Bot Análises - Tela Atividade', 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const dataRelatorio = new Date().toLocaleDateString('pt-BR');
      const horaRelatorio = new Date().toLocaleTimeString('pt-BR');
      doc.text(`Data: ${dataRelatorio} às ${horaRelatorio}`, 20, 30);
      doc.text(`Período: ${periodoFiltro} | Exibição: ${exibicaoFiltro}`, 20, 35);
      
      // === MÉTRICAS GERAIS - CARDS ===
      doc.setFontSize(16);
      doc.setTextColor(0, 102, 204);
      const tituloWidth = doc.getTextWidth('Métricas Gerais da Operação');
      doc.text('Métricas Gerais da Operação', (210 - tituloWidth) / 2, 50);
      
      // Layout de cards centralizados na página (corrigido)
      const cardWidth = 30;
      const cardHeight = 25;
      const cardSpacing = 32;
      const totalCardsWidth = (cardWidth * 5) + (cardSpacing * 4);
      const startX = Math.max(15, (210 - totalCardsWidth) / 2); // Garantir que não saia da página
      const startY = 55;
      
      // Card 1: Total Perguntas
      doc.setFillColor(240, 248, 255);
      doc.rect(startX, startY, cardWidth, cardHeight, 'F');
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(0.5);
      doc.rect(startX, startY, cardWidth, cardHeight, 'S');
      doc.setFontSize(9);
      doc.setTextColor(0, 102, 204);
      const text1 = 'Total de Perguntas';
      const text1Width = doc.getTextWidth(text1);
      doc.text(text1, startX + (cardWidth - text1Width) / 2, startY + 8);
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      const value1 = metricas.totalPerguntas.toString();
      const value1Width = doc.getTextWidth(value1);
      doc.text(value1, startX + (cardWidth - value1Width) / 2, startY + 18);
      
      // Card 2: Usuários Ativos
      doc.setFillColor(240, 248, 255);
      doc.rect(startX + cardSpacing, startY, cardWidth, cardHeight, 'F');
      doc.setDrawColor(0, 102, 204);
      doc.rect(startX + cardSpacing, startY, cardWidth, cardHeight, 'S');
      doc.setFontSize(9);
      doc.setTextColor(0, 102, 204);
      const text2 = 'Usuários Ativos';
      const text2Width = doc.getTextWidth(text2);
      doc.text(text2, startX + cardSpacing + (cardWidth - text2Width) / 2, startY + 8);
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      const value2 = metricas.usuariosAtivos.toString();
      const value2Width = doc.getTextWidth(value2);
      doc.text(value2, startX + cardSpacing + (cardWidth - value2Width) / 2, startY + 18);
      
      // Card 3: Horário Pico
      doc.setFillColor(240, 248, 255);
      doc.rect(startX + (cardSpacing * 2), startY, cardWidth, cardHeight, 'F');
      doc.setDrawColor(0, 102, 204);
      doc.rect(startX + (cardSpacing * 2), startY, cardWidth, cardHeight, 'S');
      doc.setFontSize(9);
      doc.setTextColor(0, 102, 204);
      const text3 = 'Horário Pico';
      const text3Width = doc.getTextWidth(text3);
      doc.text(text3, startX + (cardSpacing * 2) + (cardWidth - text3Width) / 2, startY + 8);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const value3 = metricas.horarioPico;
      const value3Width = doc.getTextWidth(value3);
      doc.text(value3, startX + (cardSpacing * 2) + (cardWidth - value3Width) / 2, startY + 18);
      
      // Card 4: Crescimento
      doc.setFillColor(240, 248, 255);
      doc.rect(startX + (cardSpacing * 3), startY, cardWidth, cardHeight, 'F');
      doc.setDrawColor(0, 102, 204);
      doc.rect(startX + (cardSpacing * 3), startY, cardWidth, cardHeight, 'S');
      doc.setFontSize(9);
      doc.setTextColor(0, 102, 204);
      const text4 = 'Crescimento';
      const text4Width = doc.getTextWidth(text4);
      doc.text(text4, startX + (cardSpacing * 3) + (cardWidth - text4Width) / 2, startY + 8);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const crescimentoTexto = typeof metricas.crescimento === 'object' ? 
        `${metricas.crescimento.percentual}%` : metricas.crescimento;
      const value4Width = doc.getTextWidth(crescimentoTexto);
      doc.text(crescimentoTexto, startX + (cardSpacing * 3) + (cardWidth - value4Width) / 2, startY + 18);
      
      // Card 5: Média Diária
      doc.setFillColor(240, 248, 255);
      doc.rect(startX + (cardSpacing * 4), startY, cardWidth, cardHeight, 'F');
      doc.setDrawColor(0, 102, 204);
      doc.rect(startX + (cardSpacing * 4), startY, cardWidth, cardHeight, 'S');
      doc.setFontSize(9);
      doc.setTextColor(0, 102, 204);
      const text5 = 'Média Diária';
      const text5Width = doc.getTextWidth(text5);
      doc.text(text5, startX + (cardSpacing * 4) + (cardWidth - text5Width) / 2, startY + 8);
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      const value5 = metricas.mediaDiaria.toString();
      const value5Width = doc.getTextWidth(value5);
      doc.text(value5, startX + (cardSpacing * 4) + (cardWidth - value5Width) / 2, startY + 18);
      
      // === GRÁFICO DE USO DA OPERAÇÃO ===
      doc.setFontSize(16);
      doc.setTextColor(0, 102, 204);
      const graficoTituloWidth = doc.getTextWidth('Gráfico de Uso da Operação');
      doc.text('Gráfico de Uso da Operação', (210 - graficoTituloWidth) / 2, startY + 35);
      
      // Usar dados reais do gráfico (30 dias por dia) - não das métricas gerais
      const periodos = Object.keys(dadosGrafico.totalUso);
      if (periodos.length > 0) {
        // Usar todos os dados disponíveis, não apenas 7
        const graficoData = periodos.map(periodo => ({
          periodo: periodo,
          totalUso: dadosGrafico.totalUso[periodo] || 0,
          feedbacksPositivos: dadosGrafico.feedbacksPositivos[periodo] || 0,
          feedbacksNegativos: dadosGrafico.feedbacksNegativos[periodo] || 0
        }));
        
        // Encontrar valor máximo para escala
        const maxValue = Math.max(...graficoData.map(item => Math.max(item.totalUso, item.feedbacksPositivos, item.feedbacksNegativos)));
        const pointSpacing = Math.min(25, 150 / graficoData.length); // Ajustar espaçamento baseado no número de pontos
        const chartStartX = 20;
        const chartStartY = startY + 45;
        const chartHeight = 50;
        const chartWidth = Math.min(160, pointSpacing * graficoData.length); // Ajustar largura
        
        // Desenhar eixo Y
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(chartStartX, chartStartY, chartStartX, chartStartY + chartHeight);
        
        // Desenhar eixo X
        doc.line(chartStartX, chartStartY + chartHeight, chartStartX + chartWidth, chartStartY + chartHeight);
        
        // Valores no eixo Y (pelo menos nos vértices)
        const yValues = [0, Math.round(maxValue * 0.25), Math.round(maxValue * 0.5), Math.round(maxValue * 0.75), maxValue];
        yValues.forEach((value, index) => {
          const y = chartStartY + chartHeight - (index * chartHeight / 4);
          doc.setFontSize(7);
          doc.setTextColor(0, 0, 0);
          doc.text(value.toString(), chartStartX - 8, y + 2);
          // Linha de grade horizontal
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.1);
          doc.line(chartStartX, y, chartStartX + chartWidth, y);
        });
        
        // Calcular pontos para as linhas
        const totalUsoPoints = [];
        const feedbacksPositivosPoints = [];
        const feedbacksNegativosPoints = [];
        
        graficoData.forEach((item, index) => {
          const x = chartStartX + (index * pointSpacing);
          const totalUsoY = chartStartY + chartHeight - ((item.totalUso / maxValue) * chartHeight);
          const posY = chartStartY + chartHeight - ((item.feedbacksPositivos / maxValue) * chartHeight);
          const negY = chartStartY + chartHeight - ((item.feedbacksNegativos / maxValue) * chartHeight);
          
          totalUsoPoints.push({ x, y: totalUsoY });
          feedbacksPositivosPoints.push({ x, y: posY });
          feedbacksNegativosPoints.push({ x, y: negY });
          
          // Labels dos períodos (apenas alguns para não sobrecarregar)
          if (index % Math.ceil(graficoData.length / 7) === 0) {
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            const labelText = item.periodo.split('-')[2]; // Apenas o dia
            doc.text(labelText, x - 2, chartStartY + chartHeight + 5);
          }
        });
        
        // Desenhar linha Total Uso (azul) - mais fina
        doc.setDrawColor(0, 102, 204);
        doc.setLineWidth(0.8);
        for (let i = 0; i < totalUsoPoints.length - 1; i++) {
          doc.line(totalUsoPoints[i].x, totalUsoPoints[i].y, totalUsoPoints[i + 1].x, totalUsoPoints[i + 1].y);
        }
        
        // Desenhar linha Feedbacks Positivos (verde) - mais fina
        doc.setDrawColor(0, 150, 0);
        doc.setLineWidth(0.6);
        for (let i = 0; i < feedbacksPositivosPoints.length - 1; i++) {
          doc.line(feedbacksPositivosPoints[i].x, feedbacksPositivosPoints[i].y, feedbacksPositivosPoints[i + 1].x, feedbacksPositivosPoints[i + 1].y);
        }
        
        // Desenhar linha Feedbacks Negativos (vermelho) - mais fina
        doc.setDrawColor(200, 0, 0);
        doc.setLineWidth(0.6);
        for (let i = 0; i < feedbacksNegativosPoints.length - 1; i++) {
          doc.line(feedbacksNegativosPoints[i].x, feedbacksNegativosPoints[i].y, feedbacksNegativosPoints[i + 1].x, feedbacksNegativosPoints[i + 1].y);
        }
        
        // Desenhar pontos nas linhas
        doc.setFillColor(0, 102, 204);
        totalUsoPoints.forEach(point => {
          doc.circle(point.x, point.y, 1, 'F');
        });
        
        doc.setFillColor(0, 150, 0);
        feedbacksPositivosPoints.forEach(point => {
          doc.circle(point.x, point.y, 0.8, 'F');
        });
        
        doc.setFillColor(200, 0, 0);
        feedbacksNegativosPoints.forEach(point => {
          doc.circle(point.x, point.y, 0.8, 'F');
        });
        
        // Legenda embaixo do gráfico (horizontal) - CORRIGIDA
        const legendStartY = chartStartY + chartHeight + 20; // Mais espaço
        const legendStartX = chartStartX + 20;
        
        // Item da legenda - Total Uso
        doc.setFillColor(0, 102, 204);
        doc.circle(legendStartX, legendStartY, 1.5, 'F');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text('Total Uso', legendStartX + 4, legendStartY + 1);
        
        // Item da legenda - Feedbacks Positivos
        doc.setFillColor(0, 150, 0);
        doc.circle(legendStartX + 35, legendStartY, 1.2, 'F');
        doc.text('Feedbacks +', legendStartX + 39, legendStartY + 1);
        
        // Item da legenda - Feedbacks Negativos
        doc.setFillColor(200, 0, 0);
        doc.circle(legendStartX + 70, legendStartY, 1.2, 'F');
        doc.text('Feedbacks -', legendStartX + 74, legendStartY + 1);
      }
      
      // === PERGUNTAS FREQUENTES ===
      doc.setFontSize(16);
      doc.setTextColor(0, 102, 204);
      const perguntasTituloWidth = doc.getTextWidth('Perguntas Frequentes');
      doc.text('Perguntas Frequentes', (210 - perguntasTituloWidth) / 2, startY + 120); // Mais espaço do gráfico
      
      const perguntasTable = [
        ['Pergunta', 'Frequência'],
        ...dadosPerguntasFrequentes.slice(0, 8).map(item => [item.name, item.value.toString()])
      ];
      
      doc.autoTable({
        startY: startY + 125,
        head: [perguntasTable[0]],
        body: perguntasTable.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 204] },
        columnStyles: {
          0: { cellWidth: 120, fontSize: 8 }, // Aumentado para evitar quebra
          1: { cellWidth: 30, halign: 'center' }
        },
        margin: { left: 15 },
        styles: { fontSize: 8 }
      });
      
      // === RANKING DE AGENTES ===
      doc.setFontSize(16);
      doc.setTextColor(0, 102, 204);
      const rankingTituloWidth = doc.getTextWidth('Ranking de Agentes');
      doc.text('Ranking de Agentes', (210 - rankingTituloWidth) / 2, doc.lastAutoTable.finalY + 20);
      
      const rankingTable = [
        ['Agente', 'Perguntas', 'Sessões', 'Score'],
        ...dadosRankingAgentes.slice(0, 8).map(agente => [
          agente.name,
          agente.perguntas.toString(),
          agente.sessoes.toString(),
          agente.score.toString()
        ])
      ];
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [rankingTable[0]],
        body: rankingTable.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 204] },
        columnStyles: {
          0: { cellWidth: 90, fontSize: 8 }, // Aumentado para mesma largura total
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' }
        },
        margin: { left: 15 },
        styles: { fontSize: 8 }
      });
      
      // === LISTA DE ATIVIDADES ===
      doc.setFontSize(16);
      doc.setTextColor(0, 102, 204);
      const atividadesTituloWidth = doc.getTextWidth('Lista de Atividades');
      doc.text('Lista de Atividades', (210 - atividadesTituloWidth) / 2, doc.lastAutoTable.finalY + 20);
      
      const atividadesTable = [
        ['Usuário', 'Pergunta', 'Data', 'Horário'],
        ...listaAtividades.slice(0, 10).map(atividade => [
          atividade.usuario,
          atividade.pergunta.length > 35 ? atividade.pergunta.substring(0, 35) + '...' : atividade.pergunta,
          atividade.data,
          atividade.horario
        ])
      ];
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [atividadesTable[0]],
        body: atividadesTable.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 204] },
        columnStyles: {
          0: { cellWidth: 35, fontSize: 8 }, // Ajustado para mesma largura total (150mm)
          1: { cellWidth: 80, fontSize: 8 }, // Aumentado para perguntas
          2: { cellWidth: 20, halign: 'center', fontSize: 8 },
          3: { cellWidth: 15, halign: 'center', fontSize: 8 }
        },
        margin: { left: 15 },
        styles: { fontSize: 8 }
      });
      
      // Gerar nome do arquivo com data e período
      const dataArquivo = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const periodoArquivo = periodoFiltro === '1dia' ? '1_dia' : 
                            periodoFiltro === '7dias' ? '7_dias' : 
                            periodoFiltro === '30dias' ? '30_dias' : 
                            periodoFiltro === '90dias' ? '90_dias' : 
                            periodoFiltro === '1ano' ? '1_ano' : periodoFiltro;
      const nomeArquivo = `Bot_Analises_Consolidacao_${periodoArquivo}_${dataArquivo}.pdf`;
      
      // Download
      doc.save(nomeArquivo);
      
      console.log('✅ Exportação PDF consolidada concluída com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao exportar PDF:', error);
      alert('Erro ao exportar arquivo PDF. Tente novamente.');
    }
  }, [metricas, dadosGrafico, dadosPerguntasFrequentes, dadosRankingAgentes, listaAtividades, periodoFiltro, exibicaoFiltro]);


  // Carregar métricas quando o componente montar ou filtro mudar
  useEffect(() => {
    const carregarMetricas = async () => {
      try {
        setLoading(true);
        
        // Ativar cache quando entrar no módulo
        botAnalisesService.ativarCache();
        
        const dadosMetricas = await botAnalisesService.getMetricasGerais(periodoFiltro);
        setMetricas(dadosMetricas);
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarMetricas();
  }, [periodoFiltro]);

  // Limpar cache quando sair do componente
  useEffect(() => {
    return () => {
      botAnalisesService.limparCache();
    };
  }, []);

  // Carregar dados do gráfico quando filtros mudarem
  useEffect(() => {
    const carregarDadosGrafico = async () => {
      try {
        const dados = await botAnalisesService.getDadosUsoOperacao(periodoFiltroGrafico, exibicaoFiltroGrafico);
        console.log('=== DIAGNÓSTICO FASE 1 ===');
        console.log('Filtros ativos (gráfico):', { periodoFiltroGrafico, exibicaoFiltroGrafico });
        console.log('Dados brutos do gráfico:', dados);
        console.log('Total de períodos em totalUso:', Object.keys(dados.totalUso).length);
        console.log('Total de períodos em feedbacksPositivos:', Object.keys(dados.feedbacksPositivos).length);
        console.log('Total de períodos em feedbacksNegativos:', Object.keys(dados.feedbacksNegativos).length);
        console.log('Períodos únicos encontrados:', new Set([
          ...Object.keys(dados.totalUso),
          ...Object.keys(dados.feedbacksPositivos),
          ...Object.keys(dados.feedbacksNegativos)
        ]).size);
        console.log('Primeiros 10 períodos:', Object.keys(dados.totalUso).sort().slice(0, 10));
        console.log('Últimos 10 períodos:', Object.keys(dados.totalUso).sort().slice(-10));
        console.log('========================');
        setDadosGrafico(dados);
        
        // Carregar dados dos gráficos de pizza
        const perguntasFrequentes = await botAnalisesService.getPerguntasMaisFrequentes(periodoFiltroGrafico);
        const rankingAgentes = await botAnalisesService.getRankingAgentes(periodoFiltroGrafico);
        
        setDadosPerguntasFrequentes(perguntasFrequentes);
        setDadosRankingAgentes(rankingAgentes);
        
        // Carregar dados dos containers de análise
        const atividades = await botAnalisesService.getListaAtividades(periodoFiltroGrafico);
        const analises = await botAnalisesService.getAnalisesEspecificas(periodoFiltroGrafico);
        
        setListaAtividades(atividades);
        setAnalisesEspecificas(analises);
      } catch (error) {
        console.error('Erro ao carregar dados do gráfico:', error);
      }
    };

    carregarDadosGrafico();
  }, [periodoFiltroGrafico, exibicaoFiltroGrafico]);

  const opcoesPeriodo = [
    { value: '1dia', label: 'Último dia' },
    { value: '7dias', label: 'Últimos 7 dias' },
    { value: '30dias', label: 'Últimos 30 dias' },
    { value: '90dias', label: 'Últimos 90 dias' },
    { value: '1ano', label: 'Último ano' },
    { value: 'todos', label: 'Todos os períodos' }
  ];

  const opcoesExibicao = [
    { value: 'dia', label: 'Por Dia' },
    { value: 'semana', label: 'Por Semana' },
    { value: 'mes', label: 'Por Mês' }
  ];

  // Cores para os gráficos de pizza
  const coresPizza = [
    '#1634FF', '#1694FF', '#000058', '#006AB9', '#FCC200',
    '#15A237', '#FF6384', '#36A2EB', '#FFCE56', '#8A2BE2'
  ];


  return (
    <>
      <BackButton />
      
      <Typography 
        variant="h3" 
        component="h1"
        sx={{ 
          fontFamily: 'Poppins', 
          fontWeight: 600, 
          color: 'var(--blue-dark)',
          textAlign: 'center',
          mt: -5
        }}
      >
        Bot Análises
      </Typography>

      {/* Tabs do Material-UI com Botões de Exportação */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        mb: 3,
        mt: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="bot analises tabs"
          sx={{
            '& .MuiTab-root': {
              fontSize: '1.25rem',
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 48,
              '&.Mui-selected': {
                color: 'var(--blue-medium)',
              },
              '&:not(.Mui-selected)': {
                color: 'var(--gray)',
                opacity: 0.6,
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--blue-medium)',
              height: 3,
            }
          }}
        >
          <Tab 
            label="Atividade" 
            id="bot-analises-tab-0"
            aria-controls="bot-analises-tabpanel-0"
          />
          <Tab 
            label="Feedback" 
            id="bot-analises-tab-1"
            aria-controls="bot-analises-tabpanel-1"
          />
        </Tabs>
        
        {/* Botões de Exportação */}
        <Box sx={{ display: 'flex', gap: 1, pr: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleExportarXLS}
            sx={{
              borderColor: 'var(--blue-medium)',
              color: 'var(--blue-medium)',
              '&:hover': {
                borderColor: 'var(--blue-dark)',
                backgroundColor: 'var(--blue-light)',
              }
            }}
          >
            XLS
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={handleExportarPDF}
            sx={{
              borderColor: 'var(--red-medium)',
              color: 'var(--red-medium)',
              '&:hover': {
                borderColor: 'var(--red-dark)',
                backgroundColor: 'var(--red-light)',
              }
            }}
          >
            PDF
          </Button>
        </Box>
      </Box>

      {/* Conteúdo das Abas - Renderização Condicional Direta */}
      {activeTab === 0 && (
        <Container maxWidth="xl" sx={{ pt: 3 }}>
          {/* Container Principal - Geral da Operação */}
          <Card sx={{
            background: 'var(--cor-container)',
            borderRadius: '16px',
            border: '1px solid var(--cor-borda)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            mb: 4
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* Título e Filtro de Período na mesma linha */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 4
              }}>
                {/* Título Geral da Operação */}
                <Typography variant="h4" sx={{ 
                  fontFamily: 'Poppins', 
                  fontWeight: 600,
                  color: 'var(--blue-dark)'
                }}>
                  Geral da Operação
                </Typography>

                {/* Filtro de Período */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 2
                }}>
                  <DateRange sx={{ 
                    color: 'var(--blue-medium)',
                    fontSize: '1.5rem'
                  }} />
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel sx={{ 
                      fontFamily: 'Poppins',
                      color: 'var(--blue-dark)'
                    }}>
                      Período
                    </InputLabel>
                    <Select
                      value={periodoFiltro}
                      onChange={handlePeriodoChange}
                      label="Período"
                      sx={{
                        fontFamily: 'Poppins',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--blue-dark)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--blue-medium)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--blue-medium)',
                        },
                      }}
                    >
                      {opcoesPeriodo.map((opcao) => (
                        <MenuItem 
                          key={opcao.value} 
                          value={opcao.value}
                          sx={{ fontFamily: 'Poppins' }}
                        >
                          {opcao.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Cards de Métricas */}
              <Grid container spacing={3}>
            {/* Total de Perguntas */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{
                background: 'transparent',
                borderRadius: '8px',
                border: '1.5px solid var(--blue-dark)',
                padding: '16px',
                margin: '8px',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <QuestionAnswer sx={{ 
                    fontSize: '3rem', 
                    color: 'var(--blue-medium)',
                    mb: 2
                  }} />
                  <Typography variant="h4" sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 700,
                    color: 'var(--blue-dark)',
                    mb: 1,
                    fontSize: '1.5rem'
                  }}>
                    {loading ? '...' : metricas.totalPerguntas.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontFamily: 'Poppins',
                    color: 'var(--gray)',
                    fontWeight: 500
                  }}>
                    Total de Perguntas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Usuários Ativos */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{
                background: 'transparent',
                borderRadius: '8px',
                border: '1.5px solid var(--blue-dark)',
                padding: '16px',
                margin: '8px',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <People sx={{ 
                    fontSize: '3rem', 
                    color: 'var(--blue-medium)',
                    mb: 2
                  }} />
                  <Typography variant='h4' sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 700,
                    color: 'var(--blue-dark)',
                    mb: 1,
                    fontSize: '1.5rem'
                  }}>
                    {loading ? '...' : metricas.usuariosAtivos}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontFamily: 'Poppins',
                    color: 'var(--gray)',
                    fontWeight: 500
                  }}>
                    Usuários Ativos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Horário Pico */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{
                background: 'transparent',
                borderRadius: '8px',
                border: '1.5px solid var(--blue-dark)',
                padding: '16px',
                margin: '8px',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Schedule sx={{ 
                    fontSize: '3rem', 
                    color: 'var(--blue-medium)',
                    mb: 2
                  }} />
                  <Typography variant='h4' sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 700,
                    color: 'var(--blue-dark)',
                    mb: 1,
                    fontSize: '1.5rem'
                  }}>
                    {loading ? '...' : metricas.horarioPico}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontFamily: 'Poppins',
                    color: 'var(--gray)',
                    fontWeight: 500
                  }}>
                    Horário Pico
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Taxa de Crescimento */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{
                background: 'transparent',
                borderRadius: '8px',
                border: '1.5px solid var(--blue-dark)',
                padding: '16px',
                margin: '8px',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  {loading ? (
                    <TrendingUp sx={{ 
                      fontSize: '3rem', 
                      color: 'var(--blue-medium)',
                      mb: 2
                    }} />
                  ) : (
                    metricas.crescimento.positivo ? (
                      <TrendingUp sx={{ 
                        fontSize: '3rem', 
                        color: 'var(--blue-medium)',
                        mb: 2
                      }} />
                    ) : (
                      <TrendingDown sx={{ 
                        fontSize: '3rem', 
                        color: '#d32f2f',
                        mb: 2
                      }} />
                    )
                  )}
                  <Typography variant='h4' sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 700,
                    color: 'var(--blue-dark)',
                    mb: 1,
                    fontSize: '1.5rem'
                  }}>
                    {loading ? '...' : `${metricas.crescimento.positivo ? '+' : '-'}${metricas.crescimento.percentual}%`}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontFamily: 'Poppins',
                    color: 'var(--gray)',
                    fontWeight: 500
                  }}>
                    Crescimento
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Média Diária */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{
                background: 'transparent',
                borderRadius: '8px',
                border: '1.5px solid var(--blue-dark)',
                padding: '16px',
                margin: '8px',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <BarChart sx={{ 
                    fontSize: '3rem', 
                    color: 'var(--blue-medium)',
                    mb: 2
                  }} />
                  <Typography variant='h4' sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 700,
                    color: 'var(--blue-dark)',
                    mb: 1,
                    fontSize: '1.5rem'
                  }}>
                    {loading ? '...' : metricas.mediaDiaria.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontFamily: 'Poppins',
                    color: 'var(--gray)',
                    fontWeight: 500
                  }}>
                    Média Diária
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
              </Grid>

              {/* Seção de Gráficos */}
              <Grid container spacing={4} sx={{ mt: 6 }}>
                {/* Gráfico de Linhas - Uso da Operação */}
                <Grid item xs={12}>
                  <Card sx={{
                    background: 'transparent',
                    borderRadius: '8px',
                    border: '1.5px solid var(--blue-dark)',
                    padding: '16px',
                    margin: '8px',
                    height: '400px'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 3
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ShowChart sx={{ 
                          fontSize: '2rem', 
                          color: 'var(--blue-medium)'
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontFamily: 'Poppins',
                          fontWeight: 600,
                          color: 'var(--blue-dark)'
                        }}>
                          Uso da Operação
                        </Typography>
                      </Box>
                      
                      {/* Filtros */}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Filtro de Exibição */}
                        <FormControl sx={{ minWidth: 150 }}>
                          <InputLabel sx={{ 
                            fontFamily: 'Poppins',
                            color: 'var(--blue-dark)'
                          }}>
                            Exibição por
                          </InputLabel>
                                 <Select
                                   value={exibicaoFiltroGrafico}
                                   onChange={handleExibicaoGraficoChange}
                            label="Exibição por"
                            sx={{
                              fontFamily: 'Poppins',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-dark)',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-medium)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-medium)',
                              },
                            }}
                          >
                            {opcoesExibicao.map((opcao) => (
                              <MenuItem 
                                key={opcao.value} 
                                value={opcao.value}
                                sx={{ fontFamily: 'Poppins' }}
                              >
                                {opcao.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Filtro de Período */}
                        <FormControl sx={{ minWidth: 150 }}>
                          <InputLabel sx={{ 
                            fontFamily: 'Poppins',
                            color: 'var(--blue-dark)'
                          }}>
                            Período
                          </InputLabel>
                          <Select
                            value={periodoFiltroGrafico}
                            onChange={handlePeriodoGraficoChange}
                            label="Período"
                            sx={{
                              fontFamily: 'Poppins',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-dark)',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-medium)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-medium)',
                              },
                            }}
                          >
                            {opcoesPeriodo.map((opcao) => (
                              <MenuItem 
                                key={opcao.value} 
                                value={opcao.value}
                                sx={{ fontFamily: 'Poppins' }}
                              >
                                {opcao.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    
                    <Box sx={{ height: '400px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={(() => {
                            // Combinar dados de todos os períodos
                            const todosPeriodos = new Set([
                              ...Object.keys(dadosGrafico.totalUso),
                              ...Object.keys(dadosGrafico.feedbacksPositivos),
                              ...Object.keys(dadosGrafico.feedbacksNegativos)
                            ]);
                            
                            return Array.from(todosPeriodos).sort().map(periodo => {
                              // Formatar data para exibição mantendo identificação única
                              let dataFormatada;
                              if (periodo.includes('-')) {
                                const data = new Date(periodo);
                                // Formato: DD/MM/YY para economizar espaço mas manter identificação
                                dataFormatada = data.toLocaleDateString('pt-BR', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  year: '2-digit' 
                                });
                              } else {
                                dataFormatada = periodo;
                              }
                              
                              return {
                                periodo: dataFormatada,
                                periodoOriginal: periodo, // Manter referência original
                                totalUso: dadosGrafico.totalUso[periodo] || 0,
                                feedbacksPositivos: dadosGrafico.feedbacksPositivos[periodo] || 0,
                                feedbacksNegativos: dadosGrafico.feedbacksNegativos[periodo] || 0
                              };
                            });
                          })()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                          syncId="grafico-uso"
                        >
                          <CartesianGrid 
                            strokeDasharray="1 1" 
                            stroke="#e0e0e0" 
                            vertical={true}
                            horizontal={true}
                            verticalPoints={undefined}
                            horizontalPoints={undefined}
                          />
                          <XAxis 
                            dataKey="periodo" 
                            stroke="#666"
                            fontSize={12}
                            fontFamily="Poppins"
                            interval={(() => {
                              // Política de vértices baseada no período
                              if (periodoFiltroGrafico === '1dia' || periodoFiltroGrafico === '7dias' || periodoFiltroGrafico === '30dias') {
                                return 0; // Mostra todos os pontos para até 30 dias
                              } else {
                                return 'preserveStartEnd'; // Mostra apenas início e fim para períodos maiores
                              }
                            })()}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fontSize: 12 }}
                            domain={['dataMin', 'dataMax']}
                            tickCount={undefined}
                            allowDecimals={false}
                            type="category"
                            scale="point"
                            tickLine={true}
                            axisLine={true}
                          />
                          <YAxis 
                            stroke="#666"
                            fontSize={12}
                            fontFamily="Poppins"
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #ccc',
                              borderRadius: '8px',
                              fontFamily: 'Poppins',
                              fontSize: '12px'
                            }}
                            labelStyle={{
                              fontFamily: 'Poppins',
                              fontWeight: 600,
                              color: 'var(--blue-dark)'
                            }}
                            formatter={(value, name) => {
                              const labels = {
                                'totalUso': 'Total de Uso',
                                'feedbacksPositivos': 'Feedbacks Positivos',
                                'feedbacksNegativos': 'Feedbacks Negativos'
                              };
                              return [value, labels[name] || name];
                            }}
                            labelFormatter={(label) => {
                              // Formatar a data para exibição mais amigável
                              if (label.includes('-')) {
                                const date = new Date(label);
                                return date.toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                });
                              }
                              return label;
                            }}
                          />
                          <Legend 
                            wrapperStyle={{
                              fontFamily: 'Poppins',
                              fontSize: '14px'
                            }}
                          />
                          <Line 
                            type="linear" 
                            dataKey="totalUso" 
                            stroke="#1634FF" 
                            strokeWidth={3}
                            dot={{ fill: '#1634FF', strokeWidth: 2, r: 4 }}
                            name="Total de Uso"
                            connectNulls={false}
                          />
                          <Line 
                            type="linear" 
                            dataKey="feedbacksPositivos" 
                            stroke="#15A237" 
                            strokeWidth={3}
                            dot={{ fill: '#15A237', strokeWidth: 2, r: 4 }}
                            name="Feedbacks Positivos"
                            connectNulls={false}
                          />
                          <Line 
                            type="linear" 
                            dataKey="feedbacksNegativos" 
                            stroke="#d32f2f" 
                            strokeWidth={3}
                            dot={{ fill: '#d32f2f', strokeWidth: 2, r: 4 }}
                            name="Feedbacks Negativos"
                            connectNulls={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Card>
                </Grid>

                {/* Gráfico de Pizza - 9 Perguntas Mais Frequentes */}
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    background: 'transparent',
                    borderRadius: '8px',
                    border: '1.5px solid var(--blue-dark)',
                    padding: '16px',
                    margin: '8px',
                    height: '400px'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      mb: 3
                    }}>
                             <PieChartIcon sx={{ 
                               fontSize: '2rem', 
                               color: 'var(--blue-medium)'
                             }} />
                      <Typography variant="h6" sx={{ 
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        color: 'var(--blue-dark)'
                      }}>
                        Perguntas Mais Frequentes
                      </Typography>
                    </Box>
                    
                           <Box sx={{ height: '300px', width: '100%' }}>
                             <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                 <Pie
                                   data={dadosPerguntasFrequentes.slice(0, 5)}
                                   cx="50%"
                                   cy="50%"
                                   labelLine={false}
                                   label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                   outerRadius={80}
                                   fill="#8884d8"
                                   dataKey="value"
                                 >
                                   {dadosPerguntasFrequentes.slice(0, 5).map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={coresPizza[index % coresPizza.length]} />
                                   ))}
                                 </Pie>
                                 <Tooltip 
                                   contentStyle={{
                                     backgroundColor: 'white',
                                     border: '1px solid #ccc',
                                     borderRadius: '8px',
                                     fontFamily: 'Poppins',
                                     fontSize: '12px'
                                   }}
                                   formatter={(value, name) => [value, 'Perguntas']}
                                 />
                               </PieChart>
                             </ResponsiveContainer>
                           </Box>
                  </Card>
                </Grid>

                {/* Gráfico de Pizza - Ranking dos Agentes */}
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    background: 'transparent',
                    borderRadius: '8px',
                    border: '1.5px solid var(--blue-dark)',
                    padding: '16px',
                    margin: '8px',
                    height: '400px'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      mb: 3
                    }}>
                      <Person sx={{ 
                        fontSize: '2rem', 
                        color: 'var(--blue-medium)'
                      }} />
                      <Typography variant="h6" sx={{ 
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        color: 'var(--blue-dark)'
                      }}>
                        Ranking dos Agentes
                      </Typography>
                    </Box>
                    
                           <Box sx={{ height: '300px', width: '100%' }}>
                             <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                 <Pie
                                   data={dadosRankingAgentes}
                                   cx="50%"
                                   cy="50%"
                                   labelLine={false}
                                   label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                   outerRadius={80}
                                   fill="#8884d8"
                                   dataKey="score"
                                 >
                                   {dadosRankingAgentes.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={coresPizza[index % coresPizza.length]} />
                                   ))}
                                 </Pie>
                                 <Tooltip 
                                   contentStyle={{
                                     backgroundColor: 'white',
                                     border: '1px solid #ccc',
                                     borderRadius: '8px',
                                     fontFamily: 'Poppins',
                                     fontSize: '12px'
                                   }}
                                   formatter={(value, name) => [value, 'Score']}
                                 />
                               </PieChart>
                             </ResponsiveContainer>
                           </Box>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Container Principal - Análise de Utilização */}
          <Card sx={{
            background: 'var(--cor-container)',
            borderRadius: '16px',
            border: '1px solid var(--cor-borda)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            mb: 4,
            mt: 4
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* Título Análise de Utilização */}
              <Typography variant="h4" sx={{ 
                fontFamily: 'Poppins', 
                fontWeight: 600,
                color: 'var(--blue-dark)',
                textAlign: 'center',
                mb: 4
              }}>
                Análise de Utilização
              </Typography>

              <Grid container spacing={4}>
                {/* Análises Específicas */}
                <Grid item xs={12}>
                  <Card sx={{
                    background: 'transparent',
                    borderRadius: '8px',
                    border: '1.5px solid var(--blue-dark)',
                    padding: '16px',
                    margin: '8px',
                    height: '600px'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 3
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        color: 'var(--blue-dark)'
                      }}>
                        🔍 Análises Específicas
                      </Typography>
                      
                      {/* Filtros para Análises Específicas */}
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {/* Filtro de Período */}
                        <FormControl sx={{ minWidth: 200 }}>
                          <InputLabel sx={{ 
                            fontFamily: 'Poppins',
                            color: 'var(--blue-dark)'
                          }}>
                            Período
                          </InputLabel>
                          <Select
                            value={periodoFiltroGrafico}
                            onChange={handlePeriodoGraficoChange}
                            label="Período"
                            sx={{
                              fontFamily: 'Poppins',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-dark)',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-medium)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-medium)',
                              },
                            }}
                          >
                            {opcoesPeriodo.map((opcao) => (
                              <MenuItem 
                                key={opcao.value} 
                                value={opcao.value}
                                sx={{ fontFamily: 'Poppins' }}
                              >
                                {opcao.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Filtro de Usuário */}
                        <FormControl sx={{ minWidth: 200 }}>
                          <InputLabel sx={{ 
                            fontFamily: 'Poppins',
                            color: 'var(--blue-dark)'
                          }}>
                            Usuário
                          </InputLabel>
                          <Select
                            value={filtroUsuario}
                            onChange={handleFiltroUsuarioChange}
                            label="Usuário"
                            sx={{
                              fontFamily: 'Poppins',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-dark)',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-medium)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-medium)',
                              },
                            }}
                          >
                            <MenuItem value="todos" sx={{ fontFamily: 'Poppins' }}>
                              Todos os usuários
                            </MenuItem>
                            <MenuItem value="lucas.gravina@velotax.com.br" sx={{ fontFamily: 'Poppins' }}>
                              Lucas Gravina
                            </MenuItem>
                            <MenuItem value="admin@velotax.com.br" sx={{ fontFamily: 'Poppins' }}>
                              Admin
                            </MenuItem>
                            <MenuItem value="suporte@velotax.com.br" sx={{ fontFamily: 'Poppins' }}>
                              Suporte
                            </MenuItem>
                            <MenuItem value="outros" sx={{ fontFamily: 'Poppins' }}>
                              Outros usuários
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    
                           <Box sx={{ height: '550px', width: '100%' }}>
                             <Grid container spacing={2} sx={{ height: '100%' }}>
                               {/* Perguntas Mais Frequentes */}
                               <Grid item xs={12} md={4}>
                                 <Box sx={{ 
                                   p: 2,
                                   border: '1px solid var(--cor-borda)',
                                   borderRadius: '8px',
                                   height: '100%',
                                   backgroundColor: 'rgba(22, 52, 255, 0.02)'
                                 }}>
                                   <Typography variant="subtitle2" sx={{ 
                                     fontFamily: 'Poppins',
                                     fontWeight: 600,
                                     color: 'var(--blue-dark)',
                                     mb: 2,
                                     fontSize: '0.9rem'
                                   }}>
                                     📊 Perguntas Mais Frequentes
                                   </Typography>
                                   <Box sx={{ maxHeight: '450px', overflow: 'auto' }}>
                                     {analisesEspecificas.perguntasFrequentes?.slice(0, 10).map((item, index) => (
                                       <Box key={index} sx={{ 
                                         mb: 1,
                                         p: 1,
                                         backgroundColor: 'white',
                                         borderRadius: '4px',
                                         border: '1px solid #f0f0f0'
                                       }}>
                                         <Typography variant="caption" sx={{ 
                                           fontFamily: 'Poppins',
                                           color: 'var(--blue-medium)',
                                           fontWeight: 600,
                                           fontSize: '0.7rem'
                                         }}>
                                           #{index + 1}
                                         </Typography>
                                         <Typography variant="body2" sx={{ 
                                           fontFamily: 'Poppins',
                                           color: 'var(--gray)',
                                           fontSize: '0.75rem',
                                           mb: 0.5
                                         }}>
                                           {item.name}
                                         </Typography>
                                         <Typography variant="caption" sx={{ 
                                           fontFamily: 'Poppins',
                                           color: 'var(--blue-dark)',
                                           fontSize: '0.7rem',
                                           fontWeight: 600
                                         }}>
                                           {item.value} perguntas
                                         </Typography>
                                       </Box>
                                     ))}
                                   </Box>
                                 </Box>
                               </Grid>

                               {/* Padrões de Uso */}
                               <Grid item xs={12} md={4}>
                                 <Box sx={{ 
                                   p: 2,
                                   border: '1px solid var(--cor-borda)',
                                   borderRadius: '8px',
                                   height: '100%',
                                   backgroundColor: 'rgba(21, 162, 55, 0.02)'
                                 }}>
                                   <Typography variant="subtitle2" sx={{ 
                                     fontFamily: 'Poppins',
                                     fontWeight: 600,
                                     color: 'var(--blue-dark)',
                                     mb: 2,
                                     fontSize: '0.9rem'
                                   }}>
                                     📈 Padrões de Uso
                                   </Typography>
                                   <Box sx={{ maxHeight: '450px', overflow: 'auto' }}>
                                     {analisesEspecificas.padroesUso?.map((padrao, index) => (
                                       <Box key={index} sx={{ 
                                         mb: 1.5,
                                         p: 1.5,
                                         backgroundColor: 'white',
                                         borderRadius: '4px',
                                         border: '1px solid #f0f0f0'
                                       }}>
                                         <Typography variant="body2" sx={{ 
                                           fontFamily: 'Poppins',
                                           fontWeight: 600,
                                           color: 'var(--blue-dark)',
                                           fontSize: '0.8rem',
                                           mb: 0.5
                                         }}>
                                           {padrao.metrica}
                                         </Typography>
                                         <Typography variant="body2" sx={{ 
                                           fontFamily: 'Poppins',
                                           color: 'var(--gray)',
                                           fontSize: '0.75rem'
                                         }}>
                                           {padrao.valor}
                                         </Typography>
                                       </Box>
                                     ))}
                                   </Box>
                                 </Box>
                               </Grid>

                               {/* Análise de Sessões */}
                               <Grid item xs={12} md={4}>
                                 <Box sx={{ 
                                   p: 2,
                                   border: '1px solid var(--cor-borda)',
                                   borderRadius: '8px',
                                   height: '100%',
                                   backgroundColor: 'rgba(255, 99, 132, 0.02)'
                                 }}>
                                   <Typography variant="subtitle2" sx={{ 
                                     fontFamily: 'Poppins',
                                     fontWeight: 600,
                                     color: 'var(--blue-dark)',
                                     mb: 2,
                                     fontSize: '0.9rem'
                                   }}>
                                     🔄 Análise de Sessões
                                   </Typography>
                                   <Box sx={{ maxHeight: '450px', overflow: 'auto' }}>
                                     {analisesEspecificas.analiseSessoes?.map((sessao, index) => (
                                       <Box key={index} sx={{ 
                                         mb: 1.5,
                                         p: 1.5,
                                         backgroundColor: 'white',
                                         borderRadius: '4px',
                                         border: '1px solid #f0f0f0'
                                       }}>
                                         <Typography variant="body2" sx={{ 
                                           fontFamily: 'Poppins',
                                           fontWeight: 600,
                                           color: 'var(--blue-dark)',
                                           fontSize: '0.8rem',
                                           mb: 0.5
                                         }}>
                                           {sessao.metrica}
                                         </Typography>
                                         <Typography variant="body2" sx={{ 
                                           fontFamily: 'Poppins',
                                           color: 'var(--gray)',
                                           fontSize: '0.75rem'
                                         }}>
                                           {sessao.valor}
                                         </Typography>
                                       </Box>
                                     ))}
                                   </Box>
                                 </Box>
                               </Grid>
                             </Grid>
                           </Box>
                  </Card>
                </Grid>

                {/* Lista de Atividades */}
                <Grid item xs={12}>
                  <Card sx={{
                    background: 'transparent',
                    borderRadius: '8px',
                    border: '1.5px solid var(--blue-dark)',
                    padding: '16px',
                    margin: '8px',
                    height: '500px'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      mb: 3
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        color: 'var(--blue-dark)'
                      }}>
                        📋 Lista de Atividades
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2,
                      p: 1
                    }}>
                      <Typography variant="body2" sx={{ 
                        fontFamily: 'Poppins',
                        color: 'var(--gray)',
                        fontSize: '0.875rem'
                      }}>
                        Últimas {listaAtividades.length} atividades
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontFamily: 'Poppins',
                        color: 'var(--blue-medium)',
                        fontSize: '0.875rem'
                      }}>
                        Período: {periodoFiltroGrafico}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      height: '350px',
                      overflow: 'auto',
                      border: '1px solid var(--cor-borda)',
                      borderRadius: '4px'
                    }}>
                      {listaAtividades.map((atividade, index) => (
                        <Box key={index} sx={{ 
                          p: 2, 
                          borderBottom: index < listaAtividades.length - 1 ? '1px solid #f0f0f0' : 'none',
                          '&:hover': {
                            backgroundColor: 'rgba(22, 52, 255, 0.05)'
                          }
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ 
                                fontFamily: 'Poppins',
                                fontWeight: 600,
                                color: 'var(--blue-dark)',
                                mb: 0.5
                              }}>
                                {atividade.usuario}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                fontFamily: 'Poppins',
                                color: 'var(--gray)',
                                fontSize: '0.8rem',
                                mb: 0.5
                              }}>
                                {atividade.pergunta}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                fontFamily: 'Poppins',
                                color: 'var(--gray)',
                                fontSize: '0.75rem'
                              }}>
                                {atividade.data} • {atividade.horario}
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              ml: 2,
                              px: 1,
                              py: 0.5,
                              backgroundColor: atividade.acao === 'question_asked' ? 'rgba(22, 52, 255, 0.1)' : 'rgba(21, 162, 55, 0.1)',
                              borderRadius: '4px',
                              minWidth: '80px',
                              textAlign: 'center'
                            }}>
                              <Typography variant="caption" sx={{ 
                                fontFamily: 'Poppins',
                                color: atividade.acao === 'question_asked' ? 'var(--blue-medium)' : 'var(--green)',
                                fontSize: '0.7rem',
                                fontWeight: 600
                              }}>
                                {atividade.acao === 'question_asked' ? 'Pergunta' : 'Feedback'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                      
                      {listaAtividades.length === 0 && (
                        <Box sx={{ 
                          p: 4,
                          textAlign: 'center',
                          color: 'var(--gray)'
                        }}>
                          <Typography variant="body2" sx={{ fontFamily: 'Poppins' }}>
                            Nenhuma atividade encontrada para o período selecionado
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      )}

      {activeTab === 1 && (
        <Container maxWidth="xl" sx={{ pt: 3 }}>
          {/* Placa de Em Obras */}
          <Card sx={{
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
            borderRadius: '16px',
            border: '2px solid #f39c12',
            boxShadow: '0 8px 32px rgba(243, 156, 18, 0.3)',
            mb: 4,
            mt: 2
          }}>
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              {/* Ícone de Construção */}
              <Box sx={{ 
                fontSize: '4rem', 
                mb: 3,
                animation: 'pulse 2s infinite'
              }}>
                🚧
              </Box>
              
              {/* Título */}
              <Typography variant="h4" sx={{ 
                fontFamily: 'Poppins', 
                fontWeight: 700,
                color: '#d68910',
                mb: 2
              }}>
                Dashboard de Feedback
              </Typography>
              
              {/* Subtítulo */}
              <Typography variant="h6" sx={{ 
                fontFamily: 'Poppins', 
                fontWeight: 600,
                color: '#b7950b',
                mb: 3
              }}>
                🛠️ Em Construção
              </Typography>
              
              {/* Descrição */}
              <Typography variant="body1" sx={{ 
                fontFamily: 'Poppins', 
                color: '#8b6914',
                fontSize: '1.1rem',
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}>
                Estamos trabalhando para trazer análises detalhadas de feedback, 
                métricas de satisfação e insights sobre a experiência dos usuários. 
                Em breve você terá acesso a relatórios completos!
              </Typography>
            </CardContent>
          </Card>
        </Container>
      )}
    </>
  );
};

export default BotAnalisesPage;
