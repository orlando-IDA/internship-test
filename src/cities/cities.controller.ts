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
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CitiesService } from './cities.service';
import { CityResponseDto } from './dto/city-response.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { FindCitiesQueryDto } from './dto/find-cities-query.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@ApiTags('Cidades')
@Controller('cidades')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista cidades com filtros e paginação',
    description:
      'Os filtros `uf` e `name` são opcionais e podem ser combinados. ' +
      'Omitir os dois retorna todas as cidades ativas.\n\n' +
      'O filtro `name` busca em qualquer posição do título e ignora acento ' +
      'e maiúscula, então buscar por `sao` encontra "São Paulo". Isso vem da ' +
      'collation do MySQL, não de tratamento na aplicação.\n\n' +
      'Recomendo usar `limit` entre 10 e 50. Valores acima de 100 retornam ' +
      '400 — o teto existe para ninguém pedir a tabela inteira numa ' +
      'requisição só.\n\n' +
      'A resposta vem no formato `{ data, meta }`. A lista fica em `data`; ' +
      '`meta` traz a página atual, o limite, o total de registros que casam ' +
      'com o filtro (ignorando a paginação) e o total de páginas. Use ' +
      '`meta.total` para saber se vale pedir a próxima página.',
  })
  @ApiResponse({ status: 200, description: 'Lista paginada de cidades' })
  @ApiResponse({ status: 400, description: 'Parâmetro de consulta inválido' })
  async findAll(
    @Query() query: FindCitiesQueryDto,
  ): Promise<PaginatedResponseDto<CityResponseDto>> {
    const [cities, total] = await this.citiesService.findAll(query);

    return PaginatedResponseDto.create(
      CityResponseDto.fromEntities(cities),
      total,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca uma cidade pelo ID',
    description:
      'A busca é pelo ID numérico. Informar algo não numérico retorna 400 ' +
      'antes de a requisição chegar no banco.\n\n' +
      'Cidades excluídas não são encontradas aqui.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, type: CityResponseDto })
  @ApiResponse({ status: 404, description: 'Cidade não encontrada' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CityResponseDto> {
    return CityResponseDto.fromEntity(await this.citiesService.findById(id));
  }

  @Post()
  @ApiOperation({
    summary: 'Cria uma nova cidade',
    description:
      'O campo `stateId` precisa ser o ID numérico de um estado **ativo**. ' +
      'Informar um estado inexistente, ou um que foi excluído, retorna 404.\n\n' +
      'Nomes repetidos são permitidos entre estados diferentes — Campinas em ' +
      'SP e Campinas em MG convivem sem problema. Repetir o nome dentro do ' +
      'mesmo estado retorna 409.\n\n' +
      'Espaços nas pontas do nome são removidos antes da validação.',
  })
  @ApiResponse({ status: 201, type: CityResponseDto })
  @ApiResponse({ status: 400, description: 'Erro de validação' })
  @ApiResponse({ status: 404, description: 'Estado informado não existe' })
  @ApiResponse({
    status: 409,
    description: 'Já existe cidade com esse nome no estado',
  })
  async create(@Body() dto: CreateCityDto): Promise<CityResponseDto> {
    return CityResponseDto.fromEntity(await this.citiesService.create(dto));
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualiza uma cidade existente',
    description:
      'A substituição é completa: envie `name` e `stateId` mesmo que só um ' +
      'deles mude. Alterar o `stateId` move a cidade de estado.\n\n' +
      'Mover uma cidade para um estado onde já existe outra com o mesmo nome ' +
      'retorna 409. A checagem de duplicidade também roda no update, não só ' +
      'na criação.\n\n' +
      'Repetir os valores atuais do próprio registro não causa conflito.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, type: CityResponseDto })
  @ApiResponse({ status: 400, description: 'Erro de validação' })
  @ApiResponse({ status: 404, description: 'Cidade ou estado não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Já existe outra cidade com esse nome no estado',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCityDto,
  ): Promise<CityResponseDto> {
    return CityResponseDto.fromEntity(await this.citiesService.update(id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Exclui uma cidade (soft delete)',
    description:
      'A exclusão é lógica. O registro permanece no banco com `deleted_at` ' +
      'preenchido e deixa de aparecer nas consultas.\n\n' +
      'A cidade também deixa de contar como vinculada ao estado. Se um ' +
      'estado estava bloqueado para exclusão por ter cidades, excluir todas ' +
      'elas libera a exclusão do estado.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 204, description: 'Cidade excluída' })
  @ApiResponse({ status: 404, description: 'Cidade não encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.citiesService.remove(id);
  }
}
