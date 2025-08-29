import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {SolicitudResponse} from "../models/solicitud-response";
import {SolicitudCreateRequest} from "../models/solicitud-create-request.model";

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {

  private apiUrl = 'http://localhost:8082/api/v1/solicitudes';

  constructor(private http: HttpClient) { }

  crearSolicitud(request: SolicitudCreateRequest): Observable<SolicitudResponse>{
    return this.http.post<SolicitudResponse>(`${this.apiUrl}`, request);
  }



}
