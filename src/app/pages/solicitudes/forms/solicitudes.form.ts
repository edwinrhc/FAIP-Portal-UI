import {FormBuilder, Validators} from "@angular/forms";


export function buildSolicitudesForm(fb: FormBuilder){
  return fb.group({
    // Datos Solicitante
    tipoSolicitante: [null,Validators.required],
    nombres:[''],
    apellidos_paterno:[''],
    apellidos_materno:[''],
    razonSocial:[''],

    //Documento
    tipoDocumento:['DNI',Validators.required],
    numeroDocumento:['',[Validators.required, Validators.minLength(4)]],

    // Contacto
    email:['',[Validators.required, Validators.email]],
    telefono:[''],

    // Ubigeo (guardamos IDs)
    departamento:[{ value: null, disabled: false }, Validators.required],
    provincia:   [{ value: null, disabled: true  }, Validators.required],
    distrito:    [{ value: null, disabled: true  }, Validators.required],
    direccion:[''],
    pais: ['Perú'],

    // Contenido
    descripcion: ['', [Validators.required, Validators.minLength(10)]],

    // Preferencias
    medioEntrega: ['DIGITAL', Validators.required],
    modalidadNotificacion: ['VIRTUAL', Validators.required],

    // Otros
    archivoAdjunto: [null],
    observaciones: [''],
    aceptaTerminos: [false, Validators.requiredTrue],
  });
}
