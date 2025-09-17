// VERSION: v3.1.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
const express = require('express');
const router = express.Router();
const Velonews = require('../models/Velonews');

// GET /api/velonews - Listar todas as velonews
router.get('/', async (req, res) => {
  try {
    global.emitTraffic('Velonews', 'received', 'Entrada recebida - GET /api/velonews');
    global.emitLog('info', 'GET /api/velonews - Listando todas as velonews');
    
    const result = await Velonews.getAll();
    
    global.emitTraffic('Velonews', 'processing', 'Transmitindo para DB');
    global.emitJson(result);
    
    global.emitTraffic('Velonews', 'completed', 'Concluído - Velonews listadas com sucesso');
    global.emitLog('success', `GET /api/velonews - ${result.count} velonews encontradas`);
    
    res.json(result);
  } catch (error) {
    global.emitTraffic('Velonews', 'error', 'Erro ao listar velonews');
    global.emitLog('error', `GET /api/velonews - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// POST /api/velonews - Criar nova velonews
router.post('/', async (req, res) => {
  try {
    global.emitTraffic('Velonews', 'received', 'Entrada recebida - POST /api/velonews');
    global.emitLog('info', 'POST /api/velonews - Criando nova velonews');
    global.emitJson(req.body);
    
    const { title, content, isCritical } = req.body;
    
    if (!title || !content) {
      global.emitTraffic('Velonews', 'error', 'Dados obrigatórios ausentes');
      global.emitLog('error', 'POST /api/velonews - Título e conteúdo são obrigatórios');
      return res.status(400).json({ 
        success: false, 
        error: 'Título e conteúdo são obrigatórios' 
      });
    }

    const velonewsData = {
      title,
      content,
      isCritical: isCritical || false
    };

    global.emitTraffic('Velonews', 'processing', 'Transmitindo para DB');
    const result = await Velonews.create(velonewsData);
    
    if (result.success) {
      global.emitTraffic('Velonews', 'completed', 'Concluído - Velonews criada com sucesso');
      global.emitLog('success', `POST /api/velonews - Velonews "${title}" criada com sucesso`);
      global.emitJson(result);
      res.status(201).json(result);
    } else {
      global.emitTraffic('Velonews', 'error', 'Erro ao criar velonews');
      global.emitLog('error', 'POST /api/velonews - Erro ao criar velonews');
      res.status(500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Velonews', 'error', 'Erro interno do servidor');
    global.emitLog('error', `POST /api/velonews - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// PUT /api/velonews/:id - Atualizar velonews
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isCritical } = req.body;
    
    global.emitTraffic('Velonews', 'received', `Entrada recebida - PUT /api/velonews/${id}`);
    global.emitLog('info', `PUT /api/velonews/${id} - Atualizando velonews`);
    global.emitJson({ id, ...req.body });
    
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (isCritical !== undefined) updateData.isCritical = isCritical;

    global.emitTraffic('Velonews', 'processing', 'Transmitindo para DB');
    const result = await Velonews.update(id, updateData);
    
    if (result.success) {
      global.emitTraffic('Velonews', 'completed', 'Concluído - Velonews atualizada com sucesso');
      global.emitLog('success', `PUT /api/velonews/${id} - Velonews atualizada com sucesso`);
      global.emitJson(result);
      res.json(result);
    } else {
      global.emitTraffic('Velonews', 'error', result.error);
      global.emitLog('error', `PUT /api/velonews/${id} - ${result.error}`);
      res.status(result.error === 'Velonews não encontrada' ? 404 : 500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Velonews', 'error', 'Erro interno do servidor');
    global.emitLog('error', `PUT /api/velonews/:id - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/velonews/:id - Deletar velonews
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    global.emitTraffic('Velonews', 'received', `Entrada recebida - DELETE /api/velonews/${id}`);
    global.emitLog('info', `DELETE /api/velonews/${id} - Deletando velonews`);
    global.emitJson({ id });
    
    global.emitTraffic('Velonews', 'processing', 'Transmitindo para DB');
    const result = await Velonews.delete(id);
    
    if (result.success) {
      global.emitTraffic('Velonews', 'completed', 'Concluído - Velonews deletada com sucesso');
      global.emitLog('success', `DELETE /api/velonews/${id} - Velonews deletada com sucesso`);
      global.emitJson(result);
      res.json(result);
    } else {
      global.emitTraffic('Velonews', 'error', result.error);
      global.emitLog('error', `DELETE /api/velonews/${id} - ${result.error}`);
      res.status(result.error === 'Velonews não encontrada' ? 404 : 500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Velonews', 'error', 'Erro interno do servidor');
    global.emitLog('error', `DELETE /api/velonews/:id - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
