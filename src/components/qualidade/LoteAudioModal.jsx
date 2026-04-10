/**

 * Modal: lote de áudios para análise IA sem avaliação manual prévia.

 * VERSION: v1.1.2 | DATE: 2026-04-10

 * CHANGELOG: v1.1.2 - Release push GitHub 2026-04-10

 * CHANGELOG: v1.1.1 - Campos data/hora da ligação: fonte menor no input

 * CHANGELOG: v1.1.0 - Anexar apenas seleciona arquivo; botão Enviar envia todos (upload sequencial); integração uploadAudioParaAnalise

 * CHANGELOG: v1.0.1 - Botão "Nova avaliação"; removido texto explicativo do rodapé do modal

 */



import React, { useState, useCallback, useRef } from 'react';

import {

  Dialog,

  DialogTitle,

  DialogContent,

  DialogActions,

  Button,

  Box,

  Typography,

  FormControl,

  InputLabel,

  Select,

  MenuItem,

  TextField,

  IconButton,

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableRow,

  LinearProgress

} from '@mui/material';

import {

  Add as AddIcon,

  AttachFile as AttachFileIcon,

  Delete as DeleteIcon,

  Send as SendIcon

} from '@mui/icons-material';

import { addAvaliacao } from '../../services/qualidadeAPI';

import { MESES } from '../../types/qualidade';

import { uploadAudioParaAnalise, validarArquivoAudio } from '../../services/qualidadeAudioService';



const formatDataAvaliacaoExibicao = () =>

  new Date().toLocaleDateString('pt-BR', {

    day: '2-digit',

    month: '2-digit',

    year: 'numeric'

  });



const mesAnoFromYmd = (ymd) => {

  if (!ymd || typeof ymd !== 'string') {

    const now = new Date();

    return { mes: MESES[now.getMonth()], ano: now.getFullYear() };

  }

  const [y, m] = ymd.split('-').map(Number);

  if (!y || !m || m < 1 || m > 12) {

    const now = new Date();

    return { mes: MESES[now.getMonth()], ano: now.getFullYear() };

  }

  return { mes: MESES[m - 1], ano: y };

};



