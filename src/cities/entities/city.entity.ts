import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { State } from '../../states/entities/state.entity';

@Entity('cities')
// Índice composto servindo a três propósitos: exigência do InnoDB de indexar
// a coluna da FK (prefixo à esquerda), checagem de cidade duplicada dentro do
// mesmo estado, e filtro de cidades por estado.
@Index('idx_cities_state_name', ['stateId', 'name'])
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  // A coluna FK é declarada explicitamente, além da relação, para permitir
  // filtrar por estado sem precisar carregar a entity relacionada.
  @Column({ name: 'state_id', type: 'int' })
  stateId: number;

  // ON DELETE RESTRICT expressa "não excluir estado que possua cidades".
  // A exclusão da aplicação é soft e nunca dispara a constraint, mas ela
  // protege contra DELETE físico feito direto no banco.
  @ManyToOne(() => State, (state) => state.cities, {
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'state_id',
    foreignKeyConstraintName: 'fk_cities_state',
  })
  state: State;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
  })
  deletedAt: Date | null;
}
