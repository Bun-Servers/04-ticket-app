import type { Ticket, TicketPrefix } from './ticket.interface';

export interface QueueMessageState {
  // La errata es parte del contrato con el cliente: no renombrar sin actualizarlo
  lastTikcteNumbers: Record<TicketPrefix, number>;
  pendingTotal: {
    normal: number;
    preferential: number;
    combined: number;
  };
  activeByDesk: Record<number, Ticket | undefined>;
  recentlyServed: Ticket[];
}
