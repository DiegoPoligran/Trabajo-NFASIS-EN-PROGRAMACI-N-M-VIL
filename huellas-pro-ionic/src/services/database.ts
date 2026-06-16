import { reactive } from 'vue';

const DB_KEY = 'huellasPro.db.v1';

// Estado reactivo global
export const dbState = reactive({
  data: null as any
});

// ─── FUNCIONES CORE DE BASE DE DATOS ─────────────────────────────────────

function createDefaultDb() {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  return {
    version: 1,
    usuario: [
      {
        ID_usuario: 'user_admin',
        nombre_completo: 'Administrador',
        correo_electronico: 'admin@huellaspro.com',
        telefono: '',
        ciudad_ubicacion_general: 'Bogotá',
        fecha_registro: today,
        estado_cuenta: 'activo',
        rol_usuario: 'admin',
        verificado: true
      },
      {
        ID_usuario: 'user_Diego',
        nombre_completo: 'Diego',
        correo_electronico: 'diegojimenz48@gmail.com',
        telefono: '',
        ciudad_ubicacion_general: 'Bogotá',
        fecha_registro: today,
        estado_cuenta: 'activo',
        rol_usuario: 'refugio',
        verificado: true
      },
      {
        ID_usuario: 'user_miguel',
        nombre_completo: 'miguel',
        correo_electronico: 'miguelangelangelroapinzon99@gmail.com',
        telefono: '',
        ciudad_ubicacion_general: 'Bogotá',
        fecha_registro: today,
        estado_cuenta: 'activo',
        rol_usuario: 'usuario',
        verificado: true
      }
    ],
    perfiles_usuario: [
      {
        ID_perfil: 'profile_admin',
        ID_usuario: 'user_admin',
        foto_perfil: '',
        biografia_descripcion: 'Administrador de HuellasPro.',
        preferencias: ['administración'],
        configuracion_privacidad: 'privado'
      },
      {
        ID_perfil: 'profile_Diego',
        ID_usuario: 'user_diego',
        foto_perfil: '',
        biografia_descripcion: 'Refugio aliado en Bogotá.',
        preferencias: ['perros', 'gatos'],
        configuracion_privacidad: 'publico'
      },
      {
        ID_perfil: 'profile_miguel',
        ID_usuario: 'user_miguel',
        foto_perfil: '',
        biografia_descripcion: 'Adoptante registrado.',
        preferencias: ['perros'],
        configuracion_privacidad: 'publico'
      }
    ],
    credenciales_seguridad: [
      {
        ID_credencial: 'cred_admin',
        ID_usuario: 'user_admin',
        contrasena_hash: encodeCredential('admin123*'),
        intentos_fallidos_login: 0,
        fecha_ultimo_login: '',
        token_recuperacion_contrasena: '',
        fecha_expiracion_token: '',
        autenticacion_doble_factor: false
      },
      {
        ID_credencial: 'cred_diego',
        ID_usuario: 'user_diego',
        contrasena_hash: encodeCredential('123456*'),
        intentos_fallidos_login: 0,
        fecha_ultimo_login: '',
        token_recuperacion_contrasena: '',
        fecha_expiracion_token: '',
        autenticacion_doble_factor: false
      },
      {
        ID_credencial: 'cred_miguel',
        ID_usuario: 'user_miguel',
        contrasena_hash: encodeCredential('123456'),
        intentos_fallidos_login: 0,
        fecha_ultimo_login: '',
        token_recuperacion_contrasena: '',
        fecha_expiracion_token: '',
        autenticacion_doble_factor: false
      }
    ],
    historial_actividad: [],
    historial_cambios: [],
    notificaciones: [],
    favoritos_intereses: [],
    solicitudes_adopcion: [],
    reportes_denuncias: [],
    configuracion_cuenta: [],
    animales_adopcion: getSeedAnimals(),
    conversaciones: [],
    mensajes: [],
    campanas: [],
    eventos_refugio: [],
    noticias_destacadas: [],
    contenido_educativo: [],
    comentarios_comunidad: [],
    asistencias_eventos: [],
    satisfaccion_formularios: []
  };
}

