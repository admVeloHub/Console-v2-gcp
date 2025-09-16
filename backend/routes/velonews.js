// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
const express = require('express');
const router = express.Router();

// Simulação de dados (substituir por MongoDB real)
let velonews = [];

// GET /api/velonews - Listar todas as velonews
router.get('/', (req, res) => {
  res.json({ success: true, data: velonews });
});

// POST /api/velonews - Criar nova velonews
router.post('/', (req, res) => {
  try {
    const { title, content, isCritical } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Título e conteúdo são obrigatórios' 
      });
    }

    const novaVelonews = {
      id: Date.now().toString(),
      title,
      content,
      isCritical: isCritical || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    velonews.push(novaVelonews);

    res.status(201).json({ 
      success: true, 
      data: novaVelonews,
      message: 'Velonews publicada com sucesso'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// PUT /api/velonews/:id - Atualizar velonews
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isCritical } = req.body;
    
    const velonewsIndex = velonews.findIndex(item => item.id === id);
    
    if (velonewsIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Velonews não encontrada' 
      });
    }

    velonews[velonewsIndex] = {
      ...velonews[velonewsIndex],
      title: title || velonews[velonewsIndex].title,
      content: content || velonews[velonewsIndex].content,
      isCritical: isCritical !== undefined ? isCritical : velonews[velonewsIndex].isCritical,
      updatedAt: new Date().toISOString()
    };

    res.json({ 
      success: true, 
      data: velonews[velonewsIndex],
      message: 'Velonews atualizada com sucesso'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/velonews/:id - Deletar velonews
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const velonewsIndex = velonews.findIndex(item => item.id === id);
    
    if (velonewsIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Velonews não encontrada' 
      });
    }

    velonews.splice(velonewsIndex, 1);

    res.json({ 
      success: true, 
      message: 'Velonews deletada com sucesso'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
