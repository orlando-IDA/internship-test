import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { City } from '../cities/entities/city.entity';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { State } from './entities/state.entity';

@Injectable()
export class StatesService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async findAll(): Promise<State[]> {
    return this.stateRepository.find({ order: { name: 'ASC' } });
  }

  async findById(id: number): Promise<State> {
    const state = await this.stateRepository.findOne({ where: { id } });

    if (!state) {
      throw new NotFoundException(`Estado com ID ${id} não encontrado`);
    }

    return state;
  }

  async findByUf(uf: string): Promise<State> {
    const normalizedUf = uf.toUpperCase();

    const state = await this.stateRepository.findOne({
      where: { uf: normalizedUf },
    });

    if (!state) {
      throw new NotFoundException(
        `Estado com UF ${normalizedUf} não encontrado`,
      );
    }

    return state;
  }

  async create(dto: CreateStateDto): Promise<State> {
    await this.assertUfIsAvailable(dto.uf);
    await this.assertNameIsAvailable(dto.name);

    const state = this.stateRepository.create({
      name: dto.name,
      uf: dto.uf,
    });

    return this.stateRepository.save(state);
  }

  async update(id: number, dto: UpdateStateDto): Promise<State> {
    const state = await this.findById(id);

    await this.assertUfIsAvailable(dto.uf, id);
    await this.assertNameIsAvailable(dto.name, id);

    state.name = dto.name;
    state.uf = dto.uf;

    return this.stateRepository.save(state);
  }

  async remove(id: number): Promise<void> {
    const state = await this.findById(id);

    const cityCount = await this.cityRepository.count({
      where: { stateId: state.id },
    });

    if (cityCount > 0) {
      throw new ConflictException(
        `Não é possível excluir o estado ${state.uf}: existem ${cityCount} cidade(s) vinculada(s)`,
      );
    }

    await this.stateRepository.softDelete(id);
  }

  private async assertUfIsAvailable(
    uf: string,
    ignoreId?: number,
  ): Promise<void> {
    const existing = await this.stateRepository.findOne({
      where: ignoreId ? { uf, id: Not(ignoreId) } : { uf },
    });

    if (existing) {
      throw new ConflictException(`Já existe um estado com a UF ${uf}`);
    }
  }

  private async assertNameIsAvailable(
    name: string,
    ignoreId?: number,
  ): Promise<void> {
    const existing = await this.stateRepository.findOne({
      where: ignoreId ? { name, id: Not(ignoreId) } : { name },
    });

    if (existing) {
      throw new ConflictException(`Já existe um estado com o nome ${name}`);
    }
  }
}
