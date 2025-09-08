import { Component, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { SolicitudesService } from "./services/solicitudes.service";
import { buildSolicitudesForm } from "./forms/solicitudes.form";
import { SolicitudCreateRequest } from "./models/solicitud-create-request.model";
import { SolicitudResponse } from "./models/solicitud-response";
import { UbigeoService } from "./services/ubigeo.service";
import { DepartamentoResponse } from "./models/DepartamentoResponse";
import { ProvinciaResponse } from "./models/ProvinciaResponse";
import { DistritoResponse } from "./models/DistritoResponse";
import { finalize } from "rxjs";
import { TipoSolicitanteEnum } from "./models/Tipo-Solicitante.enum";

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.css']
})
export class SolicitudesComponent implements OnInit {

  public TipoSolicitanteEnum = TipoSolicitanteEnum;

  mensaje: string | null = null;
  form = buildSolicitudesForm(this.fb);

  departamentos: DepartamentoResponse[] = [];
  provincias: ProvinciaResponse[] = [];
  distritos: DistritoResponse[] = [];

  loadingDepartamentos = false;
  loadingProvincias = false;
  loadingDistritos = false;

  // --- Wizard ---
  currentStep = 1;
  readonly totalSteps = 2;

  constructor(
    private fb: FormBuilder,
    private service: SolicitudesService,
    private ubigeoService: UbigeoService
  ) {}

  ngOnInit(): void {
    this.loadDepartamentos();
    this.form.get('pais')?.setValue('Perú');

    // Departamentos -> Provincias
    this.form.get('departamento')!.valueChanges.subscribe((depId: number | null) => {
      this.provincias = [];
      this.distritos = [];
      this.form.get('provincia')!.reset();
      this.form.get('distrito')!.reset();
      this.form.get('provincia')!.disable();
      this.form.get('distrito')!.disable();

      if (depId) {
        this.loadProvincias(depId);
      }
    });

    // Provincias -> Distritos
    this.form.get('provincia')!.valueChanges.subscribe((provId: number | null) => {
      this.distritos = [];
      this.form.get('distrito')!.reset();
      this.form.get('distrito')!.disable();

      if (provId) {
        this.loadDistritos(provId);
      }
    });

    this.form.get('residenciaTipo')?.valueChanges.subscribe(value => {
      if(value === 'Peru'){
        this.form.get('pais')?.setValue('Perú');
        this.form.get('pais')?.disable();
        this.form.get('departamento')?.reset();
        this.form.get('provincia')?.reset();
        this.form.get('distrito')?.reset();
        this.form.get('direccion')?.reset();

      } else {
        this.form.get('pais')?.reset();
        this.form.get('pais')?.enable();
        this.form.get('direccion')?.reset();
      }
    })

  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const tipo = raw.tipoSolicitante as TipoSolicitanteEnum | null;
    const esPN = tipo === TipoSolicitanteEnum.PERSONA_NATURAL;
    const esPJ = tipo === TipoSolicitanteEnum.JURIDICA;

    const request: SolicitudCreateRequest = {
      tipoSolicitante: String(raw.tipoSolicitante),
      tipoDocumento: String(raw.tipoDocumento),
      numeroDocumento: String(raw.numeroDocumento),
      email: String(raw.email),
      descripcion: String(raw.descripcion),
      medioEntrega: String(raw.medioEntrega),
      modalidadNotificacion: String(raw.modalidadNotificacion),
      aceptaTerminos: Boolean(raw.aceptaTerminos),

      departamento: Number(raw.departamento),
      provincia: Number(raw.provincia),
      distrito: Number(raw.distrito),

      telefono: raw.telefono ? String(raw.telefono) : '',
      direccion: raw.direccion ? String(raw.direccion) : '',
      pais: String(raw.pais),
      observaciones: raw.observaciones ? String(raw.observaciones) : '',

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
          pais: '',
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

  // --- Helpers de carga ---
  private loadDepartamentos(): void {
    this.loadingDepartamentos = true;
    this.ubigeoService.listDepartamentos()
      .pipe(finalize(() => (this.loadingDepartamentos = false)))
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

  // --- trackBy ---
  trackById = (_: number, item: { id: number }) => item.id;

  // --- Wizard ---
  private step1Controls = ['tipoSolicitante', 'email'];
  private step2Controls = ['departamento','provincia','distrito','descripcion','medioEntrega','modalidadNotificacion','aceptaTerminos'];

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
    const tipo = this.form.get('tipoSolicitante')?.value as TipoSolicitanteEnum | null;
    let ok = this.step1Controls.every(c => this.form.get(c)?.valid);

    if (tipo === TipoSolicitanteEnum.PERSONA_NATURAL) {
      // @ts-ignore
      ok = ok
        && this.form.get('tipoDocumento')?.valid
        && this.form.get('numeroDocumento')?.valid
        && this.form.get('nombres')?.value
        && this.form.get('apellidos_paterno')?.value
        && this.form.get('apellidos_materno')?.value;
    } else if (tipo === TipoSolicitanteEnum.JURIDICA) {
      ok = ok && !!this.form.get('razonSocial')?.value;
    }
    return !!ok;
  }

  isStep2Valid(): boolean {
    return this.step2Controls.every(c => this.form.get(c)?.valid);
  }

  private touchStep(step: 1|2) {
    const names = step === 1 ? [...this.step1Controls] : [...this.step2Controls];
    const tipo = this.form.get('tipoSolicitante')?.value as TipoSolicitanteEnum | null;

    if (step === 1) {
      if (tipo === TipoSolicitanteEnum.PERSONA_NATURAL) {
        names.push('tipoDocumento','numeroDocumento','nombres','apellidos_paterno','apellidos_materno');
      } else if (tipo === TipoSolicitanteEnum.JURIDICA) {
        names.push('razonSocial');
      }
    }

    names.forEach(n => this.form.get(n)?.markAsTouched());
  }

  // --- Getters para la vista ---
  get tipoSolicitante(): TipoSolicitanteEnum | null {
    return (this.form.get('tipoSolicitante')?.value ?? null) as TipoSolicitanteEnum | null;
  }

  isPersonaNatural(): boolean {
    return this.tipoSolicitante === TipoSolicitanteEnum.PERSONA_NATURAL;
  }

  isJuridica(): boolean {
    return this.tipoSolicitante === TipoSolicitanteEnum.JURIDICA;
  }

  get nombreDepartamento(): string {
    const id = this.form.get('departamento')?.value as number | null;
    return this.departamentos.find(d => d.id === id)?.nombre ?? '—';
  }

  get nombreProvincia(): string {
    const id = this.form.get('provincia')?.value as number | null;
    return this.provincias.find(p => p.id === id)?.nombre ?? '—';
  }

  get nombreDistrito(): string {
    const id = this.form.get('distrito')?.value as number | null;
    return this.distritos.find(d => d.id === id)?.nombre ?? '—';
  }


  onLimpiar(): void {
    this.form.reset({
      tipoSolicitante: null,
      tipoDocumento: 'DNI',
      medioEntrega: 'DIGITAL',
      modalidadNotificacion: 'VIRTUAL',
      aceptaTerminos: false
    });
    this.form.get('provincia')?.disable();
    this.form.get('distrito')?.disable();
  }



}
