// VERSION: v1.3.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

import { getAvaliacoes } from './qualidadeAPI';
import { getFuncionarios } from './qualidadeAPI';

// Exportar avaliações para Excel/CSV
export const exportAvaliacoesToExcel = async () => {
  try {
    const avaliacoes = await getAvaliacoes();
    
    if (avaliacoes.length === 0) {
      alert('Não há avaliações para exportar');
      return;
    }

    // Criar CSV
    const headers = [
      'ID', 'Colaborador', 'Avaliador', 'Mês', 'Ano', 'Data Avaliação',
      'Saudação Adequada', 'Escuta Ativa', 'Resolução Questão', 'Empatia/Cordialidade',
      'Direcionou Pesquisa', 'Procedimento Incorreto', 'Encerramento Brusco',
      'Pontuação Total', 'Observações', 'Arquivo de Áudio'
    ];

    const csvContent = [
      headers.join(','),
      ...avaliacoes.map(avaliacao => [
        avaliacao._id,
        `"${avaliacao.colaboradorNome}"`,
        `"${avaliacao.avaliador}"`,
        avaliacao.mes,
        avaliacao.ano,
        avaliacao.dataAvaliacao,
        avaliacao.saudacaoAdequada ? 'Sim' : 'Não',
        avaliacao.escutaAtiva ? 'Sim' : 'Não',
        avaliacao.resolucaoQuestao ? 'Sim' : 'Não',
        avaliacao.empatiaCordialidade ? 'Sim' : 'Não',
        avaliacao.direcionouPesquisa ? 'Sim' : 'Não',
        avaliacao.procedimentoIncorreto ? 'Sim' : 'Não',
        avaliacao.encerramentoBrusco ? 'Sim' : 'Não',
        avaliacao.pontuacaoTotal,
        `"${avaliacao.observacoesModeracao || ''}"`,
        avaliacao.arquivoLigacao ? 'Sim' : 'Não'
      ].join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `avaliacoes_qualidade_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ Exportação para Excel concluída:', avaliacoes.length, 'avaliações');
  } catch (error) {
    console.error('❌ Erro ao exportar para Excel:', error);
    alert('Erro ao exportar dados para Excel');
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

    // Calcular estatísticas
    const totalAvaliacoes = avaliacoes.length;
    const mediaGeral = avaliacoes.reduce((sum, a) => sum + a.pontuacaoTotal, 0) / totalAvaliacoes;
    const avaliacoesExcelentes = avaliacoes.filter(a => a.pontuacaoTotal >= 80).length;
    const avaliacoesBoa = avaliacoes.filter(a => a.pontuacaoTotal >= 60 && a.pontuacaoTotal < 80).length;
    const avaliacoesRegular = avaliacoes.filter(a => a.pontuacaoTotal >= 40 && a.pontuacaoTotal < 60).length;
    const avaliacoesRuim = avaliacoes.filter(a => a.pontuacaoTotal < 40).length;

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
              <th>Mês/Ano</th>
              <th>Pontuação</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            ${avaliacoes.map(avaliacao => {
              const status = avaliacao.pontuacaoTotal >= 80 ? 'Excelente' : 
                           avaliacao.pontuacaoTotal >= 60 ? 'Bom' : 
                           avaliacao.pontuacaoTotal >= 40 ? 'Regular' : 'Ruim';
              const statusClass = avaliacao.pontuacaoTotal >= 80 ? 'status-excelente' : 
                                avaliacao.pontuacaoTotal >= 60 ? 'status-bom' : 
                                avaliacao.pontuacaoTotal >= 40 ? 'status-regular' : 'status-ruim';
              
              return `
                <tr>
                  <td>${avaliacao.colaboradorNome}</td>
                  <td>${avaliacao.avaliador}</td>
                  <td>${avaliacao.mes}/${avaliacao.ano}</td>
                  <td>${avaliacao.pontuacaoTotal}</td>
                  <td class="${statusClass}">${status}</td>
                  <td>${new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR')}</td>
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
