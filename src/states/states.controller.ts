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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStateDto } from './dto/create-state.dto';
import { StateResponseDto } from './dto/state-response.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { StatesService } from './states.service';

@ApiTags('Estados')
@Controller('estados')
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista todos os estados',
    description:
      'Retorna os estados ativos ordenados por nome. Estados excluídos não ' +
      'aparecem aqui: a exclusão é lógica e o registro continua no banco ' +
      'com `deleted_at` preenchido.\n\n' +
      'Esta rota não tem paginação, ao contrário de `/cidades`. São 27 ' +
      'estados num domínio fechado, então paginar adicionaria cerimônia ' +
      'sem ganho nenhum.',
  })
  @ApiResponse({ status: 200, type: [StateResponseDto] })
  async findAll(): Promise<StateResponseDto[]> {
    return StateResponseDto.fromEntities(await this.statesService.findAll());
  }

  @Get(':uf')
  @ApiOperation({
    summary: 'Busca um estado pela sigla (UF)',
    description:
      'A busca é pela sigla, não pelo ID. Informar `sp` em minúsculas ' +
      'funciona — a sigla é normalizada para maiúscula antes da consulta.\n\n' +
      'Estados excluídos não são encontrados por aqui. É por isso que ' +
      'recriar uma UF que foi excluída é permitido.',
  })
  @ApiParam({ name: 'uf', example: 'SP' })
  @ApiResponse({ status: 200, type: StateResponseDto })
  @ApiResponse({ status: 404, description: 'Estado não encontrado' })
  async findByUf(@Param('uf') uf: string): Promise<StateResponseDto> {
    return StateResponseDto.fromEntity(await this.statesService.findByUf(uf));
  }

  @Post()
  @ApiOperation({
    summary: 'Cria um novo estado',
    description:
      'A sigla precisa ter exatamente 2 caracteres e é convertida para ' +
      'maiúscula automaticamente. Espaços nas pontas de `name` e `uf` são ' +
      'removidos antes da validação, então enviar `" sp "` resulta em `SP`.\n\n' +
      'Enviar uma UF ou um nome que já pertence a outro estado ativo ' +
      'retornará 409. Estados excluídos não bloqueiam: se você apagou o MG ' +
      'e criar outro MG, vai funcionar.',
  })
  @ApiResponse({ status: 201, type: StateResponseDto })
  @ApiResponse({ status: 400, description: 'Erro de validação' })
  @ApiResponse({
    status: 409,
    description: 'Já existe estado ativo com a mesma UF ou o mesmo nome',
  })
  async create(@Body() dto: CreateStateDto): Promise<StateResponseDto> {
    return StateResponseDto.fromEntity(await this.statesService.create(dto));
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualiza um estado existente',
    description:
      'A substituição é completa: envie `name` e `uf` mesmo que só um deles ' +
      'mude. Repetir os valores atuais do próprio registro não causa ' +
      'conflito — a checagem de duplicidade ignora o estado que está sendo ' +
      'atualizado.\n\n' +
      'Informar a UF ou o nome de outro estado ativo retornará 409.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, type: StateResponseDto })
  @ApiResponse({ status: 400, description: 'Erro de validação' })
  @ApiResponse({ status: 404, description: 'Estado não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Já existe outro estado com a mesma UF ou o mesmo nome',
  })
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
  @ApiOperation({
    summary: 'Exclui um estado (soft delete)',
    description:
      'A exclusão é lógica. O registro permanece no banco com `deleted_at` ' +
      'preenchido e deixa de aparecer nas consultas.\n\n' +
      'Excluir um estado que possua cidades ativas retornará 409, com a ' +
      'contagem na mensagem. Exclua ou mova as cidades antes. Cidades já ' +
      'excluídas não contam para esse bloqueio.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 204, description: 'Estado excluído' })
  @ApiResponse({ status: 404, description: 'Estado não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'O estado possui cidades vinculadas',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.statesService.remove(id);
  }
}
