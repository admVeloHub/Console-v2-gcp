// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
const express = require('express');
const router = express.Router();
const Artigos = require('../models/Artigos');

// GET /api/artigos - Listar todos os artigos
router.get('/', async (req, res) => {
  try {
    const result = await Artigos.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// POST /api/artigos - Criar novo artigo
router.post('/', async (req, res) => {
  try {
    const { title, content, category, keywords } = req.body;
    
    if (!title || !content || !category) {
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

    const result = await Artigos.create(artigoData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
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
    
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (keywords) updateData.keywords = keywords.split(',').map(k => k.trim());

    const result = await Artigos.update(id, updateData);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.error === 'Artigo não encontrado' ? 404 : 500).json(result);
    }
  } catch (error) {
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
    
    const result = await Artigos.delete(id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.error === 'Artigo não encontrado' ? 404 : 500).json(result);
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
