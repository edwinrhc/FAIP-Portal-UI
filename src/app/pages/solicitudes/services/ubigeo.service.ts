import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DepartamentoResponse} from "../models/DepartamentoResponse";
import {ProvinciaResponse} from "../models/ProvinciaResponse";
import {DistritoResponse} from "../models/DistritoResponse";


@Injectable({
  providedIn: 'root'
})
export class UbigeoService {
  private apiUrl = 'http://localhost:8082/api/v1/ubigeo';

  constructor(private http: HttpClient) { }


  listDepartamentos(): Observable<DepartamentoResponse[]>{
    return this.http.get<DepartamentoResponse[]>(`${this.apiUrl}/departamentos`);
  }

  listProvincias(departamentoId: number): Observable<ProvinciaResponse[]>{
    return this.http.get<ProvinciaResponse[]>(`${this.apiUrl}/departamentos/${departamentoId}/provincias`);
  }

  listDistritos(provinciaId: number): Observable<DistritoResponse[]>{
    return this.http.get<DistritoResponse[]>(`${this.apiUrl}/provincias/${provinciaId}/distritos`);
  }
}