function getSeedAnimals() {
  return [
    {
      ID_animal: 'animal_max',
      ID_refugio: 'user_miguel',
      nombre: 'Max',
      especie: 'perros',
      raza: 'CRIOLLO',
      edad: '2 AÑOS',
      ciudad: 'Bogotá',
      ubicacion_key: 'bogota',
      estado_salud: 'sano',
      tamano: 'mediano',
      sexo: 'Macho',
      vacunado: 'Vacunado',
      esterilizado: 'Esterilizado',
      imagen: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=400&q=80',
      descripcion: 'Un compañero leal que busca una familia activa. Fue rescata...',
      historia: 'Un compañero leal que busca una familia activa. Fue rescatado y hoy está listo para compartir paseos, juegos y una nueva vida llena de cuidado.',
      estado_publicacion: 'publicado'
    },
    {
      ID_animal: 'animal_luna',
      ID_refugio: 'user_miguel',
      nombre: 'Luna',
      especie: 'gatos',
      raza: 'ANGORA',
      edad: '1 AÑO',
      ciudad: 'Medellín',
      ubicacion_key: 'medellin',
      estado_salud: 'sano',
      tamano: 'pequeno',
      sexo: 'Hembra',
      vacunado: 'Vacunada',
      esterilizado: 'Esterilizada',
      imagen: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
      descripcion: 'Luna es muy tranquila y amorosa. Ideal para...',
      historia: 'Luna es muy tranquila y amorosa. Ideal para una familia calmada que quiera una compañía tierna, curiosa y de hábitos serenos.',
      estado_publicacion: 'publicado'
    },
    {
      ID_animal: 'animal_simba',
      ID_refugio: 'user_miguel',
      nombre: 'Simba',
      especie: 'perros',
      raza: 'GOLDEN',
      edad: '3 AÑOS',
      ciudad: 'Cali',
      ubicacion_key: 'cali',
      estado_salud: 'tratamiento',
      tamano: 'grande',
      sexo: 'Macho',
      vacunado: 'Vacunado',
      esterilizado: 'Esterilizado',
      imagen: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
      descripcion: 'Rescatado en condiciones difíciles, hoy es el perro más...',
      historia: 'Rescatado en condiciones difíciles, hoy es el perro más noble del refugio. Simba necesita una familia paciente que lo acompañe mientras termina su recuperación.',
      estado_publicacion: 'publicado'
    },
    {
      ID_animal: 'animal_boby',
      ID_refugio: 'user_miguel',
      nombre: 'Boby',
      especie: 'perros',
      raza: 'CRIOLLO',
      edad: 'RECIÉN LLEGADO',
      ciudad: 'Bogotá',
      ubicacion_key: 'bogota',
      estado_salud: 'sano',
      tamano: 'pequeno',
      sexo: 'Macho',
      vacunado: 'Vacunado',
      esterilizado: 'Esterilizado',
      imagen: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80',
      descripcion: 'En la taxonomía o clasificación científica de los seres vivos...',
      historia: 'Boby es pequeño, sociable y muy expresivo. Disfruta los paseos cortos y se adapta bien a hogares con rutinas tranquilas.',
      estado_publicacion: 'publicado'
    },
    {
      ID_animal: 'animal_123',
      ID_refugio: 'user_miguel',
      nombre: '123',
      especie: 'perros',
      raza: 'DALGO',
      edad: 'RECIÉN LLEGADO',
      ciudad: 'Bogotá',
      ubicacion_key: 'bogota',
      estado_salud: 'tratamiento',
      tamano: 'mediano',
      sexo: 'Macho',
      vacunado: 'Vacunado',
      esterilizado: 'Pendiente',
      imagen: '',
      descripcion: 'sdegsdg65',
      historia: 'Este perrito está recién llegado y se encuentra en valoración. Busca una familia responsable que pueda darle seguimiento y mucho cariño.',
      estado_publicacion: 'publicado'
    },
    {
      ID_animal: 'animal_dragon',
      ID_refugio: 'user_miguel',
      nombre: 'Dragon',
      especie: 'gatos',
      raza: 'CRIOLLO',
      edad: 'RECIÉN LLEGADO',
      ciudad: 'Bogotá',
      ubicacion_key: 'bogota',
      estado_salud: 'sano',
      tamano: 'pequeno',
      sexo: 'Macho',
      vacunado: 'Vacunado',
      esterilizado: 'Esterilizado',
      imagen: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80',
      descripcion: 'Rescatado y listo para una nueva oportunidad.',
      historia: 'Dragon es curioso, activo y muy atento a las personas. Está listo para una adopción responsable.',
      estado_publicacion: 'publicado'
    },
    {
      ID_animal: 'animal_4',
      ID_refugio: 'user_miguel',
      nombre: '4',
      especie: 'perros',
      raza: 'CRIOLLO',
      edad: '1 AÑO',
      ciudad: 'Cartagena',
      ubicacion_key: 'cartagena',
      estado_salud: 'sano',
      tamano: 'mediano',
      sexo: 'Hembra',
      vacunado: 'Vacunada',
      esterilizado: 'Esterilizada',
      imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
      descripcion: 'Una pareja de amigos en búsqueda de hogar.',
      historia: 'Este caso busca una familia que pueda brindar estabilidad y acompañamiento.',
      estado_publicacion: 'publicado'
    },
    {
      ID_animal: 'animal_555',
      ID_refugio: 'user_miguel',
      nombre: '555',
      especie: 'perros',
      raza: 'CRIOLLO',
      edad: '2 AÑOS',
      ciudad: 'Barranquilla',
      ubicacion_key: 'barranquilla',
      estado_salud: 'sano',
      tamano: 'grande',
      sexo: 'Macho',
      vacunado: 'Vacunado',
      esterilizado: 'Esterilizado',
      imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
      descripcion: 'Compañero sociable y juguetón.',
      historia: '555 es noble, juguetón y necesita una familia con tiempo para paseos y rutinas.',
      estado_publicacion: 'publicado'
    }
  ];
}

