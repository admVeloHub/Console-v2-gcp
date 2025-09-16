// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
const { getDatabase } = require('../config/database');

class BotPerguntas {
  constructor() {
    this.collectionName = 'bot_perguntas';
  }

  // Obter coleção
  getCollection() {
    const db = getDatabase();
    return db.collection(this.collectionName);
  }

  // Criar nova pergunta do bot
  async create(perguntaData) {
    try {
      const collection = this.getCollection();
      const pergunta = {
        ...perguntaData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(pergunta);
      return {
        success: true,
        data: { ...pergunta, _id: result.insertedId },
        message: 'Pergunta do bot configurada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar pergunta do bot:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  // Listar todas as perguntas
  async getAll() {
    try {
      const collection = this.getCollection();
      const perguntas = await collection.find({}).sort({ createdAt: -1 }).toArray();
      
      return {
        success: true,
        data: perguntas,
        count: perguntas.length
      };
    } catch (error) {
      console.error('Erro ao listar perguntas:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  // Obter pergunta por ID
  async getById(id) {
    try {
      const collection = this.getCollection();
      const { ObjectId } = require('mongodb');
      const pergunta = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!pergunta) {
        return {
          success: false,
          error: 'Pergunta não encontrada'
        };
      }

      return {
        success: true,
        data: pergunta
      };
    } catch (error) {
      console.error('Erro ao obter pergunta:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  // Atualizar pergunta
  async update(id, updateData) {
    try {
      const collection = this.getCollection();
      const { ObjectId } = require('mongodb');
      
      const updateDoc = {
        ...updateData,
        updatedAt: new Date()
      };

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateDoc }
      );

      if (result.matchedCount === 0) {
        return {
          success: false,
          error: 'Pergunta não encontrada'
        };
      }

      return {
        success: true,
        message: 'Pergunta atualizada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar pergunta:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  // Deletar pergunta
  async delete(id) {
    try {
      const collection = this.getCollection();
      const { ObjectId } = require('mongodb');
      
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return {
          success: false,
          error: 'Pergunta não encontrada'
        };
      }

      return {
        success: true,
        message: 'Pergunta deletada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao deletar pergunta:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  // Contar perguntas
  async count() {
    try {
      const collection = this.getCollection();
      const count = await collection.countDocuments();
      
      return {
        success: true,
        count
      };
    } catch (error) {
      console.error('Erro ao contar perguntas:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  // Buscar por tópico
  async getByTopic(topic) {
    try {
      const collection = this.getCollection();
      const perguntas = await collection.find({ topic: topic }).sort({ createdAt: -1 }).toArray();
      
      return {
        success: true,
        data: perguntas,
        count: perguntas.length
      };
    } catch (error) {
      console.error('Erro ao buscar perguntas por tópico:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
}

module.exports = new BotPerguntas();
