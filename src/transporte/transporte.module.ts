import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransporteController } from './transporte.controller';
import { TransporteService } from './transporte.service';
import { Transporte } from './entities/transporte.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transporte])],
  controllers: [TransporteController],
  providers: [TransporteService],
})
export class TransporteModule {}