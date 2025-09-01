import {ProvinciaResponse} from "./ProvinciaResponse";

export interface DepartamentoResponse {
  id: number;
  nombre: string;
  ubigeo: string;
  provincia?: ProvinciaResponse[]
}
