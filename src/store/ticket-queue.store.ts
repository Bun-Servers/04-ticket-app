import type { QueueMessageState } from '../types/queue-message-state';
import type { Ticket, TicketPrefix } from '../types/ticket.interface';
import { formatTicketId } from '../utils/format-ticket-id';

const RECENTLY_SERVED_LIMIT = 8;
const MAX_TICKET_NUMBER = 999;
const VALID_PREFIXES: TicketPrefix[] = ['A', 'P'];

interface QueueStoreState {
  lastTicketNumber: Record<TicketPrefix, number>;
  pending: {
    normal: Ticket[];
    preferential: Ticket[];
  };
  activeByDesk: Record<number, Ticket | undefined>;
  recentlyServed: Ticket[];
}

const createInitialState = (): QueueStoreState => ({
  lastTicketNumber: { A: 0, P: 0 },
  pending: { normal: [], preferential: [] },
  activeByDesk: {},
  recentlyServed: [],
});

export class TicketQueueStore {
  private state = createInitialState();

  getState(): QueueMessageState {
    const { activeByDesk, lastTicketNumber, pending, recentlyServed } = this.state;

    return {
      activeByDesk,
      lastTikcteNumbers: lastTicketNumber,
      pendingTotal: {
        normal: pending.normal.length,
        preferential: pending.preferential.length,
        combined: pending.normal.length + pending.preferential.length,
      },
      recentlyServed,
    };
  }

  reset(): void {
    this.state = createInitialState();
  }

  createTicket(prefix: TicketPrefix): Ticket {
    if (!VALID_PREFIXES.includes(prefix)) {
      throw new Error(`Invalid prefix ${prefix}. Must be ${VALID_PREFIXES.join(', ')}`);
    }

    const number = this.takeNextTicketNumber(prefix);
    const ticket: Ticket = {
      id: formatTicketId(prefix, number),
      prefix,
      number,
      deskNumber: undefined, // Se asignan al atender el ticket
      createdAt: Date.now(),
      servedAt: undefined,
    };

    const { pending } = this.state;
    const queue = prefix === 'P' ? pending.preferential : pending.normal;
    queue.push(ticket);

    return ticket;
  }

  assignNextTicket(deskNumber: number, forceNormalTicket: boolean): Ticket | undefined {
    const ticket = this.takeNextPendingTicket(forceNormalTicket);
    if (!ticket) return undefined;

    ticket.deskNumber = deskNumber;
    ticket.servedAt = Date.now();

    this.state.activeByDesk[deskNumber] = ticket;
    this.addToRecentlyServed(ticket);

    return ticket;
  }

  /** Al superar MAX_TICKET_NUMBER la numeración vuelve a empezar en 1 */
  private takeNextTicketNumber(prefix: TicketPrefix): number {
    const lastNumber = this.state.lastTicketNumber[prefix];
    const nextNumber = lastNumber >= MAX_TICKET_NUMBER ? 1 : lastNumber + 1;

    this.state.lastTicketNumber[prefix] = nextNumber;

    return nextNumber;
  }

  /** Los preferenciales tienen prioridad, salvo que se fuerce un ticket normal */
  private takeNextPendingTicket(forceNormalTicket: boolean): Ticket | undefined {
    const { normal, preferential } = this.state.pending;

    return forceNormalTicket
      ? (normal.shift() ?? preferential.shift())
      : (preferential.shift() ?? normal.shift());
  }

  private addToRecentlyServed(ticket: Ticket): void {
    this.state.recentlyServed = [ticket, ...this.state.recentlyServed].slice(0, RECENTLY_SERVED_LIMIT);
  }
}
