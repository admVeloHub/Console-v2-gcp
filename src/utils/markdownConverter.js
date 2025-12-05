// VERSION: v2.1.1 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
/**
 * Utilitário para conversão entre HTML (React Quill) e Markdown
 * Suporta: negrito (**), itálico (*), sublinhado (__), links [texto](url), imagens ![alt](url)
 * Suporta imagens temporárias: ![temp:uuid](blob:url)
 */

import TurndownService from 'turndown';

// Configurar Turndown para conversão HTML → Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  strongDelimiter: '**'
});

// Adicionar regra customizada para imagens temporárias ANTES das outras regras
// Isso garante que imagens com alt="temp:uuid" sejam preservadas corretamente
turndownService.addRule('tempImage', {
  filter: function (node) {
    return node.nodeName === 'IMG' && 
           node.getAttribute('alt') && 
           node.getAttribute('alt').startsWith('temp:');
  },
  replacement: function (content, node) {
    const alt = node.getAttribute('alt') || '';
    const src = node.getAttribute('src') || '';
    const style = node.getAttribute('style') || '';
    
    // Extrair width do style se existir
    let widthAttr = '';
    if (style) {
      const widthMatch = style.match(/width:\s*(\d+)px/);
      if (widthMatch) {
        widthAttr = ` width="${widthMatch[1]}"`;
      }
    }
    
    console.log(`🔍 [markdownConverter] Convertendo imagem temporária: alt="${alt}", src="${src.substring(0, 50)}...", width="${widthAttr}"`);
    
    // Preservar dimensões no HTML (markdown não suporta width diretamente, então mantemos no HTML)
    if (widthAttr) {
      return `<img src="${src}" alt="${alt}"${widthAttr} style="${style}" />`;
    }
    return `![${alt}](${src})`;
  }
});

// Adicionar regra para imagens normais preservando dimensões
turndownService.addRule('imageWithSize', {
  filter: function (node) {
    return node.nodeName === 'IMG' && 
           (!node.getAttribute('alt') || !node.getAttribute('alt').startsWith('temp:'));
  },
  replacement: function (content, node) {
    const alt = node.getAttribute('alt') || '';
    const src = node.getAttribute('src') || '';
    const style = node.getAttribute('style') || '';
    
    // Extrair width do style se existir
    let widthAttr = '';
    if (style) {
      const widthMatch = style.match(/width:\s*(\d+)px/);
      if (widthMatch) {
        widthAttr = ` width="${widthMatch[1]}"`;
      }
    }
    
    // Se tem dimensões customizadas, preservar como HTML
    if (widthAttr && style) {
      return `<img src="${src}" alt="${alt}"${widthAttr} style="${style}" />`;
    }
    
    // Caso contrário, usar formato markdown padrão
    return `![${alt}](${src})`;
  }
});

// Adicionar regras customizadas para manter compatibilidade com markdown
turndownService.addRule('underline', {
  filter: 'u',
  replacement: function (content) {
    return '__' + content + '__';
  }
});

turndownService.addRule('strikethrough', {
  filter: ['del', 's', 'strike'],
  replacement: function (content) {
    return '~~' + content + '~~';
  }
});

// Adicionar regra para preservar <br> como quebra de linha simples (\n)
turndownService.addRule('lineBreak', {
  filter: 'br',
  replacement: function () {
    return '\n';
  }
});

// Adicionar regra para preservar parágrafos como quebras duplas (\n\n)
turndownService.addRule('paragraph', {
  filter: 'p',
  replacement: function (content, node) {
    // Se o parágrafo está vazio ou só tem espaços, retornar quebra dupla
    if (!content.trim()) {
      return '\n\n';
    }
    // Se tem conteúdo, preservar com quebra dupla no final para separar parágrafos
    return content + '\n\n';
  }
});

/**
 * Converte HTML para Markdown
 * @param {string} html - String HTML do React Quill
 * @returns {string} - String em formato Markdown
 */