const LoteAudioModal = ({

  open,

  onClose,

  funcionarios,

  avaliadorNome,

  onUploadItem,

  onLoteEnvioConcluido,

  onError

}) => {

  const [colaboradorNome, setColaboradorNome] = useState('');

  const [linhas, setLinhas] = useState([]);

  const [enviandoLote, setEnviandoLote] = useState(false);

  const fileInputRef = useRef(null);

  const pickTargetKeyRef = useRef(null);



  const reset = useCallback(() => {

    setColaboradorNome('');

    setLinhas([]);

    setEnviandoLote(false);

    pickTargetKeyRef.current = null;

  }, []);



  const handleClose = () => {

    if (enviandoLote) return;

    reset();

    onClose();

  };



  const handleDialogClose = (_event, reason) => {

    if (enviandoLote) return;

    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {

      handleClose();

    }

  };



  const addLinha = () => {

    setLinhas((prev) => [

      ...prev,

      {

        localKey: `l-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,

        dataLigacao: '',

        horaLigacao: '',

        dataAvaliacaoExibicao: formatDataAvaliacaoExibicao(),

        avaliacaoId: null,

        creating: false,

        arquivo: null,

        nomeArquivo: ''

      }

    ]);

  };



  const removeLinha = (localKey) => {

    setLinhas((prev) => prev.filter((l) => l.localKey !== localKey));

  };



  const updateLinha = (localKey, patch) => {

    setLinhas((prev) => prev.map((l) => (l.localKey === localKey ? { ...l, ...patch } : l)));

  };



  const buildDataLigacaoIso = (data, hora) => {

    if (!data) return '';

    if (hora) return `${data}T${hora.length === 5 ? hora : hora.substring(0, 5)}`;

    return data;

  };



  const abrirSeletorArquivo = (localKey) => {

    pickTargetKeyRef.current = localKey;

    fileInputRef.current?.click();

  };



  const onArquivoEscolhido = (e) => {

    const file = e.target.files?.[0];

    e.target.value = '';

    const key = pickTargetKeyRef.current;

    pickTargetKeyRef.current = null;

    if (!file || !key) return;



    const validation = validarArquivoAudio(file);

    if (!validation.isValid) {

      onError?.(validation.errors.join(', '));

      return;

    }

    updateLinha(key, { arquivo: file, nomeArquivo: file.name });

  };



  const temArquivosSelecionados = linhas.some((l) => l.arquivo);



  const handleEnviarLote = async () => {

    if (!colaboradorNome) {

      onError?.('Selecione o colaborador.');

      return;

    }

    if (!avaliadorNome) {

      onError?.('Avaliador não identificado na sessão.');

      return;

    }



    const comArquivo = linhas.filter((l) => l.arquivo);

    if (comArquivo.length === 0) return;



    for (const linha of comArquivo) {

      if (!linha.dataLigacao) {

        onError?.('Informe a data da ligação em todas as linhas com áudio selecionado.');

        return;

      }

    }



    setEnviandoLote(true);

    let enviados = 0;

    try {

      for (const linha of comArquivo) {

        const { mes, ano } = mesAnoFromYmd(linha.dataLigacao);

        const dataLigacao = buildDataLigacaoIso(linha.dataLigacao, linha.horaLigacao);



        let avaliacaoId = linha.avaliacaoId;

        if (!avaliacaoId) {

          updateLinha(linha.localKey, { creating: true });

          const created = await addAvaliacao({

            colaboradorNome,

            avaliador: avaliadorNome,

            mes,

            ano,

            saudacaoAdequada: false,

            escutaAtiva: false,

            clarezaObjetividade: false,

            resolucaoQuestao: false,

            registroAtendimento: false,

            empatiaCordialidade: false,

            direcionouPesquisa: false,

            naoConsultouBot: false,

            conformidadeTicket: false,

            procedimentoIncorreto: false,

            encerramentoBrusco: false,

            observacoes: '',

            dataLigacao,

            somenteAnaliseAudioIA: true

          });

          avaliacaoId = created?._id || created?.id;

          if (!avaliacaoId) {

            updateLinha(linha.localKey, { creating: false });

            throw new Error('Resposta da API sem id da avaliação.');

          }

          updateLinha(linha.localKey, { avaliacaoId, creating: false });

        }



        const result = await uploadAudioParaAnalise(avaliacaoId, linha.arquivo);

        if (onUploadItem) {

          await onUploadItem(result);

        }

        updateLinha(linha.localKey, { arquivo: null, nomeArquivo: '' });

        enviados += 1;

      }



      if (onLoteEnvioConcluido) {

        await onLoteEnvioConcluido({ enviados });

      }

    } catch (e) {

      console.error(e);

      onError?.(e?.message || 'Erro ao enviar lote de áudios.');

    } finally {

      setEnviandoLote(false);

    }

  };



  return (

    <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth>

      <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.96rem' }}>

        Lote de Áudio — análise por IA

      </DialogTitle>

      <DialogContent>

        <input

          ref={fileInputRef}

          type="file"

          accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac,.flac"

          style={{ display: 'none' }}

          onChange={onArquivoEscolhido}

        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>

          <FormControl fullWidth size="small" required disabled={enviandoLote}>

            <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Colaborador</InputLabel>

            <Select

              value={colaboradorNome}

              onChange={(e) => setColaboradorNome(e.target.value)}

              label="Colaborador"

              sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}

            >

              {funcionarios.map((f) => {

                const nome = f.colaboradorNome || f.nomeCompleto;

                return (

                  <MenuItem key={f._id || f.id} value={nome} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>

                    {nome}

                  </MenuItem>

                );

              })}

            </Select>

          </FormControl>



          <Button

            size="small"

            variant="outlined"

            startIcon={<AddIcon />}

            onClick={addLinha}

            disabled={enviandoLote}

            sx={{ fontFamily: 'Poppins', alignSelf: 'flex-start' }}

          >

            Nova avaliação

          </Button>



          {linhas.length > 0 && (

            <Table size="small">

              <TableHead>

                <TableRow>

                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>

                    Data ligação

                  </TableCell>

                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>

                    Hora ligação

                  </TableCell>

                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>

                    Data avaliação

                  </TableCell>

                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>

                    Áudio

                  </TableCell>

                  <TableCell width={48} />

                </TableRow>

              </TableHead>

              <TableBody>

                {linhas.map((linha) => (

                  <TableRow key={linha.localKey}>

                    <TableCell>

                      <TextField

                        type="date"

                        size="small"

                        value={linha.dataLigacao}

                        onChange={(e) => updateLinha(linha.localKey, { dataLigacao: e.target.value })}

                        disabled={enviandoLote}

                        InputLabelProps={{ shrink: true }}

                        sx={{

                          fontFamily: 'Poppins',

                          width: 132,

                          '& .MuiInputBase-input': {

                            fontSize: '0.7rem',

                            fontFamily: 'Poppins',

                            py: 0.45

                          },

                          '& .MuiOutlinedInput-root': {

                            fontSize: '0.7rem'

                          }

                        }}

                      />

                    </TableCell>

                    <TableCell>

                      <TextField

                        type="time"

                        size="small"

                        value={linha.horaLigacao}

                        onChange={(e) => updateLinha(linha.localKey, { horaLigacao: e.target.value })}

                        disabled={enviandoLote}

                        InputLabelProps={{ shrink: true }}

                        sx={{

                          fontFamily: 'Poppins',

                          width: 108,

                          '& .MuiInputBase-input': {

                            fontSize: '0.7rem',

                            fontFamily: 'Poppins',

                            py: 0.45

                          },

                          '& .MuiOutlinedInput-root': {

                            fontSize: '0.7rem'

                          }

                        }}

                      />

                    </TableCell>

                    <TableCell>

                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#666' }}>

                        {linha.dataAvaliacaoExibicao}

                      </Typography>

                    </TableCell>

                    <TableCell>

                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, maxWidth: 200 }}>

                        {linha.nomeArquivo ? (

                          <Typography

                            variant="caption"

                            sx={{ fontFamily: 'Poppins', color: '#333', wordBreak: 'break-all', lineHeight: 1.2 }}

                          >

                            {linha.nomeArquivo}

                          </Typography>

                        ) : null}

                        <Button

                          size="small"

                          variant="contained"

                          startIcon={<AttachFileIcon />}

                          disabled={linha.creating || enviandoLote}

                          onClick={() => abrirSeletorArquivo(linha.localKey)}

                          sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', bgcolor: 'var(--blue-medium)' }}

                        >

                          {linha.creating ? '…' : linha.nomeArquivo ? 'Trocar' : 'Anexar'}

                        </Button>

                      </Box>

                    </TableCell>

                    <TableCell>

                      <IconButton

                        size="small"

                        onClick={() => removeLinha(linha.localKey)}

                        disabled={enviandoLote}

                        aria-label="Remover linha"

                      >

                        <DeleteIcon fontSize="small" />

                      </IconButton>

                    </TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

          )}



          {enviandoLote && <LinearProgress sx={{ mt: 1 }} />}

        </Box>

      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>

        <Button onClick={handleClose} disabled={enviandoLote} sx={{ fontFamily: 'Poppins', color: '#666' }}>

          Fechar

        </Button>

        {temArquivosSelecionados && (

          <Button

            variant="contained"

            startIcon={<SendIcon />}

            disabled={enviandoLote || !colaboradorNome}

            onClick={handleEnviarLote}

            sx={{

              fontFamily: 'Poppins',

              fontWeight: 600,

              bgcolor: 'var(--blue-medium)',

              '&:hover': { bgcolor: 'var(--blue-dark)' }

            }}

          >

            Enviar

          </Button>

        )}

      </DialogActions>

    </Dialog>

  );

};



export default LoteAudioModal;


