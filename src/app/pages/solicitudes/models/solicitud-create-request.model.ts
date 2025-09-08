
export interface SolicitudCreateRequest {
  tipoSolicitante: string;
  nombres?: string;
  apellidos_paterno?: string;
  apellidos_materno?: string;
  razonSocial?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  pais: string;
  // departamento?: string;
  // provincia?: string;
  // distrito?: string;
  departamento?: number;
  provincia?: number;
  distrito?: number;
  direccion?: string;
  email:string;
  telefono?: string;
  edad?: number;
  sexo?: string;
  autoidentificacionEtnica?: string;
  lenguaMaterna?: string;
  discapacidad?: string;
  areaGeografica?: string;
  areaPertenece?: string;
  descripcion: string;
  observaciones?: string;
  archivoAdjunto?: any;
  medioEntrega: string;
  otrosMediosEntrega?: string;
  modalidadNotificacion: string;
  otrosModalidadesNotificacion?: string;
  aceptaTerminos: boolean;

}
