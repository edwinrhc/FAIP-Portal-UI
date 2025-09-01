import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {SolicitudesService,} from "./services/solicitudes.service";
import {buildSolicitudesForm} from "./forms/solicitudes.form";
import {SolicitudCreateRequest} from "./models/solicitud-create-request.model";
import {SolicitudResponse} from "./models/solicitud-response";
import {UbigeoService} from "./services/ubigeo.service";
import {DepartamentoResponse} from "./models/DepartamentoResponse";
import {ProvinciaResponse} from "./models/ProvinciaResponse";
import {DistritoResponse} from "./models/DistritoResponse";
import {finalize} from "rxjs";


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
  provincias: ProvinciaResponse[] = [];
  distritos: DistritoResponse[] = [];

  loadingDepartamentos = false;
  loadingProvincias = false;
  loadingDistritos = false;


  constructor(private fb: FormBuilder,
              private service: SolicitudesService,
              private ubigeoService: UbigeoService,) {
  }

  ngOnInit(): void {

     // Cargar Departamentos
    this.loadDepartamentos();

    // Reaccionar a cambios de  Departamentos -> cargar Provincias
    this.form.get('departamento')!.valueChanges.subscribe((depId: number | null) => {
      // Reset y bloqueo de hijos
      this.provincias =  [];
      this.distritos = [];
      this.form.get('provincia')!.reset();
      this.form.get('distrito')!.reset();
      this.form.get('provincia')!.disable();
      this.form.get('distrito')!.disable();

      if(depId){
        this.loadProvincias(depId);
      }
    });

    // Reaccionar a cambios de Provincia -> cargar Distritos
    this.form.get('provincia')!.valueChanges.subscribe((provId: number | null) => {
      this.distritos = [];
      this.form.get('distrito')!.reset();
      this.form.get('distrito')!.disable();

      if(provId){
        this.loadDistritos(provId);
      }
    });
  }


/*  onSubmit() {
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
  }*/

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: SolicitudCreateRequest = this.form.value as SolicitudCreateRequest;
    this.service.crearSolicitud(request).subscribe({
      next: (res: SolicitudResponse) => {
        this.mensaje = `Solicitud creada con código: ${res.codigo}`;
        // Resetea el form conversando algunos defaults
        this.form.reset({
          tipoSolicitante: 'Persona Natural',
          pais: 'Perú',
          medioEntrega: 'DIGITAL',
          modalidadNotificacion: 'VIRTUAL',
          aceptaTerminos: false
        });
        // Deshabilita cascada nuevamente
        this.form.get('provincia')!.disable();
        this.form.get('distrito')!.disable();
      },
      error: (err) => {
        this.mensaje = 'Error al registrar la solicitud';
        console.log(err);
      }
    });
  }

  // ----------------------------------------------------------------------------------------------------------------------

  //Helper de Carga
  private loadDepartamentos(): void {
    this.loadingDepartamentos = true;
    this.ubigeoService.listDepartamentos()
      .pipe(finalize(() => ( this.loadingDepartamentos = false)))
      .subscribe({
        next: (deps) => (this.departamentos = deps),
        error: () => (this.mensaje = 'No se pudieron cargar los departamentos')
      });
  }

  private loadProvincias(departamentoId: number): void {
    this.loadingProvincias = true;
    this.ubigeoService.listProvincias(departamentoId)
      .pipe(finalize(() => (this.loadingProvincias = false)))
      .subscribe({
        next: (provs) => {
          this.provincias = (provs || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
          this.form.get('provincia')!.enable();
        },
        error: () => (this.mensaje = 'No se pudieron cargar las provincias')
      });
  }

  private loadDistritos(provinciaId: number): void {
    this.loadingDistritos = true;
    this.ubigeoService.listDistritos(provinciaId)
      .pipe(finalize(() => (this.loadingDistritos = false)))
      .subscribe({
        next: (dists) => {
          this.distritos = (dists || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
          this.form.get('distrito')!.enable();
        },
        error: () => (this.mensaje = 'No se pudieron cargar los distritos')
      });
  }


  // trackBy para performance en *ngFor
  trackById = (_: number, item: { id: number }) => item.id;

}
