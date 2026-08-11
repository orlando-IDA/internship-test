import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const findCitiesQuerySchema = z.object({
  uf: z
    .string()
    .trim()
    .toUpperCase()
    .length(2, 'UF deve ter exatamente 2 caracteres')
    .optional(),

  name: z
    .string()
    .trim()
    .min(1, 'O termo de busca não pode ser vazio')
    .optional(),

  page: z.coerce
    .number()
    .int('page deve ser um número inteiro')
    .positive('page deve ser maior que zero')
    .default(1),

  limit: z.coerce
    .number()
    .int('limit deve ser um número inteiro')
    .positive('limit deve ser maior que zero')
    .max(100, 'limit não pode ser maior que 100')
    .default(10),
});

export class FindCitiesQueryDto extends createZodDto(findCitiesQuerySchema) {}
