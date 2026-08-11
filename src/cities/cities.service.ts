import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Not, Repository } from 'typeorm';
import { StatesService } from '../states/states.service';
import { CreateCityDto } from './dto/create-city.dto';
import { FindCitiesQueryDto } from './dto/find-cities-query.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    private readonly statesService: StatesService,
  ) {}

  async findAll(query: FindCitiesQueryDto): Promise<[City[], number]> {
    const where: FindOptionsWhere<City> = {};

    if (query.uf) {
      where.state = { uf: query.uf };
    }

    if (query.name) {
      where.name = Like(`%${query.name}%`);
    }

    return this.cityRepository.findAndCount({
      where,
      relations: { state: true },
      order: { name: 'ASC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }

  async findById(id: number): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { id },
      relations: { state: true },
    });

    if (!city) {
      throw new NotFoundException(`Cidade com ID ${id} não encontrada`);
    }

    return city;
  }

  async create(dto: CreateCityDto): Promise<City> {
    const state = await this.statesService.findById(dto.stateId);

    await this.assertNameIsAvailableInState(dto.name, state.id);

    const city = this.cityRepository.create({
      name: dto.name,
      stateId: state.id,
    });

    const saved = await this.cityRepository.save(city);

    return this.findById(saved.id);
  }

  async update(id: number, dto: UpdateCityDto): Promise<City> {
    const city = await this.findById(id);
    const state = await this.statesService.findById(dto.stateId);

    await this.assertNameIsAvailableInState(dto.name, state.id, id);

    city.name = dto.name;
    // `stateId` e `state` mapeiam a MESMA coluna (state_id). Como findById
    // carregou a relação, atualizar só o escalar não teria efeito: o TypeORM
    // dá precedência ao objeto da relação ao montar o UPDATE.
    city.state = state;
    city.stateId = state.id;

    await this.cityRepository.save(city);

    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.cityRepository.softDelete(id);
  }

  private async assertNameIsAvailableInState(
    name: string,
    stateId: number,
    ignoreId?: number,
  ): Promise<void> {
    const existing = await this.cityRepository.findOne({
      where: ignoreId
        ? { name, stateId, id: Not(ignoreId) }
        : { name, stateId },
    });

    if (existing) {
      throw new ConflictException(
        `Já existe uma cidade chamada ${name} neste estado`,
      );
    }
  }
}
