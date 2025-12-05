// VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Componente para renderizar conteúdo Markdown como HTML
 * Suporta: negrito (**), itálico (*), sublinhado (__), links [texto](url), imagens ![alt](url)
 */
const MarkdownRenderer = ({ content, maxLength, ...props }) => {
  if (!content || typeof content !== 'string') {
    return null;
  }

  // Função para converter markdown para HTML
  const markdownToHtml = (markdown) => {
    let html = markdown;

    // Escapar HTML existente para evitar XSS
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Converter imagens: ![alt](url)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" />');

    // Converter links: [texto](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--blue-medium); text-decoration: underline;">$1</a>');

    // Converter negrito e itálico combinados: ***texto***
    html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');

    // Converter negrito: **texto**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Converter itálico: *texto* (mas não ***texto***)
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

    // Converter sublinhado: __texto__
    html = html.replace(/__([^_]+)__/g, '<u>$1</u>');

    // Converter quebras de linha duplas em parágrafos
    html = html.split(/\n\s*\n/).map(paragraph => {
      if (paragraph.trim()) {
        return `<p style="margin: 8px 0;">${paragraph.trim()}</p>`;
      }
      return '';
    }).join('');

    // Converter quebras de linha simples em <br>
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  // Truncar conteúdo se maxLength for especificado (antes de converter para HTML)
  let displayContent = content;
  if (maxLength && content.length > maxLength) {
    // Truncar em um espaço para evitar cortar palavras
    const truncated = content.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    displayContent = lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }

  const htmlContent = markdownToHtml(displayContent);

  return (
    <Box
      {...props}
      sx={{
        fontFamily: 'Poppins',
        fontSize: '0.8rem',
        lineHeight: 1.6,
        '& p': {
          margin: '8px 0',
        },
        '& strong': {
          fontWeight: 600,
        },
        '& em': {
          fontStyle: 'italic',
        },
        '& u': {
          textDecoration: 'underline',
        },
        '& a': {
          color: 'var(--blue-medium)',
          textDecoration: 'underline',
          '&:hover': {
            color: 'var(--blue-dark)',
          },
        },
        '& img': {
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
          margin: '10px 0',
        },
        ...props.sx
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;

