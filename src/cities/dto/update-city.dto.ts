import { createZodDto } from 'nestjs-zod';
import { createCitySchema } from './create-city.dto';

export class UpdateCityDto extends createZodDto(createCitySchema) {}
