// VERSION: v1.1.0 | DATE: 2026-04-23 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.1.0 - Extensão .cjs (package "type":"module"); bootstrap FONTE DA VERDADE antes do resto
require('../config/loadFonteVerdadeEnv.cjs').loadFrom(__dirname);

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const upload = require('./upload.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadMiddleware = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limite
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use CSV ou Excel.'));
    }
  }
});

// Rota de upload e processamento
app.post('/api/upload', uploadMiddleware.single('file'), async (req, res) => {
  try {
    console.log('📁 Arquivo recebido:', req.file.originalname);
    
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Nenhum arquivo enviado' 
      });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();
    
    console.log('🔍 Processando arquivo:', filePath);
    
    // Processar arquivo
    const result = await upload.processFile(filePath, fileType);
    
    // Limpar arquivo temporário
    fs.unlinkSync(filePath);
    
    console.log('✅ Processamento concluído:', result.rows.length, 'linhas válidas');
    
    res.json({
      success: true,
      data: result.rows,
      errors: result.errors,
      totalRows: result.totalRows,
      validRows: result.rows.length,
      errorCount: result.errors.length
    });
    
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    
    // Limpar arquivo temporário em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Erro no processamento do arquivo',
      message: error.message,
      details: error.stack
    });
  }
});

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota de informações
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Velodados API',
    version: '1.0.0',
    description: 'API para processamento de dados de call center',
    endpoints: {
      upload: 'POST /api/upload',
      health: 'GET /api/health'
    },
    supportedFormats: ['CSV', 'XLSX', 'XLS'],
    maxFileSize: '100MB'
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Arquivo muito grande',
        message: 'Tamanho máximo permitido: 100MB'
      });
    }
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: error.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Velodados API iniciada!');
  console.log(`📡 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('📋 Endpoints disponíveis:');
  console.log('  - POST /api/upload - Upload e processamento de arquivos');
  console.log('  - GET /api/health - Status da API');
  console.log('  - GET /api/info - Informações da API');
});

module.exports = app;
