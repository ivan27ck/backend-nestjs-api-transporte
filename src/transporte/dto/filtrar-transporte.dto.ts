import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FiltrarTransporteDto {
  @IsOptional()
  @IsNumber()
  @Min(2000)
  anioInicio?: number;

  @IsOptional()
  @IsNumber()
  @Min(2000)
  anioFin?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  mesInicio?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  mesFin?: number;

  @IsOptional()
  @IsString()
  transporte?: string;

  @IsOptional()
  @IsString()
  estadistica?: string;
}