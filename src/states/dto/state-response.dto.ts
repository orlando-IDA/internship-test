import { ApiProperty } from '@nestjs/swagger';
import { State } from '../entities/state.entity';

export class StateResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'São Paulo' })
  name: string;

  @ApiProperty({ example: 'SP', minLength: 2, maxLength: 2 })
  uf: string;

  private constructor(state: State) {
    this.id = state.id;
    this.name = state.name;
    this.uf = state.uf;
  }

  static fromEntity(state: State): StateResponseDto {
    return new StateResponseDto(state);
  }

  static fromEntities(states: State[]): StateResponseDto[] {
    return states.map((state) => StateResponseDto.fromEntity(state));
  }
}
