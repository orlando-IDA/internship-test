import { createZodDto } from 'nestjs-zod';
import { createStateSchema } from './create-state.dto';

export class UpdateStateDto extends createZodDto(createStateSchema) {}