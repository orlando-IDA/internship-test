import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatesModule } from '../states/states.module';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([City]), StatesModule],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