function ensureDb(): any {
  const current = readDb(false);
  const baseline = createDefaultDb();
  let db = current || baseline;

  // Asegurar que todas las claves existan
  Object.keys(baseline).forEach(key => {
    if (db[key] === undefined) db[key] = baseline[key];
  });

  // Asegurar que todos los arrays existan
  const arrayKeys = [
    'usuario', 'perfiles_usuario', 'credenciales_seguridad',
    'historial_actividad', 'historial_cambios', 'notificaciones',
    'favoritos_intereses', 'solicitudes_adopcion', 'reportes_denuncias',
    'configuracion_cuenta', 'animales_adopcion', 'conversaciones',
    'mensajes', 'campanas', 'eventos_refugio', 'noticias_destacadas',
    'contenido_educativo', 'comentarios_comunidad', 'asistencias_eventos',
    'satisfaccion_formularios'
  ];

  arrayKeys.forEach(key => {
    if (!Array.isArray(db[key])) db[key] = [];
  });

  // Agregar usuarios seed si no existen
  baseline.usuario.forEach((seedUser: any) => {
    if (!db.usuario.some((user: any) => user.ID_usuario === seedUser.ID_usuario)) {
      db.usuario.push(seedUser);
    }
  });

  // Agregar animales seed si no existen
  baseline.animales_adopcion.forEach((seedAnimal: any) => {
    if (!db.animales_adopcion.some((animal: any) => animal.ID_animal === seedAnimal.ID_animal)) {
      db.animales_adopcion.push(seedAnimal);
    }
  });

  saveDb(db);
  return db;
}

function readDb(ensure = true): any {
  try {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) return ensure ? ensureDb() : null;
    return JSON.parse(stored);
  } catch {
    return ensure ? createDefaultDb() : null;
  }
}

function saveDb(db: any) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  // Actualizar estado reactivo
  dbState.data = { ...db };
}

