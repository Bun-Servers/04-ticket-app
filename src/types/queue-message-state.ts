import type { Ticket } from "./ticket.interface";

export interface QueueMessageState {
    lastTikcteNumbers: {
        A: number;
        P: number;
    },
    pendingTotal: {
        normal: number;
        preferential: number;
        combined: number;
    },
    activeByDesk: Record<number, Ticket | undefined>;
    recentlyServed: Ticket[];
}