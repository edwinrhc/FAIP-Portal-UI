import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DepartamentoResponse} from "../models/departamento-response";

@Injectable({
  providedIn: 'root'
})
export class UbigeoService {

  private apiUrl = 'http://localhost:8082/api/v1/ubigeo';

  constructor(private http: HttpClient) { }

  listDepartamentos(){
    return this.http.get<DepartamentoResponse[]>(`${this.apiUrl}/departamentos`);
  }
}
