// VERSION: v1.0.0 | DATE: 2026-06-01 | AUTHOR: VeloHub Development Team
import api from './api';

export const corporativoLegalAPI = {
  getRegistry: () => api.get('/corporativo/legal/documentos/registry').then((r) => r.data),
  getVersoes: (documentId) =>
    api.get(`/corporativo/legal/documentos/${documentId}/versoes`).then((r) => r.data),
  getVersao: (documentId, versaoId) =>
    api.get(`/corporativo/legal/documentos/${documentId}/${versaoId}`).then((r) => r.data),
  previewDocx: (documentId, file) => {
    const form = new FormData();
    form.append('docx', file);
    return api
      .post(`/corporativo/legal/documentos/${documentId}/preview-docx`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  createVersao: (documentId, payload) =>
    api.post(`/corporativo/legal/documentos/${documentId}/versoes`, payload).then((r) => r.data),
  updateSecao: (documentId, versaoId, field, index, payload) =>
    api
      .put(`/corporativo/legal/documentos/${documentId}/${versaoId}/secoes/${field}/${index}`, payload)
      .then((r) => r.data),
  addSecao: (documentId, versaoId, field, payload) =>
    api
      .post(`/corporativo/legal/documentos/${documentId}/${versaoId}/secoes/${field}`, payload)
      .then((r) => r.data),
  deleteSecao: (documentId, versaoId, field, index) =>
    api
      .delete(`/corporativo/legal/documentos/${documentId}/${versaoId}/secoes/${field}/${index}`)
      .then((r) => r.data),
  deleteVersao: (documentId, versaoId) =>
    api.delete(`/corporativo/legal/documentos/${documentId}/${versaoId}`).then((r) => r.data),
  getCienciaPorDocumento: () =>
    api.get('/corporativo/legal/ciencia-por-documento').then((r) => r.data),
};

export const corporativoBannerAPI = {
  get: () => api.get('/corporativo/banner').then((r) => r.data),
  save: (bannerImg) => api.put('/corporativo/banner', { bannerImg }).then((r) => r.data),
  listBucketImages: () => api.get('/uploads/home-destaques-list').then((r) => r.data),
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api
      .post('/uploads/home-destaques', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
};

export const corporativoAvisosAPI = {
  getAll: () => api.get('/corporativo/avisos').then((r) => r.data),
  getById: (id) => api.get(`/corporativo/avisos/${id}`).then((r) => r.data),
  create: (payload) => api.post('/corporativo/avisos', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/corporativo/avisos/${id}`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/corporativo/avisos/${id}`).then((r) => r.data),
};

export const corporativoAgendaAPI = {
  getAll: () => api.get('/corporativo/agenda').then((r) => r.data),
  getById: (id) => api.get(`/corporativo/agenda/${id}`).then((r) => r.data),
  create: (payload) => api.post('/corporativo/agenda', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/corporativo/agenda/${id}`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/corporativo/agenda/${id}`).then((r) => r.data),
};
