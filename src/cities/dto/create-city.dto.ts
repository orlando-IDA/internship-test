import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createCitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  stateId: z
    .number({ message: 'stateId deve ser um número' })
    .int('stateId deve ser um número inteiro')
    .positive('stateId deve ser positivo'),
});

export class CreateCityDto extends createZodDto(createCitySchema) {}
