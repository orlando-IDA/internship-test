import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatesController } from './states.controller';
import { StatesService } from './states.service';
import { State } from './entities/state.entity';
import { City } from '../cities/entities/city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([State, City])],
  controllers: [StatesController],
  providers: [StatesService],
})
export class StatesModule {}
