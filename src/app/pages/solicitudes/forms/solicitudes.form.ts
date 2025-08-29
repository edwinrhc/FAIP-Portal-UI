import {FormBuilder, Validators} from "@angular/forms";


export function buildSolicitudesForm(fb: FormBuilder){
  return fb.group({

    tipoSolicitante: ['Persona Natural',Validators.required],
    nombres:[''],
    apellidos_paterno:[''],
    apellidos_materno:[''],
    razonSocial:[''],
    tipoDocumento:['DNI',Validators.required],
    numeroDocumento:['',[Validators.required, Validators.minLength(4)]],
    email:['',[Validators.required, Validators.email]],
    telefono:[''],
    direccion:[''],
    distrito:[''],
    provincia:[''],
    departamento:[''],
    pais: ['Perú'],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    medioEntrega: ['DIGITAL', Validators.required],
    modalidadNotificacion: ['VIRTUAL', Validators.required],
    archivoAdjunto: [null],
    observaciones: [''],
    aceptaTerminos: [false, Validators.requiredTrue],
  });
}
