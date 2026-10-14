import type { QueueMessageState } from "./queue-message-state";
import type { Ticket } from "./ticket.interface";

//! Este es el objeto que se almacena por cada cliente
export interface WebSocketData {
  clientId: string;
}

//! Este es el objeto que recibe el servidor
export type ClientMessage =
  | { type: 'GET_STATE' }
  | { type: 'CREATE_TICKET'; payload: { isPreferential: boolean } }
  | { type: 'REQUEST_TICKET'; payload: { deskNumber: number; forceNormalTicket: boolean } }
  | { type: 'RESET_QUEUE' };

export type ServerMessage =
  | { type: 'ERROR'; payload: { error: string } }
  | { type: 'TICKET_CREATED'; payload: { ticket: Ticket } }
  | { type: 'NEXT_TICKET_ASSIGNED'; payload: { ticket?: Ticket } }
  | { type: 'QUEUE_EMPTY' }
  | { type: 'QUEUE_STATE'; payload: { state: QueueMessageState } }

export interface HandleResult {
  personal: ServerMessage[];
  broadcast: ServerMessage[];
}