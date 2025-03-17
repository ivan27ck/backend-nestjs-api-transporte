import { Controller, Get, Logger, HttpException, HttpStatus, Query } from '@nestjs/common';
import { TransporteService } from './transporte.service';
import { Transporte } from './entities/transporte.entity';
import { FiltrarTransporteDto } from './dto/filtrar-transporte.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('transporte')
@Controller('transporte')
export class TransporteController {
  private readonly logger = new Logger(TransporteController.name);

  constructor(private readonly transporteService: TransporteService) {}

  @Get('cargar')
  async cargarDatos() {
    try {
      this.logger.log('Procesando solicitud para cargar datos de transporte');
      return await this.transporteService.cargarDatosTransporte();
    } catch (error) {
      this.logger.error(`Error en el controlador: ${error.message}`);
      throw new HttpException(
        'Error al procesar la solicitud',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async obtenerDatos(): Promise<Transporte[]> {
    try {
      return await this.transporteService.obtenerDatosTransporte();
    } catch (error) {
      this.logger.error(`Error en el controlador: ${error.message}`);
      throw new HttpException(
        'Error al obtener los datos',
        HttpStatus.INTERNAL_SERVER_ERROR, 
      );
    }
  }
  
  @Get('probar-api')
  async probarAPI() {
    try {
      return await this.transporteService.probarConexionAPI();
    } catch (error) {
      this.logger.error(`Error al probar API: ${error.message}`);
      throw new HttpException(
        'Error al probar conexión con API',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtiene estadísticas filtradas de transporte' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  @ApiResponse({ status: 500, description: 'Error al obtener estadísticas' })
  async obtenerEstadisticas(
    @Query() filtros: FiltrarTransporteDto,
  ): Promise<any> {
    try {
      this.logger.log('Obteniendo estadísticas con filtros');
      return await this.transporteService.obtenerEstadisticasFiltradas(filtros);
    } catch (error) {
      this.logger.error(`Error en el controlador: ${error.message}`);
      throw new HttpException(
        'Error al obtener estadísticas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('tipos-transporte')
  @ApiOperation({ summary: 'Obtiene los tipos de transporte disponibles' })
  @ApiResponse({ status: 200, description: 'Tipos de transporte obtenidos exitosamente' })
  @ApiResponse({ status: 500, description: 'Error al obtener tipos de transporte' })
  async obtenerTiposTransporte(): Promise<string[]> {
    try {
      this.logger.log('Obteniendo tipos de transporte');
      return await this.transporteService.obtenerTiposTransporte();
    } catch (error) {
      this.logger.error(`Error en el controlador: ${error.message}`);
      throw new HttpException(
        'Error al obtener tipos de transporte',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}