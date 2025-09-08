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
    tipoDocumento:['',Validators.required],
    numeroDocumento:['',[Validators.required, Validators.minLength(4)]],
    // Ubigeo (guardamos IDs)
    // 👇 agrega este campo nuevo
    residenciaTipo: ['Peru', Validators.required],

    pais: ['', Validators.required],
    departamento:[{ value: null, disabled: false }],
    provincia:   [{ value: null, disabled: true  }],
    distrito:    [{ value: null, disabled: true  }],
    direccion:['',Validators.required],
    // Contacto
    email:['',[Validators.required, Validators.email]],
    telefono:[''],
    edad:[''],
    sexo:[''],
    autoidentificacionEtnica:[''],
    lenguaMaterna:[''],
    discapacidad:[''],
    areaGeografica:[''],
    areaPertenece:[''],

    // Contenido
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    observaciones: [''],
    // Otros
    archivoAdjunto: [null],
    // Preferencias
    medioEntrega: ['',Validators.required],
    otrosMediosEntrega:[''],
    modalidadNotificacion: ['', Validators.required],
    otrosModalidadesNotificacion:[''],
    aceptaTerminos: [false, Validators.requiredTrue],
  });
}
