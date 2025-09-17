// VERSION: v3.1.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
const express = require('express');
const router = express.Router();
const BotPerguntas = require('../models/BotPerguntas');

// GET /api/bot-perguntas - Listar todas as perguntas do bot
router.get('/', async (req, res) => {
  try {
    global.emitTraffic('Bot Perguntas', 'received', 'Entrada recebida - GET /api/bot-perguntas');
    global.emitLog('info', 'GET /api/bot-perguntas - Listando todas as perguntas do bot');
    
    const result = await BotPerguntas.getAll();
    
    global.emitTraffic('Bot Perguntas', 'processing', 'Transmitindo para DB');
    global.emitJson(result);
    
    global.emitTraffic('Bot Perguntas', 'completed', 'Concluído - Perguntas listadas com sucesso');
    global.emitLog('success', `GET /api/bot-perguntas - ${result.count} perguntas encontradas`);
    
    res.json(result);
  } catch (error) {
    global.emitTraffic('Bot Perguntas', 'error', 'Erro ao listar perguntas');
    global.emitLog('error', `GET /api/bot-perguntas - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// POST /api/bot-perguntas - Criar nova pergunta do bot
router.post('/', async (req, res) => {
  try {
    global.emitTraffic('Bot Perguntas', 'received', 'Entrada recebida - POST /api/bot-perguntas');
    global.emitLog('info', 'POST /api/bot-perguntas - Criando nova pergunta do bot');
    global.emitJson(req.body);
    
    const { topic, context, keywords, question, imageUrls } = req.body;
    
    if (!topic || !context || !question) {
      global.emitTraffic('Bot Perguntas', 'error', 'Dados obrigatórios ausentes');
      global.emitLog('error', 'POST /api/bot-perguntas - Tópico, contexto e pergunta são obrigatórios');
      return res.status(400).json({ 
        success: false, 
        error: 'Tópico, contexto e pergunta são obrigatórios' 
      });
    }

    const perguntaData = {
      topic,
      context,
      keywords: keywords || '',
      question,
      imageUrls: imageUrls ? imageUrls.split(',').map(url => url.trim()) : []
    };

    global.emitTraffic('Bot Perguntas', 'processing', 'Transmitindo para DB');
    const result = await BotPerguntas.create(perguntaData);
    
    if (result.success) {
      global.emitTraffic('Bot Perguntas', 'completed', 'Concluído - Pergunta criada com sucesso');
      global.emitLog('success', `POST /api/bot-perguntas - Pergunta "${topic}" criada com sucesso`);
      global.emitJson(result);
      res.status(201).json(result);
    } else {
      global.emitTraffic('Bot Perguntas', 'error', 'Erro ao criar pergunta');
      global.emitLog('error', 'POST /api/bot-perguntas - Erro ao criar pergunta');
      res.status(500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Bot Perguntas', 'error', 'Erro interno do servidor');
    global.emitLog('error', `POST /api/bot-perguntas - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// PUT /api/bot-perguntas/:id - Atualizar pergunta do bot
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, context, keywords, question, imageUrls } = req.body;
    
    global.emitTraffic('Bot Perguntas', 'received', `Entrada recebida - PUT /api/bot-perguntas/${id}`);
    global.emitLog('info', `PUT /api/bot-perguntas/${id} - Atualizando pergunta do bot`);
    global.emitJson({ id, ...req.body });
    
    const updateData = {};
    if (topic) updateData.topic = topic;
    if (context) updateData.context = context;
    if (keywords !== undefined) updateData.keywords = keywords;
    if (question) updateData.question = question;
    if (imageUrls) updateData.imageUrls = imageUrls.split(',').map(url => url.trim());

    global.emitTraffic('Bot Perguntas', 'processing', 'Transmitindo para DB');
    const result = await BotPerguntas.update(id, updateData);
    
    if (result.success) {
      global.emitTraffic('Bot Perguntas', 'completed', 'Concluído - Pergunta atualizada com sucesso');
      global.emitLog('success', `PUT /api/bot-perguntas/${id} - Pergunta atualizada com sucesso`);
      global.emitJson(result);
      res.json(result);
    } else {
      global.emitTraffic('Bot Perguntas', 'error', result.error);
      global.emitLog('error', `PUT /api/bot-perguntas/${id} - ${result.error}`);
      res.status(result.error === 'Pergunta não encontrada' ? 404 : 500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Bot Perguntas', 'error', 'Erro interno do servidor');
    global.emitLog('error', `PUT /api/bot-perguntas/:id - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/bot-perguntas/:id - Deletar pergunta do bot
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    global.emitTraffic('Bot Perguntas', 'received', `Entrada recebida - DELETE /api/bot-perguntas/${id}`);
    global.emitLog('info', `DELETE /api/bot-perguntas/${id} - Deletando pergunta do bot`);
    global.emitJson({ id });
    
    global.emitTraffic('Bot Perguntas', 'processing', 'Transmitindo para DB');
    const result = await BotPerguntas.delete(id);
    
    if (result.success) {
      global.emitTraffic('Bot Perguntas', 'completed', 'Concluído - Pergunta deletada com sucesso');
      global.emitLog('success', `DELETE /api/bot-perguntas/${id} - Pergunta deletada com sucesso`);
      global.emitJson(result);
      res.json(result);
    } else {
      global.emitTraffic('Bot Perguntas', 'error', result.error);
      global.emitLog('error', `DELETE /api/bot-perguntas/${id} - ${result.error}`);
      res.status(result.error === 'Pergunta não encontrada' ? 404 : 500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Bot Perguntas', 'error', 'Erro interno do servidor');
    global.emitLog('error', `DELETE /api/bot-perguntas/:id - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
