import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transporte')
export class Transporte {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  _id: string;

  @Column({ nullable: true })
  Anio: number;

  @Column({ nullable: true })
  ID_mes: number;

  @Column({ nullable: true })
  Transporte: string;

  @Column({ nullable: true })
  Variable: string;

  @Column({ nullable: true })
  ID_entidad_unico: string;

  @Column({ nullable: true })
  ID_entidad: number;

  @Column({ nullable: true })
  Entidad: string;

  @Column({ nullable: true })
  ID_municipio_unico: string;

  @Column({ nullable: true })
  ID_Municipio: number;

  @Column({ nullable: true })
  Municipio: string;

  @Column({ nullable: true, type: 'numeric', precision: 20, scale: 2 })
  Valor: number;

  @Column({ nullable: true })
  Estatus: string;

  @Column({ nullable: true, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCarga: Date;
}
