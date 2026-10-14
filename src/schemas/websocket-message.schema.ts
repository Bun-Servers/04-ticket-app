import { z } from 'zod';

//! Mensajes que el servidor acepta de los clientes
export const clientMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('GET_STATE'),
  }),
  z.object({
    type: z.literal('CREATE_TICKET'),
    payload: z.object({
      isPreferential: z.boolean('isPreferential is required'),
    }),
  }),
  z.object({
    type: z.literal('REQUEST_TICKET'),
    payload: z.object({
      deskNumber: z.number('deskNumber is required').int().positive(),
      forceNormalTicket: z.boolean('forceNormalTicket is required'),
    }),
  }),
  z.object({
    type: z.literal('RESET_QUEUE'),
  }),
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
