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

type TipoSolicitante = 'Persona Natural' | 'Persona Juridica' | null;

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

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Trae todos los valores, incluso los deshabilitados
    const raw = this.form.getRawValue();

    const tipo = String(raw.tipoSolicitante ?? '');
    const esPN = tipo === 'Persona Natural';
    const esPJ = tipo === 'JURIDICA';
    // Validamos
    const request: SolicitudCreateRequest = {
      // Requeridos
      tipoSolicitante: String(raw.tipoSolicitante),        // string
      tipoDocumento: String(raw.tipoDocumento),            // string
      numeroDocumento: String(raw.numeroDocumento),        // string
      email: String(raw.email),                             // string
      descripcion: String(raw.descripcion),                 // string
      medioEntrega: String(raw.medioEntrega),               // string
      modalidadNotificacion: String(raw.modalidadNotificacion), // string
      aceptaTerminos: Boolean(raw.aceptaTerminos),          // ✅ evita el TS2741

      // Ubigeo por IDs (números)
      departamentoId: Number(raw.departamento),
      provinciaId: Number(raw.provincia),
      distritoId: Number(raw.distrito),

      // Opcionales
      telefono: raw.telefono ? String(raw.telefono) : '',
      direccion: raw.direccion ? String(raw.direccion) : '',
      pais: String(raw.pais ?? 'Perú'),
      observaciones: raw.observaciones ? String(raw.observaciones) : '',

      // Datos según tipo
      nombres: esPN ? String(raw.nombres ?? '') : '',
      apellidos_paterno: esPN ? String(raw.apellidos_paterno ?? '') : '',
      apellidos_materno: esPN ? String(raw.apellidos_materno ?? '') : '',
      razonSocial: esPJ ? String(raw.razonSocial ?? '') : '',
    };

    this.service.crearSolicitud(request).subscribe({
      next: (res: SolicitudResponse) => {
        this.mensaje = `Solicitud creada con código: ${res.codigo}`;
        this.form.reset({
          tipoSolicitante: null,
          tipoDocumento: 'DNI',
          pais: 'Perú',
          medioEntrega: 'DIGITAL',
          modalidadNotificacion: 'VIRTUAL',
          aceptaTerminos: false
        });
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

  // --- WIZARD ---
  currentStep = 1;
  readonly totalSteps = 2;

// Controles que validaré en cada paso
  private step1Controls = [
    'tipoSolicitante',             // requerido
    // Si Persona Natural:
    // 'tipoDocumento','numeroDocumento','nombres','apellidos_paterno','apellidos_materno'
    // Si Jurídica:
    // 'razonSocial'
    'email'                        // requerido
  ];

  private step2Controls = [
    'departamento', 'provincia', 'distrito', // requeridos
    'descripcion',                            // requerido
    'medioEntrega',                           // requerido
    'modalidadNotificacion',                  // requerido
    'aceptaTerminos'                          // requerido true
  ];

  get stepProgressPct(): number {
    return Math.round((this.currentStep / this.totalSteps) * 100);
  }

  goNext() {
    if (this.currentStep === 1 && !this.isStep1Valid()) {
      this.touchStep(1);
      return;
    }
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  isStep1Valid(): boolean {
    // Validación condicional según tipo
    const tipo = this.form.get('tipoSolicitante')?.value as 'Persona Natural'|'JURIDICA'|null;
    let ok = this.step1Controls.every(c => this.form.get(c)?.valid);

    if (tipo === 'Persona Natural') {
      ok = ok
      && this.form.get('tipoDocumento')?.valid
      && this.form.get('numeroDocumento')?.valid
      && this.form.get('nombres')?.value
      && this.form.get('apellidos_paterno')?.value
      && this.form.get('apellidos_materno')?.value
        ? true : false;
    } else if (tipo === 'JURIDICA') {
      ok = ok && !!this.form.get('razonSocial')?.value;
    }
    return !!ok;
  }

  isStep2Valid(): boolean {
    return this.step2Controls.every(c => this.form.get(c)?.valid);
  }

  private touchStep(step: 1|2) {
    const names = step === 1 ? [...this.step1Controls] : [...this.step2Controls];
    const tipo = this.form.get('tipoSolicitante')?.value as 'Persona Natural'|'JURIDICA'|null;

    if (step === 1) {
      if (tipo === 'Persona Natural') {
        names.push('tipoDocumento','numeroDocumento','nombres','apellidos_paterno','apellidos_materno');
      } else if (tipo === 'JURIDICA') {
        names.push('razonSocial');
      }
    }

    names.forEach(n => this.form.get(n)?.markAsTouched());
  }


  get tipoSolicitante(): TipoSolicitante {
      return (this.form.get('tipoSolicitante')?.value ?? null) as TipoSolicitante;
  }

  isPersonaNatural(): boolean {
    return this.tipoSolicitante === 'Persona Natural';
  }

  isJuridica(): boolean {
    return this.tipoSolicitante === 'Persona Juridica';
  }

  get nombreDepartamento(): string {
    const id = this.form.get('departamento')?.value as number | null;
    const dep = this.departamentos.find(d => d.id === id);
    return dep?.nombre ?? '—';
  }

  get nombreProvincia(): string {
    const id = this.form.get('provincia')?.value as number | null;
    const prov = this.provincias.find(p => p.id === id);
    return prov?.nombre ?? '—';
  }

  get nombreDistrito(): string {
    const id = this.form.get('distrito')?.value as number | null;
    const dist = this.distritos.find(d => d.id === id);
    return dist?.nombre ?? '—';
  }

}
