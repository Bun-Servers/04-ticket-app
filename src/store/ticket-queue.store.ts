import type { QueueMessageState } from "../types/queue-message-state";
import type { Ticket, TicketPrefix } from "../types/ticket.interface";
import { formatTicketId } from "../utils/format-ticket-id";

interface QueueStoreState {
  lastTicketNumber: {
    A: number;
    P: number
  };
  pending: {
    normal: Ticket[];
    preferential: Ticket[];
  };
  activeByDesk: Record<number, Ticket | undefined>,
  recentlyServed: Ticket[];
}

export class MyStore {
  private state: QueueStoreState = {
    activeByDesk: {},
    lastTicketNumber: { A: 0, P: 0 },
    pending: {
      normal: [],
      preferential: []
    },
    recentlyServed: []
  };

  getAll(): QueueMessageState {
    return {
      activeByDesk: this.state.activeByDesk,
      lastTikcteNumbers: this.state.lastTicketNumber,
      pendingTotal: {
        normal: this.state.pending.normal.length,
        preferential: this.state.pending.preferential.length,
        combined: this.state.pending.normal.length + this.state.pending.preferential.length,
      },
      recentlyServed: this.state.recentlyServed
    }
  }

  reset() {
    this.state = {
      activeByDesk: {},
      lastTicketNumber: { A: 0, P: 0 },
      pending: {
        normal: [],
        preferential: []
      },
      recentlyServed: []
    }
  }

  createTicket(prefix: TicketPrefix): Ticket {
    const validPrefixes = ['A', 'P'];
    if (!validPrefixes.includes(prefix)) {
      throw new Error(
        `Invalid prefix ${prefix}. Must be ${validPrefixes.join('m, ')}`
      );
    }

    let currentNumber = this.state.lastTicketNumber[prefix] ?? 0;

    if (currentNumber >= 999) {
      currentNumber = 0;
    }

    const nextNumber = currentNumber + 1;
    this.state.lastTicketNumber[prefix] = nextNumber;

    const ticket: Ticket = {
      id: formatTicketId(prefix, nextNumber),
      prefix,
      number: nextNumber,
      deskNumber: undefined,
      createdAt: Date.now(),
      servedAt: undefined,
    }

    if (prefix === 'P') {
      this.state.pending.preferential.push(ticket);
    } else {
      this.state.pending.normal.push(ticket);
    }

    return ticket;
  }
}