function encodeCredential(value: string): string {
  return btoa(unescape(encodeURIComponent(`huellas:${value}`)));
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── SERVICIO PRINCIPAL ──────────────────────────────────────────────

export const DatabaseService = {
  // Inicialización
  init: () => {
    dbState.data = ensureDb();
  },

  // Lectura directa (para casos especiales)
  readDb: (): any => readDb(),

  saveDb: (db: any) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    // Actualizar estado reactivo
    dbState.data = { ...db };
  },

  // Usuarios
  getUsuarios: (): any[] => dbState.data?.usuario || [],

  getUsuarioById: (userId: string): any => {
    return dbState.data?.usuario.find((u: any) => u.ID_usuario === userId);
  },

  // Perfiles
  getPerfiles: (): any[] => dbState.data?.perfiles_usuario || [],

  getPerfilByUserId: (userId: string): any => {
    return dbState.data?.perfiles_usuario.find((p: any) => p.ID_usuario === userId);
  },

  // Credenciales
  getCredenciales: (): any[] => dbState.data?.credenciales_seguridad || [],

  getCredentialByUserId: (userId: string): any => {
    return dbState.data?.credenciales_seguridad.find((c: any) => c.ID_usuario === userId);
  },

  // Animales
  getAnimales: (): any[] => dbState.data?.animales_adopcion || [],

  getAnimalesDisponibles: (): any[] => {
    return (dbState.data?.animales_adopcion || []).filter(
      (a: any) => a.estado_publicacion === 'publicado'
    );
  },

  getAnimalById: (animalId: string): any => {
    return dbState.data?.animales_adopcion.find((a: any) => a.ID_animal === animalId);
  },

  createAnimal: (animalData: any) => {
    const db = readDb();
    const newAnimal = {
      ID_animal: makeId('animal'),
      ...animalData,
      estado_publicacion: 'publicado',
      fecha_creacion: new Date().toISOString()
    };

    db.animales_adopcion.push(newAnimal);
    saveDb(db);
    return newAnimal;
  },

  updateAnimal: (animalId: string, updates: any) => {
    const db = readDb();
    const index = db.animales_adopcion.findIndex((a: any) => a.ID_animal === animalId);

    if (index === -1) return null;

    db.animales_adopcion[index] = {
      ...db.animales_adopcion[index],
      ...updates,
      fecha_actualizacion: new Date().toISOString()
    };

    saveDb(db);
    return db.animales_adopcion[index];
  },

  deleteAnimal: (animalId: string) => {
    const db = readDb();
    const index = db.animales_adopcion.findIndex((a: any) => a.ID_animal === animalId);

    if (index === -1) return false;

    db.animales_adopcion.splice(index, 1);
    saveDb(db);
    return true;
  },

  // Solicitudes de adopción
  getSolicitudes: (): any[] => dbState.data?.solicitudes_adopcion || [],

  getSolicitudesByUsuario: (userId: string): any[] => {
    return (dbState.data?.solicitudes_adopcion || []).filter(
      (s: any) => s.ID_usuario === userId
    );
  },

  getSolicitudesByRefugio: (refugioId: string): any[] => {
    const db = dbState.data;
    if (!db) return [];

    // Obtener animales de este refugio
    const animalesRefugio = db.animales_adopcion
      .filter((a: any) => a.ID_refugio === refugioId)
      .map((a: any) => a.ID_animal);

    // Filtrar solicitudes de esos animales
    return db.solicitudes_adopcion.filter(
      (s: any) => animalesRefugio.includes(s.ID_animal)
    );
  },

  crearSolicitud: (userId: string, animalId: string, comentarios = '') => {
    const db = readDb();
    const nuevaSolicitud = {
      ID_solicitud: makeId('sol'),
      ID_usuario: userId,
      ID_animal: animalId,
      estado_solicitud: 'pendiente',
      fecha_solicitud: new Date().toISOString().slice(0, 10),
      comentarios_usuario: comentarios,
      calificacion: 'BUENA'
    };

    db.solicitudes_adopcion.push(nuevaSolicitud);
    saveDb(db);
    return nuevaSolicitud;
  },

  actualizarEstadoSolicitud: (solicitudId: string, nuevoEstado: string) => {
    const db = readDb();
    const solicitud = db.solicitudes_adopcion.find((s: any) => s.ID_solicitud === solicitudId);

    if (!solicitud) return null;

    solicitud.estado_solicitud = nuevoEstado;
    saveDb(db);
    return solicitud;
  },

  // Favoritos
  getFavoritos: (userId: string): any[] => {
    return (dbState.data?.favoritos_intereses || []).filter(
      (f: any) => f.ID_usuario === userId
    );
  },

  agregarFavorito: (userId: string, animalId: string) => {
    const db = readDb();
    const existe = db.favoritos_intereses.some(
      (f: any) => f.ID_usuario === userId && f.ID_animal === animalId
    );

    if (!existe) {
      db.favoritos_intereses.push({
        ID_favorito: makeId('fav'),
        ID_usuario: userId,
        ID_animal: animalId,
        fecha_guardado: new Date().toISOString().slice(0, 10)
      });
      saveDb(db);
      return true;
    }
    return false;
  },

  eliminarFavorito: (userId: string, animalId: string) => {
    const db = readDb();
    const index = db.favoritos_intereses.findIndex(
      (f: any) => f.ID_usuario === userId && f.ID_animal === animalId
    );

    if (index !== -1) {
      db.favoritos_intereses.splice(index, 1);
      saveDb(db);
      return true;
    }
    return false;
  },

  // Denuncias/Reportes
  getDenuncias: (): any[] => dbState.data?.reportes_denuncias || [],

  crearDenuncia: (denunciaData: any) => {
    const db = readDb();
    const nuevaDenuncia = {
      ID_denuncia: makeId('den'),
      estado: 'revision',
      fecha_creacion: new Date().toISOString(),
      ...denunciaData
    };

    db.reportes_denuncias.push(nuevaDenuncia);
    saveDb(db);
    return nuevaDenuncia;
  },

  // Contenido (Campañas, Eventos, Noticias, Educación)
  getCampanas: (): any[] => dbState.data?.campanas || [],
  getEventos: (): any[] => dbState.data?.eventos_refugio || [],
  getNoticias: (): any[] => dbState.data?.noticias_destacadas || [],
  getContenidoEducativo: (): any[] => dbState.data?.contenido_educativo || [],

  crearContenido: (tipo: string, contenidoData: any) => {
    const db = readDb();
    const tipoMap: Record<string, string> = {
      campana: 'campanas',
      evento: 'eventos_refugio',
      noticia: 'noticias_destacadas',
      educacion: 'contenido_educativo'
    };

    const collection = tipoMap[tipo];
    if (!collection) return null;

    const nuevoContenido = {
      ID_contenido: makeId(tipo),
      fecha_creacion: new Date().toISOString(),
      ...contenidoData
    };

    db[collection].push(nuevoContenido);
    saveDb(db);
    return nuevoContenido;
  },

  // Comentarios/Comunidad
  getComentarios: (): any[] => dbState.data?.comentarios_comunidad || [],

  crearComentario: (comentarioData: any) => {
    const db = readDb();
    const nuevoComentario = {
      ID_comentario: makeId('comment'),
      likes: [],
      fecha_creacion: new Date().toISOString(),
      ...comentarioData
    };

    db.comentarios_comunidad.push(nuevoComentario);
    saveDb(db);
    return nuevoComentario;
  },

  // Conversaciones/Mensajes
  getConversaciones: (userId: string): any[] => {
    return (dbState.data?.conversaciones || []).filter(
      (c: any) => c.participantes.includes(userId)
    );
  },

  getMensajes: (conversationId: string): any[] => {
    return (dbState.data?.mensajes || []).filter(
      (m: any) => m.ID_conversacion === conversationId
    );
  },

  crearMensaje: (mensajeData: any) => {
    const db = readDb();
    const nuevoMensaje = {
      ID_mensaje: makeId('msg'),
      fecha_envio: new Date().toISOString(),
      ...mensajeData
    };

    db.mensajes.push(nuevoMensaje);
    saveDb(db);
    return nuevoMensaje;
  },

  // Notificaciones
  getNotificaciones: (userId: string): any[] => {
    return (dbState.data?.notificaciones || []).filter(
      (n: any) => n.ID_usuario === userId
    );
  },

  crearNotificacion: (userId: string, tipo: string, contenido: string) => {
    const db = readDb();
    const nuevaNotificacion = {
      ID_notificacion: makeId('notif'),
      ID_usuario: userId,
      tipo_notificacion: tipo,
      contenido: contenido,
      leida: false,
      fecha_envio: new Date().toISOString()
    };

    db.notificaciones.push(nuevaNotificacion);
    saveDb(db);
    return nuevaNotificacion;
  },

  // Utilidades
  encodeCredential: (value: string): string => encodeCredential(value),
  makeId: (prefix: string): string => makeId(prefix)
};

// Inicializar al cargar
DatabaseService.init();