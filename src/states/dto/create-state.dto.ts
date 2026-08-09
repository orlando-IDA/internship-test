import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createStateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),

  uf: z
    .string()
    .trim()
    .toUpperCase()
    .length(2, 'UF deve ter exatamente 2 caracteres'),
});

export class CreateStateDto extends createZodDto(createStateSchema) {}