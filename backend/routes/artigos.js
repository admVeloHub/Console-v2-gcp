// VERSION: v3.1.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
const express = require('express');
const router = express.Router();
const Artigos = require('../models/Artigos');

// GET /api/artigos - Listar todos os artigos
router.get('/', async (req, res) => {
  try {
    global.emitTraffic('Artigos', 'received', 'Entrada recebida - GET /api/artigos');
    global.emitLog('info', 'GET /api/artigos - Listando todos os artigos');
    
    const result = await Artigos.getAll();
    
    global.emitTraffic('Artigos', 'processing', 'Transmitindo para DB');
    global.emitJson(result);
    
    global.emitTraffic('Artigos', 'completed', 'Concluído - Artigos listados com sucesso');
    global.emitLog('success', `GET /api/artigos - ${result.count} artigos encontrados`);
    
    res.json(result);
  } catch (error) {
    global.emitTraffic('Artigos', 'error', 'Erro ao listar artigos');
    global.emitLog('error', `GET /api/artigos - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// POST /api/artigos - Criar novo artigo
router.post('/', async (req, res) => {
  try {
    global.emitTraffic('Artigos', 'received', 'Entrada recebida - POST /api/artigos');
    global.emitLog('info', 'POST /api/artigos - Criando novo artigo');
    global.emitJson(req.body);
    
    const { title, content, category, keywords } = req.body;
    
    if (!title || !content || !category) {
      global.emitTraffic('Artigos', 'error', 'Dados obrigatórios ausentes');
      global.emitLog('error', 'POST /api/artigos - Título, conteúdo e categoria são obrigatórios');
      return res.status(400).json({ 
        success: false, 
        error: 'Título, conteúdo e categoria são obrigatórios' 
      });
    }

    const artigoData = {
      title,
      content,
      category,
      keywords: keywords ? keywords.split(',').map(k => k.trim()) : []
    };

    global.emitTraffic('Artigos', 'processing', 'Transmitindo para DB');
    const result = await Artigos.create(artigoData);
    
    if (result.success) {
      global.emitTraffic('Artigos', 'completed', 'Concluído - Artigo criado com sucesso');
      global.emitLog('success', `POST /api/artigos - Artigo "${title}" criado com sucesso`);
      global.emitJson(result);
      res.status(201).json(result);
    } else {
      global.emitTraffic('Artigos', 'error', 'Erro ao criar artigo');
      global.emitLog('error', 'POST /api/artigos - Erro ao criar artigo');
      res.status(500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Artigos', 'error', 'Erro interno do servidor');
    global.emitLog('error', `POST /api/artigos - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// PUT /api/artigos/:id - Atualizar artigo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, keywords } = req.body;
    
    global.emitTraffic('Artigos', 'received', `Entrada recebida - PUT /api/artigos/${id}`);
    global.emitLog('info', `PUT /api/artigos/${id} - Atualizando artigo`);
    global.emitJson({ id, ...req.body });
    
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (keywords) updateData.keywords = keywords.split(',').map(k => k.trim());

    global.emitTraffic('Artigos', 'processing', 'Transmitindo para DB');
    const result = await Artigos.update(id, updateData);
    
    if (result.success) {
      global.emitTraffic('Artigos', 'completed', 'Concluído - Artigo atualizado com sucesso');
      global.emitLog('success', `PUT /api/artigos/${id} - Artigo atualizado com sucesso`);
      global.emitJson(result);
      res.json(result);
    } else {
      global.emitTraffic('Artigos', 'error', result.error);
      global.emitLog('error', `PUT /api/artigos/${id} - ${result.error}`);
      res.status(result.error === 'Artigo não encontrado' ? 404 : 500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Artigos', 'error', 'Erro interno do servidor');
    global.emitLog('error', `PUT /api/artigos/:id - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/artigos/:id - Deletar artigo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    global.emitTraffic('Artigos', 'received', `Entrada recebida - DELETE /api/artigos/${id}`);
    global.emitLog('info', `DELETE /api/artigos/${id} - Deletando artigo`);
    global.emitJson({ id });
    
    global.emitTraffic('Artigos', 'processing', 'Transmitindo para DB');
    const result = await Artigos.delete(id);
    
    if (result.success) {
      global.emitTraffic('Artigos', 'completed', 'Concluído - Artigo deletado com sucesso');
      global.emitLog('success', `DELETE /api/artigos/${id} - Artigo deletado com sucesso`);
      global.emitJson(result);
      res.json(result);
    } else {
      global.emitTraffic('Artigos', 'error', result.error);
      global.emitLog('error', `DELETE /api/artigos/${id} - ${result.error}`);
      res.status(result.error === 'Artigo não encontrado' ? 404 : 500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Artigos', 'error', 'Erro interno do servidor');
    global.emitLog('error', `DELETE /api/artigos/:id - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
