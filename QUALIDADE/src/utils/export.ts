import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Funcionario } from '../types';

// Função auxiliar para formatar data de forma segura
const formatDate = (dateString: string | undefined, format: 'dd/MM' | 'dd/MM/yyyy HH:mm' = 'dd/MM'): string => {
  if (!dateString) return 'Não informado';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Não informado';
    
    if (format === 'dd/MM') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    } else {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  } catch (error) {
    return 'Não informado';
  }
};

export const exportToExcel = (funcionarios: Funcionario[]) => {
  try {
    console.log('Iniciando exportação Excel...');
    console.log('Funcionários recebidos:', funcionarios);
    
    if (!funcionarios || funcionarios.length === 0) {
      throw new Error('Nenhum funcionário para exportar');
    }

    // Preparar dados para exportação
    const data = funcionarios.map(funcionario => {
      console.log('Processando funcionário:', funcionario);
      return {
        'Nome Completo': funcionario.nomeCompleto || 'Não informado',
        'Data de Aniversário': formatDate(funcionario.dataAniversario, 'dd/MM'),
        'Empresa': funcionario.empresa || 'Não informado',
        'Data Contratado': formatDate(funcionario.dataContratado, 'dd/MM'),
        'Telefone': funcionario.telefone || 'Não informado',
        'Atuação': funcionario.atuacao || 'Não informado',
        'Escala': funcionario.escala || 'Não informado',
        'Quantidade de Acessos': funcionario.acessos?.length || 0,
        'Data de Criação': formatDate(funcionario.createdAt, 'dd/MM/yyyy HH:mm'),
      };
    });

    console.log('Dados preparados:', data);

    // Criar planilha
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Funcionários');
    
    // Ajustar largura das colunas
    const colWidths = [
      { wch: 30 }, // Nome Completo
      { wch: 15 }, // Data de Aniversário
      { wch: 20 }, // Empresa
      { wch: 15 }, // Data Contratado
      { wch: 15 }, // Telefone
      { wch: 20 }, // Atuação
      { wch: 15 }, // Escala
      { wch: 15 }, // Quantidade de Acessos
      { wch: 20 }, // Data de Criação
    ];
    ws['!cols'] = colWidths;

    const fileName = `funcionarios_velotax_${new Date().toISOString().split('T')[0]}.xlsx`;
    console.log('Salvando arquivo:', fileName);
    
    XLSX.writeFile(wb, fileName);
    console.log('Arquivo Excel salvo com sucesso!');
    
    return fileName;
  } catch (error) {
    console.error('Erro detalhado na exportação Excel:', error);
    throw new Error(`Erro ao exportar para Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

export const exportToPDF = (funcionarios: Funcionario[]) => {
  try {
    console.log('Iniciando exportação PDF...');
    console.log('Funcionários recebidos:', funcionarios);
    
    if (!funcionarios || funcionarios.length === 0) {
      throw new Error('Nenhum funcionário para exportar');
    }

    const doc = new jsPDF();
    console.log('Documento PDF criado');
    
    // Título
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 88); // Cor Velotax
    doc.text('Relatório de Funcionários - Velotax', 20, 20);
    
    // Data do relatório
    doc.setFontSize(12);
    doc.setTextColor(100);
    const hoje = new Date();
    const dataRelatorio = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()} ${hoje.getHours().toString().padStart(2, '0')}:${hoje.getMinutes().toString().padStart(2, '0')}`;
    doc.text(`Gerado em: ${dataRelatorio}`, 20, 30);
    
    // Tabela principal
    const tableData = funcionarios.map(funcionario => [
      funcionario.nomeCompleto || 'Não informado',
      formatDate(funcionario.dataAniversario, 'dd/MM'),
      funcionario.empresa || 'Não informado',
      formatDate(funcionario.dataContratado, 'dd/MM'),
      funcionario.telefone || 'Não informado',
      funcionario.atuacao || 'Não informado',
      funcionario.escala || 'Não informado',
      (funcionario.acessos?.length || 0).toString(),
    ]);

    console.log('Dados da tabela preparados:', tableData);

    autoTable(doc, {
      startY: 40,
      head: [['Nome', 'Aniversário', 'Empresa', 'Contratado', 'Telefone', 'Atuação', 'Escala', 'Acessos']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 0, 88],
        textColor: 255,
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    console.log('Tabela principal criada');

    // Adicionar informações de acessos se houver
    let currentY = (doc as any).lastAutoTable?.finalY + 20 || 60;
    
    funcionarios.forEach(funcionario => {
      if (funcionario.acessos && funcionario.acessos.length > 0) {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 88);
        doc.text(`Acessos de ${funcionario.nomeCompleto}:`, 20, currentY);
        currentY += 10;
        
        const acessosData = funcionario.acessos.map(acesso => [
          acesso.sistema || 'Não informado',
          acesso.perfil || '-',
          acesso.observacoes || '-',
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Sistema', 'Perfil', 'Observações']],
          body: acessosData,
          theme: 'striped',
          headStyles: {
            fillColor: [100, 100, 100],
            textColor: 255,
            fontSize: 8,
          },
          bodyStyles: {
            fontSize: 7,
          },
        });
        
        currentY = (doc as any).lastAutoTable?.finalY + 15 || currentY + 50;
      }
    });

    const fileName = `funcionarios_velotax_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('Salvando arquivo PDF:', fileName);
    
    doc.save(fileName);
    console.log('Arquivo PDF salvo com sucesso!');
    
    return fileName;
  } catch (error) {
    console.error('Erro detalhado na exportação PDF:', error);
    throw new Error(`Erro ao exportar para PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
