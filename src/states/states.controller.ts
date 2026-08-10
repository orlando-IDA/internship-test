import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateStateDto } from './dto/create-state.dto';
import { StateResponseDto } from './dto/state-response.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { StatesService } from './states.service';

@Controller('estados')
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Get()
  async findAll(): Promise<StateResponseDto[]> {
    return StateResponseDto.fromEntities(await this.statesService.findAll());
  }

  @Get(':uf')
  async findByUf(@Param('uf') uf: string): Promise<StateResponseDto> {
    return StateResponseDto.fromEntity(await this.statesService.findByUf(uf));
  }

  @Post()
  async create(@Body() dto: CreateStateDto): Promise<StateResponseDto> {
    return StateResponseDto.fromEntity(await this.statesService.create(dto));
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStateDto,
  ): Promise<StateResponseDto> {
    return StateResponseDto.fromEntity(
      await this.statesService.update(id, dto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.statesService.remove(id);
  }
}
