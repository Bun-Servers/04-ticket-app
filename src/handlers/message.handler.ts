import { clientMessageSchema } from '../schemas/websocket-message.schema';
import { ticketQueueService } from '../services/ticket-queue.service';
import type { HandleResult, ServerMessage } from '../types';
import type { TicketPrefix } from '../types/ticket.interface';

//* Mensajes del servidor

const createErrorMessage = (error: string): ServerMessage => ({
  type: 'ERROR',
  payload: { error },
});

export const createQueueStateMessage = (): ServerMessage => ({
  type: 'QUEUE_STATE',
  payload: { state: ticketQueueService.getState() },
});

//* Formas de responder

/** Responde solo al cliente que envió el mensaje */
const replyToSender = (message: ServerMessage): HandleResult => ({
  personal: [message],
  broadcast: [],
});

/**
 * Para operaciones que modifican la cola: el emisor recibe `messages` más el
 * estado actualizado, y el resto de clientes solo el estado actualizado
 */
const replyAndBroadcastQueueState = (...messages: ServerMessage[]): HandleResult => {
  const queueStateMessage = createQueueStateMessage();

  return {
    personal: [...messages, queueStateMessage],
    broadcast: [queueStateMessage],
  };
};

//* Un handler por cada tipo de mensaje del cliente

const handleGetState = (): HandleResult => replyToSender(createQueueStateMessage());

const handleCreateTicket = (isPreferential: boolean): HandleResult => {
  const prefix: TicketPrefix = isPreferential ? 'P' : 'A';
  const ticket = ticketQueueService.createTicket(prefix);

  return replyAndBroadcastQueueState({ type: 'TICKET_CREATED', payload: { ticket } });
};

const handleRequestTicket = (deskNumber: number, forceNormalTicket: boolean): HandleResult => {
  const ticket = ticketQueueService.assignNextTicket(deskNumber, forceNormalTicket);

  const assignmentMessage: ServerMessage = ticket
    ? { type: 'NEXT_TICKET_ASSIGNED', payload: { ticket } }
    : { type: 'QUEUE_EMPTY' };

  return replyAndBroadcastQueueState(assignmentMessage);
};

const handleResetQueue = (): HandleResult => {
  ticketQueueService.reset();

  return replyAndBroadcastQueueState();
};

//! Handler general: valida el mensaje y lo delega al handler de su tipo
export const handleMessage = (rawMessage: string): HandleResult => {
  try {
    const result = clientMessageSchema.safeParse(JSON.parse(rawMessage));

    if (!result.success) {
      console.log(result.error);
      const issues = result.error.issues.map((issue) => issue.message).join(', ');

      return replyToSender(createErrorMessage(`Validation error ${issues}`));
    }

    const message = result.data;

    switch (message.type) {
      case 'GET_STATE':
        return handleGetState();
      case 'CREATE_TICKET':
        return handleCreateTicket(message.payload.isPreferential);
      case 'REQUEST_TICKET':
        return handleRequestTicket(message.payload.deskNumber, message.payload.forceNormalTicket);
      case 'RESET_QUEUE':
        return handleResetQueue();
    }
  } catch {
    return replyToSender(createErrorMessage('Unknown error'));
  }
};
