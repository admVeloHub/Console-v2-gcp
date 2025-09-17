// VERSION: v3.1.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

// Middleware para verificar se as funções de monitoramento estão disponíveis
const checkMonitoringFunctions = (req, res, next) => {
  // Se as funções globais não existirem, criar funções vazias para evitar erros
  if (!global.emitLog) {
    global.emitLog = () => {};
  }
  
  if (!global.emitTraffic) {
    global.emitTraffic = () => {};
  }
  
  if (!global.emitJson) {
    global.emitJson = () => {};
  }
  
  next();
};

module.exports = { checkMonitoringFunctions };
