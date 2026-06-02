// VERSION: v1.0.0 | DATE: 2026-05-29 | AUTHOR: VeloHub Development Team

import { GOOGLE_CLIENT_ID } from '../config/google';
import { loadGoogleGsiScript } from './loadGoogleGsiScript';

const CALENDAR_READONLY_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

export async function requestGoogleCalendarAuthorizationCode() {
  await loadGoogleGsiScript();

  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Client ID do Google não configurado no Console');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: CALENDAR_READONLY_SCOPE,
        ux_mode: 'popup',
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }
          if (response.code) {
            resolve(response.code);
            return;
          }
          reject(new Error('Código de autorização não recebido'));
        },
      });
      client.requestCode();
    } catch (error) {
      reject(error);
    }
  });
}
