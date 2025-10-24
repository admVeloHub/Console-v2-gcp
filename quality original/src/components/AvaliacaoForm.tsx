import React, { useState, useEffect } from 'react';
import { X, Upload, FileAudio, ExternalLink } from 'lucide-react';
import { AvaliacaoFormData, Funcionario, MESES, ANOS, PONTUACAO } from '../types';
import { getFuncionariosAtivos } from '../utils/storage';

interface AvaliacaoFormProps {
  initialData?: Partial<AvaliacaoFormData>;
  isEditing?: boolean;
  onSubmit: (data: AvaliacaoFormData) => void;
  onCancel: () => void;
}

const AvaliacaoForm: React.FC<AvaliacaoFormProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<AvaliacaoFormData>({
    colaboradorId: '',
    avaliador: '',
    mes: new Date().toLocaleDateString('pt-BR', { month: 'long' }),
    ano: new Date().getFullYear(),
    saudacaoAdequada: false,
    escutaAtiva: false,
    resolucaoQuestao: false,
    empatiaCordialidade: false,
    direcionouPesquisa: false,
    procedimentoIncorreto: false,
    encerramentoBrusco: false,
    arquivoLigacao: undefined,
    observacoesModeracao: ''
  });

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [pontuacaoTotal, setPontuacaoTotal] = useState(0);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
    
    // Carregar funcionários ativos
    try {
      const funcionariosAtivos = getFuncionariosAtivos();
      setFuncionarios(funcionariosAtivos);
      
      if (funcionariosAtivos.length === 0) {
        console.warn('Nenhum funcionário ativo encontrado para avaliação');
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários ativos:', error);
      setFuncionarios([]);
    }
  }, [initialData]);

  useEffect(() => {
    calcularPontuacao();
  }, [formData]);

  const calcularPontuacao = () => {
    let pontuacao = 0;
    
    if (formData.saudacaoAdequada) pontuacao += PONTUACAO.SAUDACAO_ADEQUADA;
    if (formData.escutaAtiva) pontuacao += PONTUACAO.ESCUTA_ATIVA;
    if (formData.resolucaoQuestao) pontuacao += PONTUACAO.RESOLUCAO_QUESTAO;
    if (formData.empatiaCordialidade) pontuacao += PONTUACAO.EMPATIA_CORDIALIDADE;
    if (formData.direcionouPesquisa) pontuacao += PONTUACAO.DIRECIONOU_PESQUISA;
    if (formData.procedimentoIncorreto) pontuacao += PONTUACAO.PROCEDIMENTO_INCORRETO;
    if (formData.encerramentoBrusco) pontuacao += PONTUACAO.ENCERRAMENTO_BRUSCO;
    
    setPontuacaoTotal(pontuacao);
  };

  const handleInputChange = (field: keyof AvaliacaoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('🔍 === HANDLE FILE CHANGE ===');
    console.log('🔍 Arquivo selecionado:', file);
    console.log('🔍 Tipo do arquivo:', typeof file);
    console.log('🔍 É File?', file instanceof File);
    
    if (file) {
      console.log('🔍 Detalhes do arquivo:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      // Verificar tamanho do arquivo (50MB = 52428800 bytes)
      if (file.size > 52428800) {
        alert('Arquivo muito grande. Tamanho máximo permitido: 50MB');
        return;
      }
      
      // Verificar se é muito grande para localStorage (3MB = 3145728 bytes)
      if (file.size > 3145728) {
        alert('Arquivo grande detectado (mais de 3MB). Para arquivos maiores que 3MB, será usado o Vercel Blob automaticamente. Configure o Vercel Blob no deploy para arquivos grandes.');
        return;
      }
      
      // Verificar formato do arquivo
      const formatosPermitidos = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/wma', 'audio/aac'];
      if (!formatosPermitidos.includes(file.type)) {
        alert('Formato de arquivo não suportado. Use formatos de áudio comuns (WAV, MP3, MPEG, WMA, AAC)');
        return;
      }
      
      setArquivoSelecionado(file);
      setFormData(prev => ({ ...prev, arquivoLigacao: file }));
      console.log('✅ Arquivo configurado no formData');
    } else {
      console.log('⚠️ Nenhum arquivo selecionado');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 === HANDLE SUBMIT ===');
    console.log('🔍 FormData completo:', formData);
    console.log('🔍 Arquivo de ligação no submit:', formData.arquivoLigacao);
    console.log('🔍 Tipo do arquivo no submit:', typeof formData.arquivoLigacao);
    console.log('🔍 É File no submit?', formData.arquivoLigacao instanceof File);
    
    // Validações
    if (!formData.colaboradorId) {
      alert('Por favor, selecione um agente para avaliação');
      return;
    }
    
    if (!formData.avaliador.trim()) {
      alert('Por favor, informe o nome do avaliador');
      return;
    }
    
    if (funcionarios.length === 0) {
      alert('Não há funcionários ativos disponíveis. Verifique o módulo de Funcionários.');
      return;
    }
    
    console.log('✅ Enviando dados para onSubmit...');
    onSubmit(formData);
  };

  const getCriterioClass = (value: boolean) => {
    return `flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
      value 
        ? 'border-green-500 bg-green-50 text-green-800' 
        : 'border-gray-300 bg-gray-50 text-gray-700'
    }`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Editar Avaliação' : 'Nova Avaliação de Qualidade'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mensagem Informativa */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Importante:</strong> Selecione o agente que será avaliado. 
                  Apenas funcionários ativos (não desligados e não afastados) aparecem na lista.
                </p>
              </div>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Agente *
              </label>
              <select
                value={formData.colaboradorId}
                onChange={(e) => handleInputChange('colaboradorId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                required
              >
                <option value="">Selecione um agente</option>
                {funcionarios.map((funcionario) => (
                  <option key={funcionario.id} value={funcionario.id}>
                    {funcionario.nomeCompleto} - {funcionario.empresa} {funcionario.atuacao ? `(${funcionario.atuacao})` : ''}
                  </option>
                ))}
              </select>
              {funcionarios.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Nenhum funcionário ativo encontrado. Verifique o módulo de Funcionários.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avaliador *
              </label>
              <input
                type="text"
                value={formData.avaliador}
                onChange={(e) => handleInputChange('avaliador', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                placeholder="Nome do avaliador"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês
              </label>
              <select
                value={formData.mes}
                onChange={(e) => handleInputChange('mes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
              >
                {MESES.map((mes) => (
                  <option key={mes} value={mes}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano
              </label>
              <select
                value={formData.ano}
                onChange={(e) => handleInputChange('ano', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
              >
                {ANOS.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Critérios de Avaliação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Critérios de Avaliação
            </h3>

            {/* Saudação Adequada */}
            <div className={getCriterioClass(formData.saudacaoAdequada)}>
              <input
                type="checkbox"
                checked={formData.saudacaoAdequada}
                onChange={(e) => handleInputChange('saudacaoAdequada', e.target.checked)}
                className="w-5 h-5 text-velotax-blue border-gray-300 rounded focus:ring-velotax-blue"
              />
              <div className="flex-1">
                <div className="font-medium">Saudação Adequada</div>
                <div className="text-sm text-gray-600">
                  O colaborador saudou o cliente corretamente, utilizando o script estabelecido.
                </div>
                <div className="text-sm font-medium text-green-600 mt-1">
                  {formData.saudacaoAdequada ? `+${PONTUACAO.SAUDACAO_ADEQUADA} pontos` : '0 pontos'}
                </div>
              </div>
            </div>

            {/* Escuta Ativa / Sondagem */}
            <div className={getCriterioClass(formData.escutaAtiva)}>
              <input
                type="checkbox"
                checked={formData.escutaAtiva}
                onChange={(e) => handleInputChange('escutaAtiva', e.target.checked)}
                className="w-5 h-5 text-velotax-blue border-gray-300 rounded focus:ring-velotax-blue"
              />
              <div className="flex-1">
                <div className="font-medium">Escuta Ativa / Sondagem</div>
                <div className="text-sm text-gray-600">
                  O colaborador demonstrou atenção, não interrompeu e soube dialogar com o cliente.
                </div>
                <div className="text-sm font-medium text-green-600 mt-1">
                  {formData.escutaAtiva ? `+${PONTUACAO.ESCUTA_ATIVA} pontos` : '0 pontos'}
                </div>
              </div>
            </div>

            {/* Resolução Questão / Seguiu o procedimento */}
            <div className={getCriterioClass(formData.resolucaoQuestao)}>
              <input
                type="checkbox"
                checked={formData.resolucaoQuestao}
                onChange={(e) => handleInputChange('resolucaoQuestao', e.target.checked)}
                className="w-5 h-5 text-velotax-blue border-gray-300 rounded focus:ring-velotax-blue"
              />
              <div className="flex-1">
                <div className="font-medium">Resolução Questão / Seguiu o procedimento</div>
                <div className="text-sm text-gray-600">
                  A questão do cliente foi resolvida na primeira interação ou o encaminhamento foi correto.
                </div>
                <div className="text-sm font-medium text-green-600 mt-1">
                  {formData.resolucaoQuestao ? `+${PONTUACAO.RESOLUCAO_QUESTAO} pontos` : '0 pontos'}
                </div>
              </div>
            </div>

            {/* Empatia / Cordialidade */}
            <div className={getCriterioClass(formData.empatiaCordialidade)}>
              <input
                type="checkbox"
                checked={formData.empatiaCordialidade}
                onChange={(e) => handleInputChange('empatiaCordialidade', e.target.checked)}
                className="w-5 h-5 text-velotax-blue border-gray-300 rounded focus:ring-velotax-blue"
              />
              <div className="flex-1">
                <div className="font-medium">Empatia / Cordialidade</div>
                <div className="text-sm text-gray-600">
                  O colaborador manteve a conduta cordial e empática durante o atendimento, sem ríspidez ou agressividade.
                </div>
                <div className="text-sm font-medium text-green-600 mt-1">
                  {formData.empatiaCordialidade ? `+${PONTUACAO.EMPATIA_CORDIALIDADE} pontos` : '0 pontos'}
                </div>
              </div>
            </div>

            {/* Direcionou para pesquisa de satisfação */}
            <div className={getCriterioClass(formData.direcionouPesquisa)}>
              <input
                type="checkbox"
                checked={formData.direcionouPesquisa}
                onChange={(e) => handleInputChange('direcionouPesquisa', e.target.checked)}
                className="w-5 h-5 text-velotax-blue border-gray-300 rounded focus:ring-velotax-blue"
              />
              <div className="flex-1">
                <div className="font-medium">Direcionou para pesquisa de satisfação</div>
                <div className="text-sm text-gray-600">
                  O colaborador direcionou o cliente para a pesquisa de satisfação.
                </div>
                <div className="text-sm font-medium text-green-600 mt-1">
                  {formData.direcionouPesquisa ? `+${PONTUACAO.DIRECIONOU_PESQUISA} pontos` : '0 pontos'}
                </div>
              </div>
            </div>

            {/* Colaborador repassou um procedimento incorreto */}
            <div className={getCriterioClass(formData.procedimentoIncorreto)}>
              <input
                type="checkbox"
                checked={formData.procedimentoIncorreto}
                onChange={(e) => handleInputChange('procedimentoIncorreto', e.target.checked)}
                className="w-5 h-5 text-velotax-blue border-gray-300 rounded focus:ring-velotax-blue"
              />
              <div className="flex-1">
                <div className="font-medium">Colaborador repassou um procedimento incorreto</div>
                <div className="text-sm text-gray-600">
                  O colaborador repassou ou informou um procedimento indevido, que não resolve a questão do cliente ou que está fora dos procedimentos internos estabelecidos.
                </div>
                <div className="text-sm font-medium text-red-600 mt-1">
                  {formData.procedimentoIncorreto ? `${PONTUACAO.PROCEDIMENTO_INCORRETO} pontos` : '0 pontos'}
                </div>
              </div>
            </div>

            {/* Colaborador encerrou o contato de forma brusca */}
            <div className={getCriterioClass(formData.encerramentoBrusco)}>
              <input
                type="checkbox"
                checked={formData.encerramentoBrusco}
                onChange={(e) => handleInputChange('encerramentoBrusco', e.target.checked)}
                className="w-5 h-5 text-velotax-blue border-gray-300 rounded focus:ring-velotax-blue"
              />
              <div className="flex-1">
                <div className="font-medium">Colaborador encerrou o contato de forma brusca / Derrubou a ligação</div>
                <div className="text-sm text-gray-600">
                  O colaborador encerrou o contato durante a ligação, sem motivos justificáveis (chamada muda, cliente usando palavras de baixo calão, etc.)
                </div>
                <div className="text-sm font-medium text-red-600 mt-1">
                  {formData.encerramentoBrusco ? `${PONTUACAO.ENCERRAMENTO_BRUSCO} pontos` : '0 pontos'}
                </div>
              </div>
            </div>
          </div>

          {/* Pontuação Total */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600">Pontuação Total</div>
              <div className={`text-3xl font-bold ${
                pontuacaoTotal >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {pontuacaoTotal} pontos
              </div>
            </div>
          </div>

          {/* Upload do arquivo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Arquivo da Ligação
            </h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
                id="arquivo-ligacao"
              />
              <label htmlFor="arquivo-ligacao" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-lg font-medium text-gray-700 mb-2">
                  {arquivoSelecionado ? arquivoSelecionado.name : 'Clique para selecionar arquivo de áudio'}
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  Formatos aceitos: WAV, MP3, MPEG, WMA, AAC (máx. 3MB localStorage, 100MB Vercel Blob)
                </div>
                {arquivoSelecionado && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <FileAudio size={16} />
                    <span>{arquivoSelecionado.name}</span>
                    <span className="text-gray-400">
                      ({(arquivoSelecionado.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </label>
            </div>

            {/* Link para conversão */}
            <div className="text-center">
              <a
                href="https://convertio.co/pt/wav-mp3/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-velotax-blue hover:text-blue-700 transition-colors"
              >
                <ExternalLink size={16} />
                <span>Converter arquivo .wav para .mp3</span>
              </a>
            </div>
          </div>

          {/* Observações de moderação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações de Moderação
            </label>
            <textarea
              value={formData.observacoesModeracao}
              onChange={(e) => handleInputChange('observacoesModeracao', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
              placeholder="Observações adicionais para moderação..."
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-velotax-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Atualizar Avaliação' : 'Salvar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvaliacaoForm;
