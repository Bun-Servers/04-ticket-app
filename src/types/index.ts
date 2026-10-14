import type { QueueMessageState } from './queue-message-state';
import type { Ticket } from './ticket.interface';

//! Mensajes que recibe el servidor (se infieren del schema de validación)
export type { ClientMessage } from '../schemas/websocket-message.schema';

//! Datos que se guardan por cada cliente conectado
export interface WebSocketData {
  clientId: string;
}

//! Mensajes que envía el servidor
export type ServerMessage =
  | { type: 'ERROR'; payload: { error: string } }
  | { type: 'TICKET_CREATED'; payload: { ticket: Ticket } }
  | { type: 'NEXT_TICKET_ASSIGNED'; payload: { ticket: Ticket } }
  | { type: 'QUEUE_EMPTY' }
  | { type: 'QUEUE_STATE'; payload: { state: QueueMessageState } };

//! Respuestas que produce un mensaje, separadas por destinatario
export interface HandleResult {
  /** Solo para el cliente que envió el mensaje */
  personal: ServerMessage[];
  /** Para el resto de clientes suscritos al canal */
  broadcast: ServerMessage[];
}
