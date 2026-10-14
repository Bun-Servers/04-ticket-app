import indexHtml from '../public/index.html';
import { SERVER_CONFIG } from './config/server-config';
import { createQueueStateMessage, handleMessage } from './handlers/message.handler';
import type { ServerMessage, WebSocketData } from './types';
import { generateUuid } from './utils/generate-uuid';

const { port, defaultChannelName } = SERVER_CONFIG;

const toJson = (message: ServerMessage): string => JSON.stringify(message);

export const createServer = () =>
  Bun.serve<WebSocketData>({
    port,

    routes: {
      '/': indexHtml,
    },

    //* Cualquier otra petición se intenta convertir en una conexión WebSocket
    fetch(req, server) {
      const upgraded = server.upgrade(req, {
        data: { clientId: generateUuid() }, // Identifica a cada cliente
      });

      return upgraded ? undefined : new Response('Upgrade failed', { status: 500 });
    },

    websocket: {
      open(ws) {
        ws.subscribe(defaultChannelName);
        ws.send(toJson(createQueueStateMessage()));
      },

      message(ws, rawMessage: string) {
        const { personal, broadcast } = handleMessage(rawMessage);

        //! ws.publish envía a todos los suscriptores del canal EXCEPTO a este cliente,
        //! por eso el emisor recibe sus propias respuestas en `personal`
        personal.forEach((message) => ws.send(toJson(message)));
        broadcast.forEach((message) => ws.publish(defaultChannelName, toJson(message)));
      },

      close(ws) {
        ws.unsubscribe(defaultChannelName);
      },
    },
  });