export const htmlToMarkdown = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    // Converter HTML para Markdown usando Turndown
    let markdown = turndownService.turndown(html);
    
    // Preservar quebras de linha de parágrafos: </p><p> vira \n\n
    markdown = markdown.replace(/<\/p>\s*<p>/g, '\n\n');
    
    // Preservar <br> como quebra de linha simples
    markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
    
    // Remover tags <p> restantes mas preservar conteúdo
    markdown = markdown.replace(/<\/?p>/g, '');
    
    // Normalizar quebras: múltiplas quebras (3+) viram duplas (máximo 2 conforme schema)
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    
    // Garantir que imagens temporárias (com alt="temp:uuid") sejam preservadas corretamente
    // O Turndown já converte <img alt="temp:uuid" src="blob:url"> para ![temp:uuid](blob:url)
    // Não precisamos fazer nada adicional, o Turndown já preserva o alt text
    
    return markdown.trim();
  } catch (error) {
    console.error('Erro ao converter HTML para Markdown:', error);
    return '';
  }
};

/**
 * Converte Markdown para HTML
 * @param {string} markdown - String em formato Markdown
 * @returns {string} - String HTML para React Quill
 */
export const markdownToHtml = (markdown) => {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  try {
    let html = markdown;

    // Escapar HTML existente para evitar XSS (mas manter tags válidas)
    // Não vamos escapar tudo, pois pode conter HTML válido já

    // Primeiro, preservar imagens HTML existentes (com style/width) antes de converter markdown
    // Isso garante que imagens redimensionadas sejam preservadas
    const imageHtmlRegex = /<img[^>]+>/gi;
    const htmlImages = [];
    html = html.replace(imageHtmlRegex, (match) => {
      htmlImages.push(match);
      return `__HTML_IMAGE_${htmlImages.length - 1}__`;
    });

    // Converter imagens markdown: ![alt](url) → <img src="url" alt="alt" />
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; display: block; margin: 10px 0; border-radius: 8px;" />');

    // Restaurar imagens HTML preservadas
    htmlImages.forEach((imgHtml, index) => {
      html = html.replace(`__HTML_IMAGE_${index}__`, imgHtml);
    });

    // Converter links: [texto](url) → <a href="url">texto</a>
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Converter negrito e itálico combinados: ***texto*** → <strong><em>texto</em></strong>
    html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');

    // Converter negrito: **texto** → <strong>texto</strong>
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Converter itálico: *texto* (mas não ***texto***)
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

    // Converter sublinhado: __texto__ → <u>texto</u>
    html = html.replace(/__([^_]+)__/g, '<u>$1</u>');

    // Processar quebras de linha conforme padrão do schema:
    // \n\n = parágrafo novo (<p>), \n = quebra de linha simples (<br>)
    // Primeiro, separar por quebras duplas (parágrafos)
    const paragraphs = html.split(/\n\s*\n/);
    let result = [];

    paragraphs.forEach((paragraph) => {
      if (paragraph.trim() === '') {
        // Parágrafo vazio = adicionar <p><br /></p> para preservar espaço
        result.push('<p><br /></p>');
      } else {
        // Processar quebras simples dentro do parágrafo
        const lines = paragraph.split('\n');
        const processedLines = lines
          .map(line => line.trim())
          .filter(line => line !== ''); // Remover linhas vazias
        
        if (processedLines.length > 0) {
          // Juntar linhas com <br /> dentro do mesmo parágrafo
          result.push(`<p>${processedLines.join('<br />')}</p>`);
        } else {
          // Se todas as linhas foram filtradas, adicionar parágrafo vazio
          result.push('<p><br /></p>');
        }
      }
    });

    html = result.join('');

    // Se não houver parágrafos, tratar como texto simples com quebras
    if (!html || html.trim() === '') {
      // Se tem quebras simples, converter para <br>
      if (markdown.includes('\n')) {
        const simpleLines = markdown.split('\n');
        const nonEmptyLines = simpleLines.filter(line => line.trim() !== '');
        if (nonEmptyLines.length > 0) {
          html = `<p>${nonEmptyLines.map(line => line.trim()).join('<br />')}</p>`;
        } else {
          html = '<p><br /></p>';
        }
      } else {
        html = markdown.trim() ? `<p>${markdown}</p>` : '<p><br /></p>';
      }
    }

    return html;
  } catch (error) {
    console.error('Erro ao converter Markdown para HTML:', error);
    return '';
  }
};

// Manter compatibilidade com código existente (caso ainda use)
export const slateToMarkdown = htmlToMarkdown;
export const markdownToSlate = markdownToHtml;
