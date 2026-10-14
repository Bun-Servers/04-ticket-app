import type { TicketPrefix } from '../types/ticket.interface';

/** Ej: ('A', 7) => 'A-007' */
export const formatTicketId = (prefix: TicketPrefix, number: number): string =>
  `${prefix}-${String(number).padStart(3, '0')}`;
