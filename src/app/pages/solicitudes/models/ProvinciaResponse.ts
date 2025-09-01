import {DistritoResponse} from "./DistritoResponse";


export interface ProvinciaResponse {

  id: number;
  nombre: string;
  ubigeo: string;
  distrito?: DistritoResponse[] | null;

}
