// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
const express = require('express');
const router = express.Router();

// Simulação de dados (substituir por MongoDB real)
let botPerguntas = [];

// GET /api/bot-perguntas - Listar todas as perguntas do bot
router.get('/', (req, res) => {
  res.json({ success: true, data: botPerguntas });
});

// POST /api/bot-perguntas - Criar nova pergunta do bot
router.post('/', (req, res) => {
  try {
    const { topic, context, keywords, question, imageUrls } = req.body;
    
    if (!topic || !context || !question) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tópico, contexto e pergunta são obrigatórios' 
      });
    }

    const novaPergunta = {
      id: Date.now().toString(),
      topic,
      context,
      keywords: keywords || '',
      question,
      imageUrls: imageUrls ? imageUrls.split(',').map(url => url.trim()) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    botPerguntas.push(novaPergunta);

    res.status(201).json({ 
      success: true, 
      data: novaPergunta,
      message: 'Pergunta do bot configurada com sucesso'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// PUT /api/bot-perguntas/:id - Atualizar pergunta do bot
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { topic, context, keywords, question, imageUrls } = req.body;
    
    const perguntaIndex = botPerguntas.findIndex(item => item.id === id);
    
    if (perguntaIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pergunta não encontrada' 
      });
    }

    botPerguntas[perguntaIndex] = {
      ...botPerguntas[perguntaIndex],
      topic: topic || botPerguntas[perguntaIndex].topic,
      context: context || botPerguntas[perguntaIndex].context,
      keywords: keywords || botPerguntas[perguntaIndex].keywords,
      question: question || botPerguntas[perguntaIndex].question,
      imageUrls: imageUrls ? imageUrls.split(',').map(url => url.trim()) : botPerguntas[perguntaIndex].imageUrls,
      updatedAt: new Date().toISOString()
    };

    res.json({ 
      success: true, 
      data: botPerguntas[perguntaIndex],
      message: 'Pergunta do bot atualizada com sucesso'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/bot-perguntas/:id - Deletar pergunta do bot
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const perguntaIndex = botPerguntas.findIndex(item => item.id === id);
    
    if (perguntaIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pergunta não encontrada' 
      });
    }

    botPerguntas.splice(perguntaIndex, 1);

    res.json({ 
      success: true, 
      message: 'Pergunta do bot deletada com sucesso'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
