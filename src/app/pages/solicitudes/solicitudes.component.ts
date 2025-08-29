import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {SolicitudesService,} from "./services/solicitudes.service";
import {buildSolicitudesForm} from "./forms/solicitudes.form";
import {SolicitudCreateRequest} from "./models/solicitud-create-request.model";
import {SolicitudResponse} from "./models/solicitud-response";
import {UbigeoService} from "./services/ubigeo.service";
import {DepartamentoResponse} from "./models/departamento-response";

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.css']
})
export class SolicitudesComponent implements  OnInit{

  mensaje: string | null = null;
  form = buildSolicitudesForm(this.fb);
  departamentos: DepartamentoResponse[] = [];

  constructor(private fb: FormBuilder,
              private service: SolicitudesService,
              private ubigeoService: UbigeoService,) {
  }

  ngOnInit(): void {
    this.ubigeoService.listDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;
        console.log('Departamentos cargados:', data);
      },
      error: (err) => {
        console.error('Error al cargar departamentos', err);
        this.mensaje = 'No se pudieron cargar los departamentos';
      }
    });
  }


  onSubmit() {
    if (this.form.valid) {
      const request: SolicitudCreateRequest = this.form.value as SolicitudCreateRequest;

      this.service.crearSolicitud(request).subscribe({
        next: (res: SolicitudResponse) => {
          this.mensaje = `Solicitud creada con código: ${res.codigo}`;
          this.form.reset({tipoSolicitante: 'Persona Natural', pais: 'Perú'});
        },
        error: (err) => {
          this.mensaje = 'Error al registrar la solicitud';
          console.log(err);
        }
      });
    }
  }


}
