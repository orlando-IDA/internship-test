import { StateResponseDto } from '../../states/dto/state-response.dto';
import { City } from '../entities/city.entity';

export class CityResponseDto {
  id: number;
  name: string;
  state: StateResponseDto;

  private constructor(city: City) {
    this.id = city.id;
    this.name = city.name;
    this.state = StateResponseDto.fromEntity(city.state);
  }

  static fromEntity(city: City): CityResponseDto {
    return new CityResponseDto(city);
  }

  static fromEntities(cities: City[]): CityResponseDto[] {
    return cities.map((city) => CityResponseDto.fromEntity(city));
  }
}
