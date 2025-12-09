// VERSION: v3.4.1 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Popover, MenuList, MenuItem, CircularProgress, Typography, Chip, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { htmlToMarkdown, markdownToHtml } from '../../utils/markdownConverter';
import { saveTemporaryImage } from '../../utils/imageStorage';

// Módulos do Quill declarados fora do componente para evitar re-criação
const createModules = (enableImageUpload, handleImageUpload, handleLink, handleVideo) => ({
  toolbar: {
    container: [
      ['bold', 'italic', 'underline'],
      ['link'],
      ...(enableImageUpload ? [['image']] : []),
      ['video'],
      ['clean']
    ],
    handlers: {
      link: handleLink,
      video: handleVideo,
      ...(enableImageUpload ? { image: handleImageUpload } : {})
    }
  },
  clipboard: {
    matchVisual: false
  }
});

const formats = ['bold', 'italic', 'underline', 'link', 'image', 'video'];

const MarkdownEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Digite seu texto...',
  enableImageUpload = false,
  rows = 6,
  pageId = 'default',
  onVideoChange,
  onVideoRemove,
  attachedVideos = [],
  ...props 
}) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [loadingVideoTitle, setLoadingVideoTitle] = useState(false);
  const [imageResizeAnchor, setImageResizeAnchor] = useState(null);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null); // Armazenar src em vez da referência direta
  const [currentPercentage, setCurrentPercentage] = useState(null); // Porcentagem atual selecionada
  const quillRef = useRef(null);
  const imageOriginalSizesRef = useRef(new Map()); // Armazenar tamanhos originais usando ref
  
  // Refs para rastrear valores e evitar loops
  const lastPropValueRef = useRef(value);
  const isUserTypingRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const debounceTimeoutRef = useRef(null);

  // Atualizar ref do onChange
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Estado interno - inicializado apenas uma vez
  const [internalHtmlValue, setInternalHtmlValue] = useState(() => {
    const initialValue = value && typeof value === 'string' && value.trim() !== '' ? value : '';
    lastPropValueRef.current = initialValue;
    return initialValue ? markdownToHtml(initialValue) : '';
  });

  // Sincronizar com prop value APENAS quando mudar externamente (carregamento de dados)
  useEffect(() => {
    const currentValue = value || '';
    
    // Se o usuário está digitando, ignorar completamente mudanças externas
    if (isUserTypingRef.current) {
      return;
    }

    // Se o valor mudou externamente (não por digitação), atualizar
    if (currentValue !== lastPropValueRef.current) {
      const newHtml = currentValue.trim() !== '' ? markdownToHtml(currentValue) : '';
      lastPropValueRef.current = currentValue;
      setInternalHtmlValue(newHtml);
    }
  }, [value]);

  // Handler para mudanças no editor
  const handleChange = useCallback((html, delta, source) => {
    // Ignorar mudanças que não vêm do usuário
    if (source !== 'user') {
      return;
    }

    // Marcar que o usuário está digitando
    isUserTypingRef.current = true;

    // Preservar estilos de imagens redimensionadas antes de atualizar
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const editorElement = quill.root;
      const images = editorElement.querySelectorAll('img');
      images.forEach(img => {
        const style = img.getAttribute('style');
        // Se a imagem tem estilo de width definido, preservar
        if (style && style.includes('width:')) {
          // Garantir que o estilo está no HTML
          const imgSrc = img.src || img.getAttribute('src');
          const imgAlt = img.getAttribute('alt') || '';
          const imgSrcEscaped = imgSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`<img([^>]*src=["']${imgSrcEscaped}["'][^>]*)>`, 'i');
          const match = html.match(regex);
          if (match && !match[0].includes('style=')) {
            // Adicionar estilo ao HTML se não estiver presente
            html = html.replace(regex, `<img src="${imgSrc}" alt="${imgAlt}" style="${style}" />`);
          }
        }
      });
    }

    // Atualizar estado interno imediatamente
    setInternalHtmlValue(html);

    // Converter para markdown
    const markdown = htmlToMarkdown(html);

    // DEBUG: Verificar se há imagens temporárias no markdown gerado
    const tempImageRegex = /!\[temp:([a-f0-9-]+)\]\(blob:[^)]+\)/g;
    const tempImages = [...markdown.matchAll(tempImageRegex)];
    if (tempImages.length > 0) {
      console.log(`🔍 [MarkdownEditor] Markdown gerado contém ${tempImages.length} imagem(ns) temporária(s):`, tempImages.map(m => m[0]));
    }

    // Debounce para evitar muitas chamadas ao onChange
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      // Atualizar ref do último valor
      lastPropValueRef.current = markdown;
      
      // Notificar componente pai
      if (onChangeRef.current) {
        onChangeRef.current(markdown);
      }

      // Resetar flag após um delay para permitir que o componente pai atualize
      setTimeout(() => {
        isUserTypingRef.current = false;
      }, 100);
    }, 150);
  }, []);

  // Handler para upload de imagem
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const uuid = uuidv4();
        const blobUrl = URL.createObjectURL(file);
        
        await saveTemporaryImage(file, uuid, blobUrl, pageId);

        const quill = quillRef.current?.getEditor();
        if (quill) {
          // Obter seleção atual ou usar o final do documento
          let range = quill.getSelection(true);
          if (!range) {
            const length = quill.getLength();
            range = { index: length - 1, length: 0 };
          }

          isUserTypingRef.current = true;

          // Inserir imagem diretamente via HTML com alt text e blob URL preservados
          const htmlToInsert = `<img src="${blobUrl}" alt="temp:${uuid}" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" />`;
          
          // Usar dangerouslyPasteHTML para inserir com atributos preservados
          quill.clipboard.dangerouslyPasteHTML(range.index, htmlToInsert, 'user');
          
          console.log(`✅ [handleImageUpload] Imagem inserida com alt="temp:${uuid}" e src="${blobUrl.substring(0, 50)}..."`);

          // Aguardar processamento e verificar se foi inserida corretamente
          setTimeout(() => {
            try {
              // Verificar se foi inserida corretamente
              const images = quill.root.querySelectorAll('img');
              const lastImage = images[images.length - 1];
              
              if (lastImage) {
                const imgSrc = lastImage.src || lastImage.getAttribute('src');
                const imgAlt = lastImage.getAttribute('alt');
                
                console.log(`🔍 [handleImageUpload] Verificação: src="${imgSrc?.substring(0, 80)}...", alt="${imgAlt}"`);
                
                // Garantir que os atributos estão corretos
                if (imgSrc !== blobUrl) {
                  lastImage.src = blobUrl;
                  console.log(`🔄 [handleImageUpload] Corrigido src para blob URL`);
                }
                if (imgAlt !== `temp:${uuid}`) {
                  lastImage.setAttribute('alt', `temp:${uuid}`);
                  console.log(`🔄 [handleImageUpload] Corrigido alt text para temp:${uuid}`);
                }
                
                // Armazenar tamanho original quando a imagem carregar
                const img = new Image();
                img.onload = () => {
                  const originalSize = {
                    width: img.naturalWidth || img.width || 800,
                    height: img.naturalHeight || img.height || 600
                  };
                  imageOriginalSizesRef.current.set(imgSrc, originalSize);
                  console.log(`💾 [handleImageUpload] Tamanho original armazenado: ${originalSize.width}x${originalSize.height}`);
                };
                img.src = blobUrl;
              }
              
              // Mover cursor após a imagem
              const newLength = quill.getLength();
              const newIndex = Math.min(range.index + 1, newLength - 1);
              if (newIndex >= 0 && newIndex < newLength) {
                quill.setSelection(newIndex, 0, 'user');
              }
            } catch (error) {
              console.warn('Erro ao processar imagem após inserção:', error);
            }
            
            setTimeout(() => {
              isUserTypingRef.current = false;
            }, 100);
          }, 100);
        }
      } catch (error) {
        console.error('Erro ao adicionar imagem:', error);
        alert('Erro ao adicionar imagem. Tente novamente.');
        isUserTypingRef.current = false;
      }
    };
  }, [pageId]);

  // Handler para link
  const handleLink = useCallback(() => {
    setLinkDialogOpen(true);
  }, []);

  const insertLink = useCallback(() => {
    if (linkUrl && linkText) {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection(true);
        if (range) {
          isUserTypingRef.current = true;
          quill.insertText(range.index, linkText, { link: linkUrl });
          quill.setSelection(range.index + linkText.length);
          setTimeout(() => {
            isUserTypingRef.current = false;
          }, 100);
        }
      }
      setLinkDialogOpen(false);
      setLinkUrl('');
      setLinkText('');
    }
  }, [linkUrl, linkText]);

  // Handler para vídeo do YouTube
  const handleVideo = useCallback(() => {
    setVideoDialogOpen(true);
  }, []);

  // Função para extrair ID do vídeo do YouTube
  const extractYouTubeVideoId = useCallback((url) => {
    const patterns = [
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]{11})/,
      /youtube\.com\/watch\?.*v=([^&\n?#]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }, []);

  // Função para buscar título do YouTube usando oEmbed
  const fetchYouTubeTitle = useCallback(async (url) => {
    try {
      setLoadingVideoTitle(true);
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const response = await fetch(oembedUrl);
      if (response.ok) {
        const data = await response.json();
        return data.title;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar título do YouTube:', error);
      return null;
    } finally {
      setLoadingVideoTitle(false);
    }
  }, []);

  // Função para carregar título do vídeo
  const handleLoadVideoTitle = useCallback(async () => {
    if (!videoUrl) {
      alert('Por favor, insira uma URL do YouTube');
      return;
    }
    
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      alert('URL do YouTube inválida');
      return;
    }
    
    const title = await fetchYouTubeTitle(videoUrl);
    if (title) {
      setVideoTitle(title);
    } else {
      alert('Não foi possível obter o título do vídeo');
    }
  }, [videoUrl, extractYouTubeVideoId, fetchYouTubeTitle]);

  // Função para salvar vídeo (chama callback em vez de inserir iframe)
  const saveVideo = useCallback(() => {
    if (!videoUrl) return;
    
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      alert('URL do YouTube inválida');
      return;
    }
    
    // Chamar callback para componente pai gerenciar o vídeo
    if (onVideoChange) {
      onVideoChange({
        url: videoUrl,
        videoId: videoId,
        title: videoTitle || 'Sem título'
      });
    }
    
    setVideoDialogOpen(false);
    setVideoUrl('');
    setVideoTitle('');
  }, [videoUrl, videoTitle, extractYouTubeVideoId, onVideoChange]);

  // Módulos memoizados
  const modules = useMemo(
    () => createModules(enableImageUpload, handleImageUpload, handleLink, handleVideo),
    [enableImageUpload, handleImageUpload, handleLink, handleVideo]
  );

  // Adicionar ícone customizado de vídeo na toolbar
  useEffect(() => {
    const addVideoIcon = () => {
      const toolbar = document.querySelector('.ql-toolbar');
      if (!toolbar) return;
      
      const videoButton = toolbar.querySelector('button.ql-video');
      if (!videoButton) return;
      
      // Verificar se já tem ícone customizado
      if (videoButton.querySelector('svg.ql-video-icon')) return;
      
      // Remover conteúdo padrão
      videoButton.innerHTML = '';
      
      // Criar SVG de vídeo (mesma natureza dos outros ícones)
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'ql-video-icon');
      svg.setAttribute('viewBox', '0 0 18 18');
      svg.setAttribute('width', '18');
      svg.setAttribute('height', '18');
      
      // Path do ícone de vídeo (play button)
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'ql-stroke');
      path.setAttribute('d', 'M3 3h12v12H3V3zm2 2v8l8-4-8-4z');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      
      svg.appendChild(path);
      videoButton.appendChild(svg);
    };
    
    // Executar múltiplas vezes para garantir
    addVideoIcon();
    const timeout1 = setTimeout(addVideoIcon, 50);
    const timeout2 = setTimeout(addVideoIcon, 100);
    const timeout3 = setTimeout(addVideoIcon, 300);
    const timeout4 = setTimeout(addVideoIcon, 500);
    
    // Observar mudanças na toolbar
    const observer = new MutationObserver(() => {
      addVideoIcon();
    });
    const toolbar = document.querySelector('.ql-toolbar');
    if (toolbar) {
      observer.observe(toolbar, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
      observer.disconnect();
    };
  }, [modules]);

  // Adicionar event listeners para imagens após montagem e armazenar tamanhos originais
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const editorElement = quill.root;
    
    // Função para armazenar tamanhos originais das imagens
    const storeOriginalSizes = () => {
      const images = editorElement.querySelectorAll('img');
      images.forEach(img => {
        const imgSrc = img.src || img.getAttribute('src');
        if (!imgSrc) return;
        
        // Se já tem tamanho armazenado, pular
        if (imageOriginalSizesRef.current.has(imgSrc)) return;
        
        if (img.complete && img.naturalWidth > 0) {
          // Imagem já carregada
          const originalSize = {
            width: img.naturalWidth || img.width || 800,
            height: img.naturalHeight || img.height || 600
          };
          imageOriginalSizesRef.current.set(imgSrc, originalSize);
        } else {
          // Aguardar imagem carregar
          img.onload = () => {
            const originalSize = {
              width: img.naturalWidth || img.width || 800,
              height: img.naturalHeight || img.height || 600
            };
            imageOriginalSizesRef.current.set(imgSrc, originalSize);
          };
        }
      });
    };
    
    // Armazenar tamanhos ao montar
    storeOriginalSizes();
    
    const handleImageClick = (e) => {
      // Verificar se o clique foi em uma imagem
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        e.stopPropagation();
        
        const img = e.target;
        
        // Garantir que tamanho original está armazenado
        const imgSrc = img.src || img.getAttribute('src');
        if (!imageOriginalSizesRef.current.has(imgSrc) && img.complete && img.naturalWidth > 0) {
          const originalSize = {
            width: img.naturalWidth || img.width || 800,
            height: img.naturalHeight || img.height || 600
          };
          imageOriginalSizesRef.current.set(imgSrc, originalSize);
        }
        
        setSelectedImageSrc(imgSrc);
        
        // Calcular porcentagem atual da imagem
        const originalSize = imageOriginalSizesRef.current.get(imgSrc) || {
          width: img.naturalWidth || img.width || 800,
          height: img.naturalHeight || img.height || 600
        };
        
        // Obter largura atual da imagem (do style ou do DOM)
        const currentWidth = img.style.width 
          ? parseInt(img.style.width.replace('px', ''))
          : (img.width || img.naturalWidth);
        
        // Calcular porcentagem atual (arredondar para a mais próxima: 25, 50, 100, 150)
        const calculatedPercentage = Math.round((currentWidth / originalSize.width) * 100);
        const closestPercentage = [25, 50, 100, 150].reduce((prev, curr) => 
          Math.abs(curr - calculatedPercentage) < Math.abs(prev - calculatedPercentage) ? curr : prev
        );
        setCurrentPercentage(closestPercentage);
        
        // CORREÇÃO: Criar objeto com getBoundingClientRect que sempre busca o elemento atual
        const rect = img.getBoundingClientRect();
        setImageResizeAnchor({
          getBoundingClientRect: () => {
            // Sempre buscar o elemento atual no DOM usando o src
            const currentImages = editorElement.querySelectorAll('img');
            const currentImg = Array.from(currentImages).find(i => 
              (i.src || i.getAttribute('src')) === imgSrc
            );
            if (currentImg) {
              return currentImg.getBoundingClientRect();
            }
            // Fallback para a posição original se não encontrar
            return rect;
          }
        });
      }
    };

    // Adicionar listener de clique nas imagens (usar capture para interceptar antes do Quill)
    editorElement.addEventListener('click', handleImageClick, true);
    
    // Observer para novas imagens adicionadas
    const observer = new MutationObserver(() => {
      storeOriginalSizes();
    });
    
    observer.observe(editorElement, {
      childList: true,
      subtree: true
    });

    return () => {
      editorElement.removeEventListener('click', handleImageClick, true);
      observer.disconnect();
    };
  }, [internalHtmlValue]);

  // Handler para redimensionar imagem
  const handleResizeImage = useCallback((percentage) => {
    if (!selectedImageSrc) return;

    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    try {
      isUserTypingRef.current = true;

      // Buscar a imagem atual no DOM usando o src
      const editorElement = quill.root;
      const images = editorElement.querySelectorAll('img');
      const selectedImage = Array.from(images).find(img => 
        (img.src || img.getAttribute('src')) === selectedImageSrc
      );
      
      if (!selectedImage) {
        console.warn('Imagem não encontrada no DOM');
        setImageResizeAnchor(null);
        setSelectedImageSrc(null);
        return;
      }

      // Obter src da imagem para buscar tamanho original
      const imgSrc = selectedImage.src || selectedImage.getAttribute('src');
      
      // Obter tamanho original armazenado ou usar naturalWidth como fallback
      const originalSize = imageOriginalSizesRef.current.get(imgSrc) || {
        width: selectedImage.naturalWidth || selectedImage.width || 800,
        height: selectedImage.naturalHeight || selectedImage.height || 600
      };
      
      // Se não tinha tamanho armazenado e a imagem está carregada, armazenar agora
      if (!imageOriginalSizesRef.current.has(imgSrc) && selectedImage.complete && selectedImage.naturalWidth > 0) {
        imageOriginalSizesRef.current.set(imgSrc, {
          width: selectedImage.naturalWidth,
          height: selectedImage.naturalHeight
        });
      }
      
      // Calcular nova largura baseada na porcentagem do tamanho original
      const newWidth = Math.round((originalSize.width * percentage) / 100);

      // Obter alt text para preservar
      const imgAlt = selectedImage.getAttribute('alt') || '';

      // Aplicar estilos diretamente no DOM (feedback visual imediato)
      selectedImage.style.width = `${newWidth}px`;
      selectedImage.style.height = 'auto';
      selectedImage.style.maxWidth = '100%';
      selectedImage.style.display = 'block';
      selectedImage.style.margin = '10px 0';
      selectedImage.style.borderRadius = '8px';

      // Atualizar o atributo style do elemento no HTML do Quill
      // Isso garante que os estilos sejam preservados quando o Quill sincronizar
      const currentStyle = selectedImage.getAttribute('style') || '';
      const newStyle = `width: ${newWidth}px; height: auto; max-width: 100%; display: block; margin: 10px 0; border-radius: 8px;`;
      selectedImage.setAttribute('style', newStyle);

      // NÃO atualizar o estado interno (setInternalHtmlValue) para evitar re-renderização
      // que pode fazer o Quill recriar elementos e perder a imagem
      // A imagem já está visível com os estilos aplicados diretamente no DOM
      
      // Aguardar um pouco e então notificar onChange com o HTML atualizado
      setTimeout(() => {
        // Verificar se a imagem ainda está no DOM
        const updatedImages = editorElement.querySelectorAll('img');
        const stillExists = Array.from(updatedImages).some(img => 
          (img.src || img.getAttribute('src')) === imgSrc
        );
        
        if (stillExists) {
          // Obter HTML atualizado do Quill (que já tem os estilos aplicados)
          const updatedHtml = quill.root.innerHTML;
          
          // Converter para markdown e notificar onChange
          // Mas NÃO atualizar setInternalHtmlValue para evitar re-renderização
          const markdown = htmlToMarkdown(updatedHtml);
          lastPropValueRef.current = markdown;
          
          if (onChangeRef.current) {
            onChangeRef.current(markdown);
          }
        } else {
          console.error('❌ Imagem foi perdida durante redimensionamento');
        }

        setTimeout(() => {
          isUserTypingRef.current = false;
        }, 100);
      }, 100);

      // Atualizar porcentagem atual
      setCurrentPercentage(percentage);
      
      // Fechar menu
      setImageResizeAnchor(null);
      setSelectedImageSrc(null);
    } catch (error) {
      console.error('Erro ao redimensionar imagem:', error);
      isUserTypingRef.current = false;
    }
  }, [selectedImageSrc]);

  // Remover ícone de câmera do botão de imagem após renderização
  useEffect(() => {
    if (!enableImageUpload) return;
    
    const removeCameraIcon = () => {
      const toolbar = document.querySelector('.ql-toolbar');
      if (!toolbar) return;
      
      const imageButton = toolbar.querySelector('button.ql-image');
      if (!imageButton) return;
      
      const svg = imageButton.querySelector('svg');
      if (!svg) return;
      
      const paths = Array.from(svg.querySelectorAll('path'));
      
      // REMOVER COMPLETAMENTE O PRIMEIRO PATH DO DOM - SEM OCULTAÇÃO, APENAS DELETE
      if (paths.length > 0) {
        paths[0].remove();
      }
      
      // Adicionar CSS global para garantir remoção
      const styleId = 'remove-camera-icon-style';
      let existingStyle = document.getElementById(styleId);
      if (!existingStyle) {
        existingStyle = document.createElement('style');
        existingStyle.id = styleId;
        document.head.appendChild(existingStyle);
      }
      existingStyle.textContent = `
        /* REMOVER COMPLETAMENTE O PRIMEIRO PATH - CSS APENAS COMO BACKUP */
        button.ql-image svg path:first-child {
          display: none !important;
        }
      `;
    };
    
    // Executar múltiplas vezes para garantir
    removeCameraIcon();
    const timeout1 = setTimeout(removeCameraIcon, 50);
    const timeout2 = setTimeout(removeCameraIcon, 100);
    const timeout3 = setTimeout(removeCameraIcon, 300);
    const timeout4 = setTimeout(removeCameraIcon, 500);
    
    // Observar mudanças na toolbar continuamente
    const observer = new MutationObserver(() => {
      removeCameraIcon();
    });
    const toolbar = document.querySelector('.ql-toolbar');
    if (toolbar) {
      observer.observe(toolbar, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
      observer.disconnect();
    };
  }, [enableImageUpload, modules]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        {attachedVideos && attachedVideos.length > 0 && attachedVideos.map((video, index) => (
          <Chip
            key={index}
            label={video.title || `Vídeo ${index + 1}`}
            size="small"
            onDelete={() => {
              if (onVideoRemove) {
                onVideoRemove(index);
              }
            }}
            deleteIcon={
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onVideoRemove) {
                    onVideoRemove(index);
                  }
                }}
                sx={{
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <Close sx={{ fontSize: '16px' }} />
              </IconButton>
            }
            sx={{
              fontFamily: 'Poppins',
              fontSize: '0.75rem',
              backgroundColor: 'var(--blue-medium)',
              color: '#fff',
              '& .MuiChip-label': {
                padding: '0 8px',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              },
              '& .MuiChip-deleteIcon': {
                color: '#fff',
                '&:hover': {
                  color: '#fff'
                }
              }
            }}
          />
        ))}
      </Box>
      <Box
        sx={{
          '& .ql-container': {
            fontFamily: 'Poppins',
            fontSize: '0.8rem',
            minHeight: `${rows * 24}px`,
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            backgroundColor: 'var(--cor-container)',
          },
          '& .ql-editor': {
            minHeight: `${rows * 24}px`,
            fontFamily: 'Poppins',
            fontSize: '0.8rem',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            '&.ql-blank::before': {
              fontStyle: 'normal',
              color: 'rgba(0, 0, 0, 0.38)',
              fontFamily: 'Poppins',
            },
            '& p': {
              margin: '0 0 0.5em 0',
              minHeight: '1.2em',
              '&:last-child': {
                marginBottom: 0
              },
              '&:empty': {
                minHeight: '1.2em',
                display: 'block'
              }
            },
            '& br': {
              display: 'block',
              content: '""',
              marginBottom: '0.5em',
              lineHeight: '1.2em'
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              margin: '10px 0',
              borderRadius: '8px',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              }
            },
            '& *': {
              whiteSpace: 'pre-wrap'
            }
          },
          '& .ql-toolbar': {
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            backgroundColor: 'var(--cor-container)',
            '& .ql-stroke': {
              stroke: 'rgba(0, 0, 0, 0.54)',
            },
            '& .ql-fill': {
              fill: 'rgba(0, 0, 0, 0.54)',
            },
            '& .ql-picker-label': {
              color: 'rgba(0, 0, 0, 0.54)',
            },
            '& button:hover, & .ql-picker-label:hover': {
              color: 'var(--blue-medium)',
              '& .ql-stroke': {
                stroke: 'var(--blue-medium)',
              },
              '& .ql-fill': {
                fill: 'var(--blue-medium)',
              },
            },
            '& button.ql-image': {
              // CSS apenas como backup - o JavaScript remove o primeiro path do DOM
              '& svg path:first-child': {
                display: 'none !important'
              }
            },
            '& button.ql-video': {
              '& svg.ql-video-icon': {
                width: '18px',
                height: '18px',
                '& .ql-stroke': {
                  stroke: 'rgba(0, 0, 0, 0.54)',
                  strokeWidth: '1.5'
                }
              },
              '&:hover svg.ql-video-icon .ql-stroke': {
                stroke: 'var(--blue-medium)'
              }
            },
            '& button.ql-active': {
              color: 'var(--blue-medium)',
              '& .ql-stroke': {
                stroke: 'var(--blue-medium)',
              },
              '& .ql-fill': {
                fill: 'var(--blue-medium)',
              },
            }
          },
          '& .ql-container.ql-snow': {
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderTop: 'none',
            '&:hover': {
              borderColor: 'var(--blue-medium)',
            },
            '&.ql-focused': {
              borderColor: 'var(--blue-medium)',
              borderWidth: '2px',
            }
          },
          '& .ql-toolbar.ql-snow': {
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderBottom: 'none',
          }
        }}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={internalHtmlValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          preserveWhitespace={true}
          {...props}
        />
      </Box>

      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontSize: '0.96rem' }}>
          Inserir Link
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Texto do Link"
            fullWidth
            variant="outlined"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            sx={{ mb: 2, fontFamily: 'Poppins' }}
          />
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            variant="outlined"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://exemplo.com"
            sx={{ fontFamily: 'Poppins' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)} sx={{ fontFamily: 'Poppins' }}>
            Cancelar
          </Button>
          <Button 
            onClick={insertLink} 
            variant="contained"
            sx={{ 
              fontFamily: 'Poppins',
              backgroundColor: 'var(--blue-medium)',
              '&:hover': { backgroundColor: 'var(--blue-dark)' }
            }}
          >
            Inserir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={videoDialogOpen} onClose={() => {
        setVideoDialogOpen(false);
        setVideoUrl('');
        setVideoTitle('');
      }}>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontSize: '0.96rem' }}>
          Inserir Vídeo do YouTube
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL do YouTube"
            fullWidth
            variant="outlined"
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value);
              setVideoTitle(''); // Limpar título quando URL mudar
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            sx={{ mb: 2, fontFamily: 'Poppins' }}
          />
          {loadingVideoTitle && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CircularProgress size={20} />
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                Buscando título do vídeo...
              </Typography>
            </Box>
          )}
          {videoTitle && !loadingVideoTitle && (
            <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'rgba(0, 0, 0, 0.04)', borderRadius: '4px' }}>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)', mb: 0.5 }}>
                Título do vídeo:
              </Typography>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.875rem', fontWeight: 500 }}>
                {videoTitle}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setVideoDialogOpen(false);
            setVideoUrl('');
            setVideoTitle('');
          }} sx={{ fontFamily: 'Poppins' }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleLoadVideoTitle}
            variant="outlined"
            disabled={!videoUrl || loadingVideoTitle}
            sx={{ 
              fontFamily: 'Poppins',
              borderColor: 'var(--blue-medium)',
              color: 'var(--blue-medium)',
              '&:hover': { 
                borderColor: 'var(--blue-dark)',
                backgroundColor: 'rgba(0, 106, 185, 0.04)'
              }
            }}
          >
            Carregar
          </Button>
          <Button 
            onClick={saveVideo} 
            variant="contained"
            disabled={!videoUrl || loadingVideoTitle}
            sx={{ 
              fontFamily: 'Poppins',
              backgroundColor: 'var(--blue-medium)',
              '&:hover': { backgroundColor: 'var(--blue-dark)' }
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Popover
        open={Boolean(imageResizeAnchor)}
        anchorEl={imageResizeAnchor}
        onClose={() => {
          setImageResizeAnchor(null);
          setSelectedImageSrc(null);
          setCurrentPercentage(null);
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '120px'
          }
        }}
      >
        <MenuList sx={{ py: 0.5 }}>
          <MenuItem 
            onClick={() => handleResizeImage(25)}
            sx={{ 
              fontFamily: 'Poppins', 
              fontSize: '0.875rem',
              backgroundColor: currentPercentage === 25 ? '#006AB9' : 'transparent',
              color: currentPercentage === 25 ? '#F3F7FC' : 'inherit',
              '&:hover': {
                backgroundColor: currentPercentage === 25 ? '#006AB9' : 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            25%
          </MenuItem>
          <MenuItem 
            onClick={() => handleResizeImage(50)}
            sx={{ 
              fontFamily: 'Poppins', 
              fontSize: '0.875rem',
              backgroundColor: currentPercentage === 50 ? '#006AB9' : 'transparent',
              color: currentPercentage === 50 ? '#F3F7FC' : 'inherit',
              '&:hover': {
                backgroundColor: currentPercentage === 50 ? '#006AB9' : 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            50%
          </MenuItem>
          <MenuItem 
            onClick={() => handleResizeImage(100)}
            sx={{ 
              fontFamily: 'Poppins', 
              fontSize: '0.875rem',
              backgroundColor: currentPercentage === 100 ? '#006AB9' : 'transparent',
              color: currentPercentage === 100 ? '#F3F7FC' : 'inherit',
              '&:hover': {
                backgroundColor: currentPercentage === 100 ? '#006AB9' : 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            100%
          </MenuItem>
          <MenuItem 
            onClick={() => handleResizeImage(150)}
            sx={{ 
              fontFamily: 'Poppins', 
              fontSize: '0.875rem',
              backgroundColor: currentPercentage === 150 ? '#006AB9' : 'transparent',
              color: currentPercentage === 150 ? '#F3F7FC' : 'inherit',
              '&:hover': {
                backgroundColor: currentPercentage === 150 ? '#006AB9' : 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            150%
          </MenuItem>
        </MenuList>
      </Popover>
    </Box>
  );
};

export default MarkdownEditor;
