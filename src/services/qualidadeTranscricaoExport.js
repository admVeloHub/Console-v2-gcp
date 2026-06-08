/**
 * qualidadeTranscricaoExport.js
 * Exportação PDF da transcrição IA (formato diálogo).
 *
 * VERSION: v1.0.0
 * DATE: 2026-06-05
 * AUTHOR: VeloHub Development Team
 */

import jsPDF from 'jspdf';

const PAGE_MARGIN = 14;
const LINE_HEIGHT = 6;
const MAX_WIDTH = 180;

function wrapText(doc, text, maxWidth) {
  return doc.splitTextToSize(text, maxWidth);
}

/**
 * @param {Array<{role: string, fala: string}>} transcricao
 * @param {{ colaboradorNome?: string, dataLigacao?: string, nomeArquivoAudio?: string }} meta
 */
export function exportTranscricaoIaPdf(transcricao, meta = {}) {
  if (!Array.isArray(transcricao) || transcricao.length === 0) {
    throw new Error('Transcrição vazia');
  }

  const doc = new jsPDF();
  let y = PAGE_MARGIN;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Transcrição da Ligação', PAGE_MARGIN, y);
  y += LINE_HEIGHT + 2;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (meta.colaboradorNome) {
    doc.text(`Colaborador: ${meta.colaboradorNome}`, PAGE_MARGIN, y);
    y += LINE_HEIGHT;
  }
  if (meta.dataLigacao) {
    doc.text(`Data da ligação: ${meta.dataLigacao}`, PAGE_MARGIN, y);
    y += LINE_HEIGHT;
  }
  if (meta.nomeArquivoAudio) {
    const arquivoLines = wrapText(doc, `Arquivo: ${meta.nomeArquivoAudio}`, MAX_WIDTH);
    doc.text(arquivoLines, PAGE_MARGIN, y);
    y += arquivoLines.length * LINE_HEIGHT;
  }
  y += 4;

  transcricao.forEach((turno, index) => {
    const role = turno.role != null ? String(turno.role) : '';
    const fala = turno.fala != null ? String(turno.fala) : '';

    if (y > 270) {
      doc.addPage();
      y = PAGE_MARGIN;
    }

    if (index > 0) {
      doc.setDrawColor(200, 200, 220);
      doc.setLineWidth(0.2);
      doc.line(PAGE_MARGIN, y, PAGE_MARGIN + MAX_WIDTH, y);
      y += 4;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const roleLines = wrapText(doc, `${role}:`, MAX_WIDTH);
    doc.text(roleLines, PAGE_MARGIN, y);
    y += roleLines.length * LINE_HEIGHT;

    doc.setFont('helvetica', 'italic');
    const falaLines = wrapText(doc, fala, MAX_WIDTH);
    if (y + falaLines.length * LINE_HEIGHT > 285) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
    doc.text(falaLines, PAGE_MARGIN, y);
    y += falaLines.length * LINE_HEIGHT + 4;
  });

  const dataArquivo = new Date().toISOString().split('T')[0];
  const nomeBase = meta.colaboradorNome
    ? meta.colaboradorNome.replace(/\s+/g, '_')
    : 'transcricao';
  doc.save(`Transcricao_IA_${nomeBase}_${dataArquivo}.pdf`);
}
