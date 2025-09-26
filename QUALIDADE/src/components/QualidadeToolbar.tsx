import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Download, Database } from 'lucide-react';

interface QualidadeToolbarProps {
  onExportExcel: () => void;
  onExportPDF: () => void;
  onDataImported?: () => void;
}

const QualidadeToolbar: React.FC<QualidadeToolbarProps> = ({
  onExportExcel,
  onExportPDF,
  onDataImported
}) => {
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [jsonData, setJsonData] = useState('');

  const handleExport = () => {
    // Exportar dados de qualidade para JSON
    try {
      const avaliacoes = JSON.parse(localStorage.getItem('qualidade_avaliacoes') || '[]');
      
      // Extrair avaliações GPT das avaliações normais
      const avaliacoesGPT = avaliacoes
        .filter((av: any) => av.avaliacaoGPT)
        .map((av: any) => av.avaliacaoGPT);
      
      const qualidadeData = {
        avaliacoes: avaliacoes,
        avaliacoesGPT: avaliacoesGPT,
        timestamp: new Date().toISOString(),
        source: window.location.hostname + ':' + window.location.port
      };

      const blob = new Blob([JSON.stringify(qualidadeData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qualidade_velotax_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      console.log('✅ Dados de qualidade exportados com sucesso');
      console.log('📊 Resumo da exportação:', {
        totalAvaliacoes: avaliacoes.length,
        totalAvaliacoesGPT: avaliacoesGPT.length,
        timestamp: qualidadeData.timestamp,
        source: qualidadeData.source
      });
    } catch (error) {
      console.error('❌ Erro ao exportar dados de qualidade:', error);
      alert(`Erro ao exportar dados de qualidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleImport = () => {
    if (!jsonData.trim()) {
      alert('Por favor, cole os dados JSON primeiro');
      return;
    }

    try {
      const data = JSON.parse(jsonData);
      console.log('🔍 Dados JSON recebidos:', data);
      
      if (!data.avaliacoes || !Array.isArray(data.avaliacoes)) {
        throw new Error('Dados inválidos: propriedade "avaliacoes" deve ser um array');
      }
      
      // Se temos avaliações GPT separadas, precisamos integrá-las
      let avaliacoesParaSalvar = data.avaliacoes;
      
      if (data.avaliacoesGPT && Array.isArray(data.avaliacoesGPT)) {
        console.log(`🔄 Integrando ${data.avaliacoesGPT.length} avaliações GPT...`);
        
        // Mapear avaliações GPT para suas avaliações correspondentes
        avaliacoesParaSalvar = data.avaliacoes.map((avaliacao: any) => {
          const avaliacaoGPT = data.avaliacoesGPT.find((gpt: any) => gpt.avaliacaoId === avaliacao.id);
          if (avaliacaoGPT) {
            return { ...avaliacao, avaliacaoGPT };
          }
          return avaliacao;
        });
      }
      
      localStorage.setItem('qualidade_avaliacoes', JSON.stringify(avaliacoesParaSalvar));
      console.log(`✅ ${avaliacoesParaSalvar.length} avaliações importadas (com GPT integrado)`);
      console.log('💾 Dados salvos na chave:', 'qualidade_avaliacoes');
      console.log('💾 Verificação - dados salvos:', JSON.parse(localStorage.getItem('qualidade_avaliacoes') || '[]').length);

      setJsonData('');
      setShowMigrationModal(false);
      
      if (onDataImported) {
        onDataImported();
      }

      alert('Dados de qualidade importados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao importar dados:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao importar dados: ${errorMessage}\n\nVerifique se o formato JSON está correto.`);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-700">Ferramentas de Qualidade</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Botão de Migração/Importação */}
          <button
            onClick={() => setShowMigrationModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Migrar/Importar dados de qualidade"
          >
            <Database className="h-4 w-4 mr-2" />
            Migrar Dados
          </button>

          {/* Botão de Exportação JSON */}
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            title="Exportar dados de qualidade para JSON"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar JSON
          </button>

          {/* Botão de Exportação Excel */}
          <button
            onClick={onExportExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Excel
          </button>
          
          {/* Botão de Exportação PDF */}
          <button
            onClick={onExportPDF}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </button>

          {/* Botão de Diagnóstico */}
          <button
            onClick={() => {
              const avaliacoes = JSON.parse(localStorage.getItem('qualidade_avaliacoes') || '[]');
              const avaliacoesGPT = avaliacoes.filter((av: any) => av.avaliacaoGPT).map((av: any) => av.avaliacaoGPT);
              console.log('🔍 === DIAGNÓSTICO DE QUALIDADE ===');
              console.log('Chave usada:', 'qualidade_avaliacoes');
              console.log('Total de avaliações:', avaliacoes.length);
              console.log('Total de avaliações GPT:', avaliacoesGPT.length);
              console.log('Primeira avaliação:', avaliacoes[0]);
              console.log('Primeira avaliação GPT:', avaliacoesGPT[0]);
              alert(`Diagnóstico: ${avaliacoes.length} avaliações, ${avaliacoesGPT.length} GPT`);
            }}
            className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            title="Diagnosticar dados de qualidade"
          >
            🔍
            Diagnóstico
          </button>
        </div>
      </div>

      {/* Modal de Migração/Importação */}
      {showMigrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Database className="h-5 w-5 mr-2 text-blue-600" />
                  Migração de Dados de Qualidade
                </h2>
                <button
                  onClick={() => setShowMigrationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Seção de Exportação */}
                <div className="border-2 border-green-500 bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-green-700 flex items-center gap-2">
                    📤 EXPORTAR DADOS DE QUALIDADE
                  </h3>
                  <p className="text-sm text-green-700 mb-3">
                    Exporte todos os dados de qualidade (avaliações, GPT, etc.) para transferir para outro computador.
                  </p>
                  <button
                    onClick={handleExport}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold"
                  >
                    📤 Exportar Dados de Qualidade
                  </button>
                </div>

                {/* Seção de Importação */}
                <div className="border-2 border-blue-500 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-700 flex items-center gap-2">
                    📥 IMPORTAR DADOS DE QUALIDADE
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Cole o conteúdo do arquivo JSON exportado de outro computador para sincronizar os dados.
                  </p>
                  
                  <textarea
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    placeholder="Cole aqui o conteúdo do arquivo JSON exportado..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={handleImport}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold"
                    >
                      📥 Importar Dados
                    </button>
                    <button
                      onClick={() => setJsonData('')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      🧹 Limpar Campo
                    </button>
                  </div>
                </div>

                {/* Instruções */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-800">💡 INSTRUÇÕES:</h4>
                  <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
                    <li><strong>1º Passo:</strong> No computador com dados, clique em "Exportar JSON"</li>
                    <li><strong>2º Passo:</strong> Salve o arquivo JSON no seu computador</li>
                    <li><strong>3º Passo:</strong> Abra o arquivo e copie todo o conteúdo</li>
                    <li><strong>4º Passo:</strong> Cole no campo acima e clique em "Importar Dados"</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QualidadeToolbar;
