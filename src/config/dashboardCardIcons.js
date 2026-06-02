// VERSION: v1.0.3 | DATE: 2026-06-01 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.0.3 - Card Corporativo: ícone bemvindoOuro.png
// CHANGELOG: v1.0.2 - Hub Gestão e Qualidade: ícone gerenciar.png
// CHANGELOG: v1.0.1 - Arquivos em public/icons só com ASCII/hífen (evita 404 com espaços/acento em alguns hosts)
// CHANGELOG: v1.0.0 - Mapa inicial dos PNG do dashboard e do hub Gestão e Qualidade

const publicBase = process.env.PUBLIC_URL || '';

/** @param {string} filename Nome do arquivo em public/icons (ASCII recomendado) */
export const dashboardIconUrl = (filename) => {
  const slash = publicBase.endsWith('/') ? '' : '/';
  const base = publicBase ? `${publicBase}${slash}` : '/';
  return `${base}icons/${filename}`;
};

/** Por chave de permissão do card do dashboard (DashboardPage) */
export const dashboardCardIconByPermission = {
  artigos: dashboardIconUrl('artigos.png'),
  velonews: dashboardIconUrl('news.png'),
  botPerguntas: dashboardIconUrl('velobot.png'),
  servicos: dashboardIconUrl('servicos.png'),
  academy: dashboardIconUrl('academy.png'),
  hubAnalises: dashboardIconUrl('hub-analises.png'),
  botAnalises: dashboardIconUrl('bot-analises.png'),
  capacity: dashboardIconUrl('capacity.png'),
  qualidade: dashboardIconUrl('gestao-e-qualidade.png'),
  corporativo: dashboardIconUrl('bemvindoOuro.png'),
  chamadosInternos: dashboardIconUrl('chamados-internos.png'),
  config: dashboardIconUrl('config.png'),
};

/** Cards em QualidadePage (moduleId em handleModuleClick) */
export const qualidadeHubIconByModuleId = {
  funcionarios: dashboardIconUrl('funcionarios.png'),
  qualidade: dashboardIconUrl('qa-e-monitoria.png'),
  gerenciar: dashboardIconUrl('gerenciar.png'),
};

export const corporativoHubIconByModuleId = {
  legal: dashboardIconUrl('corporativo.png'),
  comunicacao: dashboardIconUrl('corporativo.png'),
};
