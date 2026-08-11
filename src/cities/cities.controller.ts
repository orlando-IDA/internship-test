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
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CitiesService } from './cities.service';
import { CityResponseDto } from './dto/city-response.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { FindCitiesQueryDto } from './dto/find-cities-query.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Controller('cidades')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
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
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CityResponseDto> {
    return CityResponseDto.fromEntity(await this.citiesService.findById(id));
  }

  @Post()
  async create(@Body() dto: CreateCityDto): Promise<CityResponseDto> {
    return CityResponseDto.fromEntity(await this.citiesService.create(dto));
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCityDto,
  ): Promise<CityResponseDto> {
    return CityResponseDto.fromEntity(await this.citiesService.update(id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.citiesService.remove(id);
  }
}
