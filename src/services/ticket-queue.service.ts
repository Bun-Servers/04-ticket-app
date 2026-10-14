import { TicketQueueStore } from '../store/ticket-queue.store';
import type { QueueMessageState } from '../types/queue-message-state';
import type { Ticket, TicketPrefix } from '../types/ticket.interface';

class TicketQueueService {
  private readonly store = new TicketQueueStore();

  createTicket(prefix: TicketPrefix): Ticket {
    return this.store.createTicket(prefix);
  }

  assignNextTicket(deskNumber: number, forceNormalTicket: boolean): Ticket | undefined {
    return this.store.assignNextTicket(deskNumber, forceNormalTicket);
  }

  reset(): void {
    this.store.reset();
  }

  getState(): QueueMessageState {
    return this.store.getState();
  }
}

export const ticketQueueService = new TicketQueueService();
