import { State } from '../entities/state.entity';

export class StateResponseDto {
  id: number;
  name: string;
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
