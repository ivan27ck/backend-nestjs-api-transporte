import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Transporte } from './entities/transporte.entity';
import axios from 'axios';
import { FiltrarTransporteDto } from './dto/filtrar-transporte.dto';

@Injectable()
export class TransporteService {
  private readonly logger = new Logger(TransporteService.name);

  constructor(
    @InjectRepository(Transporte)
    private transporteRepository: Repository<Transporte>,
  ) {}

  async cargarDatosTransporte(): Promise<{ mensaje: string; totalRegistros: number }> {
    try {
      // Obtener datos de la API externa
      this.logger.log('Iniciando solicitud a la API externa');
      const response = await axios.get('http://apiiieg.jalisco.gob.mx/api/etup');
      
      // Si el resultado es un objeto y no un array, verificar si hay alguna propiedad que contenga el array
      let datos;
      if (typeof response.data === 'object' && !Array.isArray(response.data)) {
        
        // Intentar encontrar un array dentro del objeto
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            this.logger.log(`Encontrado array en la propiedad: ${key}`);
            datos = response.data[key];
            break;
          }
        }
        
        // Si no encontramos un array, intentar parsear como string JSON
        if (!datos && typeof response.data === 'string') {
          try {
            const parsedData = JSON.parse(response.data);
            if (Array.isArray(parsedData)) {
              datos = parsedData;
              this.logger.log('Datos obtenidos mediante parseo de JSON string');
            }
          } catch (e) {
            this.logger.error('Error al parsear datos como JSON');
          }
        }
      } else {
        datos = response.data;
      }

      // Preparar los datos para inserción
      const entidades = datos.map(item => {
        const transporte = new Transporte();
        
        // Mapeo de campos con validación
        transporte._id = item?._id !== undefined ? item._id : null;
        transporte.Anio = item?.Anio !== undefined ? item.Anio : null;
        transporte.ID_mes = item?.ID_mes !== undefined ? item.ID_mes : null;
        transporte.Transporte = item?.Transporte || null;
        transporte.Variable = item?.Variable || null;
        transporte.ID_entidad_unico = item?.ID_entidad_unico || null;
        transporte.ID_entidad = item?.ID_entidad !== undefined ? item.ID_entidad : null;
        transporte.Entidad = item?.Entidad || null;
        transporte.ID_municipio_unico = item?.ID_municipio_unico || null;
        transporte.ID_Municipio = item?.ID_Municipio !== undefined ? item.ID_Municipio : null;
        transporte.Municipio = item?.Municipio || null;
        transporte.Valor = item?.Valor !== undefined ? item.Valor : null;
        transporte.Estatus = item?.Estatus || null;
        
        return transporte;
      });

      // Guardar registros en lotes
      const batchSize = 50;
      for (let i = 0; i < entidades.length; i += batchSize) {
        const batch = entidades.slice(i, i + batchSize);
        try {
          await this.transporteRepository.save(batch);
          this.logger.log(`Guardado lote ${Math.floor(i/batchSize) + 1} (${batch.length} registros)`);
        } catch (error) {
          this.logger.error(`Error al guardar lote ${Math.floor(i/batchSize) + 1}: ${error.message}`);
          // Continuar con el siguiente lote en lugar de fallar por completo
        }
      }

      return {
        mensaje: 'Datos de transporte cargados exitosamente',
        totalRegistros: entidades.length,
      };
    } catch (error) {
      this.logger.error(`Error al cargar datos de transporte: ${error.message}`);
      throw new HttpException(
        `Error al cargar datos de transporte: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async obtenerDatosTransporte(): Promise<Transporte[]> {
    try {
      return await this.transporteRepository.find({ take: 100 });
    } catch (error) {
      this.logger.error(`Error al obtener datos: ${error.message}`);
      throw new HttpException(
        `Error al obtener datos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  // Método para depuración - solo prueba la API sin guardar datos
  async probarConexionAPI(): Promise<any> {
    try {
      const response = await axios.get('http://apiiieg.jalisco.gob.mx/api/etup');
      
      // Determinar el tipo de respuesta
      const respType = typeof response.data;
      const isArray = Array.isArray(response.data);
      
      // Obtener una muestra de los datos para análisis
      let muestra;
      if (isArray && response.data.length > 0) {
        muestra = response.data.slice(0, 2);
      } else if (respType === 'object') {
        muestra = response.data;
      } else {
        muestra = String(response.data).substring(0, 500);
      }
      
      return {
        mensaje: 'Conexión con API exitosa',
        tipoRespuesta: respType,
        esArray: isArray,
        tamanoRespuesta: isArray ? response.data.length : 'N/A',
        muestra
      };
    } catch (error) {
      this.logger.error(`Error al probar conexión API: ${error.message}`);
      throw new HttpException(
        `Error al probar conexión API: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR, 
      );
    }
  }

  async obtenerEstadisticasFiltradas(
    filtros: FiltrarTransporteDto,
  ): Promise<any> {
    try {
      this.logger.log('Obteniendo estadísticas filtradas');

      // Construir condiciones de la consulta
      const where: any = {};

      // Filtros de año y mes
      if (filtros.anioInicio && filtros.anioFin) {
        where.Anio = Between(filtros.anioInicio, filtros.anioFin);
      } else if (filtros.anioInicio) {
        where.Anio = filtros.anioInicio;
      }

      if (filtros.mesInicio && filtros.mesFin) {
        where.ID_mes = Between(filtros.mesInicio, filtros.mesFin);
      } else if (filtros.mesInicio) {
        where.ID_mes = filtros.mesInicio;
      }

      // Filtro de transporte
      if (filtros.transporte) {
        where.Transporte = filtros.transporte;
      }
      
      if (filtros.transporte) {
        where.Variable = filtros.estadistica;
      }

      // Consultar los datos filtrados
      const datos = await this.transporteRepository.find({
        where,
      });

      // Calcular estadísticas
      const estadisticas: any = {
        ingresosPorPasaje: 0,
        kilometrosRecorridos: 0,
        longitudServicio: 0,
        pasajerosTransportados: 0,
        unidadesEnOperacion: 0,
      };

      datos.forEach((item) => {
        switch (item.Variable) {
          case 'Ingresos por pasaje':
            estadisticas.ingresosPorPasaje += item.Valor || 0;
            break;
          case 'Kilómetros recorridos':
            estadisticas.kilometrosRecorridos += item.Valor || 0;
            break;
          case 'Longitud de servicio':
            estadisticas.longitudServicio += item.Valor || 0;
            break;
          case 'Pasajeros transportados':
            estadisticas.pasajerosTransportados += item.Valor || 0;
            break;
          case 'Unidades en operación':
            estadisticas.unidadesEnOperacion += item.Valor || 0;
            break;
        }
      });

      return {
        estadisticas,
        datosFiltrados: datos,
      };
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas: ${error.message}`);
      throw new HttpException(
        `Error al obtener estadísticas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para obtener todos los valores únicos de Transporte
  async obtenerTiposTransporte(): Promise<string[]> {
    try {
      const transportes = await this.transporteRepository
        .createQueryBuilder('transporte')
        .select('DISTINCT transporte.Transporte', 'transporte')
        .where('transporte.Transporte IS NOT NULL')
        .getRawMany();
      return transportes.map((t) => t.transporte);
    } catch (error) {
      this.logger.error(`Error al obtener tipos de transporte: ${error.message}`);
      throw new HttpException(
        `Error al obtener tipos de transporte: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

