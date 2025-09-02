
export interface SolicitudCreateRequest {
  tipoSolicitante: string;
  nombres?: string;
  apellidos_paterno?: string;
  apellidos_materno?: string;
  razonSocial?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  pais?: string;
  // departamento?: string;
  // provincia?: string;
  // distrito?: string;
  departamentoId: number;
  provinciaId: number;
  distritoId: number;
  direccion?: string;
  email:string;
  telefono?: string;
  edad?: number;
  sexo?: string;
  areaPertenece?: string;
  descripcion: string;
  medioEntrega: string;
  modalidadNotificacion: string;
  archivoAdjunto?: any;
  observaciones?: string;
  aceptaTerminos: boolean;
}
