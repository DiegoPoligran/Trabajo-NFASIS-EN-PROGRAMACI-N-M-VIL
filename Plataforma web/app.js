// app.js
// ─── CONFIGURACIÓN Y CONSTANTES ─────────────────────────────────────────
// Esta sección define las claves de almacenamiento y las configuraciones de roles y permisos.
const DB_KEY = 'huellasPro.db.v1';
const SESSION_KEY = 'huellasPro.session.v1';
const SELECTED_CONVERSATION_KEY = 'huellasPro.selectedConversation.v1';
const FAVORITES_PAGE_KEY = 'huellasPro.favoritesPage.v1';

const ROLE_LABELS = {
  admin: 'ADMINISTRADOR',
  usuario: 'USUARIO',
  refugio: 'REFUGIO ALIADO'
};

const ROLE_PERMISSIONS = {
  admin: [
    'content:view',
    'comments:create',
    'adoption_requests:manage',
    'shelter_panel:access',
    'animals:create',
    'animals:edit',
    'adoption_requests:review',
    'campaigns:create',
    'events:create',
    'news:create',
    'education:create',
    'admin:access',
    'users:manage',
    'system:configure'
  ],
  usuario: [
    'content:view',
    'comments:create',
    'adoption_requests:manage'
  ],
  refugio: [
    'content:view',
    'comments:create',
    'adoption_requests:manage',
    'shelter_panel:access',
    'animals:create',
    'animals:edit',
    'adoption_requests:review',
    'campaigns:create',
    'events:create',
    'news:create',
    'education:create'
  ]
};

// ─── INICIALIZACIÓN DEL DOM ──────────────────────────────────────────────
// Aquí se gestiona el arranque de la aplicación y la activación de todos los módulos al cargar la página.
document.addEventListener('DOMContentLoaded', () => {
  ensureDb();
  setActivePageLink();
  renderSessionNav();
  applyPermissionGates();
  initCommunityTabs();
  initCommunityComposer();
  initAuthTabs();
  initAuthForms();
  initAdoptionFilters();
  initAdoptionModal();
  initPetPublisherModal();
  initEventsContent();
  initProfilePage();
  initDenunciasLogic();
  initEducationContent();
  initLanguageToggle();

  const observer = new MutationObserver(mutations => {
    let shouldResolve = false;
    mutations.forEach(m => {
      if (m.addedNodes.length > 0) shouldResolve = true;
      if (m.type === 'attributes' && m.attributeName === 'data-idb-src') shouldResolve = true;
    });
    if (shouldResolve) resolveAllIdbMedia();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-idb-src'] });
  resolveAllIdbMedia();
});

// ─── GESTIÓN DE MULTIMEDIA (INDEXEDDB) ───────────────────────────────────
// Esta sección permite manejar archivos pesados (como videos o imágenes grandes) usando la base de datos del navegador.
function resolveAllIdbMedia() {
  const elements = document.querySelectorAll('[data-idb-src]:not([data-idb-resolved])');
  if (elements.length === 0) return;
  
  const request = indexedDB.open('HuellasProMedia', 1);
  request.onsuccess = e => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('media')) return;
    const tx = db.transaction('media', 'readonly');
    const store = tx.objectStore('media');
    
    elements.forEach(el => {
      el.setAttribute('data-idb-resolved', 'true');
      const src = el.getAttribute('data-idb-src');
      const parts = src.split('::');
      if (parts.length === 2) {
        const id = parts[1];
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          if (getReq.result) {
            const blobUrl = URL.createObjectURL(getReq.result);
            if (el.tagName.toLowerCase() === 'a') {
              el.href = blobUrl;
            } else {
              el.src = blobUrl;
            }
          }
        };
      }
    });
  };
}

// ─── ESTRUCTURA DE LA BASE DE DATOS Y SEMILLAS ──────────────────────────
// Aquí se define la estructura inicial (esquema) y los datos de prueba (seeds) de la plataforma.
function createDefaultDb() {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  return {
    version: 1,
    schema: {
      source: 'FIDI Ingenierias - Entrega de Anteproyecto PROYECTOS.docx',
      section: 'DISEÑO DE ESTRUCTURA DE LA BASE DE DATOS',
      entities: [
        'Usuario',
        'Perfil de Usuario',
        'Credenciales y Seguridad',
        'Historial de Actividad',
        'Historial de Cambios',
        'Notificaciones',
        'Favoritos / Intereses',
        'Solicitudes del Usuario (Adopción)',
        'Reportes / Denuncias del Usuario',
        'Configuración de Cuenta'
      ]
    },
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
        ID_usuario: 'user_miguel',
        nombre_completo: 'miguel',
        correo_electronico: 'miguelangelangelroapinzon99@gmail.com',
        telefono: '',
        ciudad_ubicacion_general: 'Bogotá',
        fecha_registro: today,
        estado_cuenta: 'activo',
        rol_usuario: 'refugio',
        verificado: true
      },
      {
        ID_usuario: 'user_felipe',
        nombre_completo: 'felipe',
        correo_electronico: 'felipe@huellaspro.com',
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
        ID_perfil: 'profile_miguel',
        ID_usuario: 'user_miguel',
        foto_perfil: '',
        biografia_descripcion: 'Refugio aliado en Bogotá.',
        preferencias: ['perros', 'gatos'],
        configuracion_privacidad: 'publico'
      },
      {
        ID_perfil: 'profile_felipe',
        ID_usuario: 'user_felipe',
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
        contrasena_hash: encodeCredential('admin123'),
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
      },
      {
        ID_credencial: 'cred_felipe',
        ID_usuario: 'user_felipe',
        contrasena_hash: encodeCredential('123456'),
        intentos_fallidos_login: 0,
        fecha_ultimo_login: '',
        token_recuperacion_contrasena: '',
        fecha_expiracion_token: '',
        autenticacion_doble_factor: false
      }
    ],
    historial_actividad: [
      {
        ID_actividad: 'act_seed',
        ID_usuario: 'user_miguel',
        tipo_accion: 'crear cuenta',
        descripcion: 'Cuenta de refugio aliada creada para la simulación.',
        fecha_hora: now,
        ip_dispositivo: 'localStorage'
      }
    ],
    historial_cambios: [],
    notificaciones: [
      {
        ID_notificacion: 'notif_req_dragon',
        ID_usuario: 'user_miguel',
        tipo_notificacion: 'adopción',
        contenido: 'felipe envió una solicitud para Dragon.',
        leida: false,
        fecha_envio: now
      }
    ],
    favoritos_intereses: [
      { ID_favorito: 'fav_max', ID_usuario: 'user_miguel', ID_animal: 'animal_max', fecha_guardado: today },
      { ID_favorito: 'fav_luna', ID_usuario: 'user_miguel', ID_animal: 'animal_luna', fecha_guardado: today },
      { ID_favorito: 'fav_simba', ID_usuario: 'user_miguel', ID_animal: 'animal_simba', fecha_guardado: today },
      { ID_favorito: 'fav_dragon', ID_usuario: 'user_miguel', ID_animal: 'animal_dragon', fecha_guardado: today },
      { ID_favorito: 'fav_123', ID_usuario: 'user_miguel', ID_animal: 'animal_123', fecha_guardado: today },
      { ID_favorito: 'fav_4', ID_usuario: 'user_miguel', ID_animal: 'animal_4', fecha_guardado: today },
      { ID_favorito: 'fav_555', ID_usuario: 'user_miguel', ID_animal: 'animal_555', fecha_guardado: today }
    ],
    solicitudes_adopcion: [
      {
        ID_solicitud: 'sol_dragon',
        ID_usuario: 'user_felipe',
        ID_animal: 'animal_dragon',
        estado_solicitud: 'pendiente',
        fecha_solicitud: today,
        comentarios_usuario: 'fjghjghjhj',
        calificacion: 'BUENA'
      }
    ],
    reportes_denuncias: [],
    configuracion_cuenta: [
      {
        ID_configuracion: 'config_miguel',
        ID_usuario: 'user_miguel',
        idioma: 'es',
        notificaciones_activas: true,
        privacidad_perfil: 'publico'
      },
      {
        ID_configuracion: 'config_felipe',
        ID_usuario: 'user_felipe',
        idioma: 'es',
        notificaciones_activas: true,
        privacidad_perfil: 'publico'
      }
    ],
    animales_adopcion: getSeedAnimals(),
    conversaciones: [
      {
        ID_conversacion: 'conv_felipe_miguel',
        participantes: ['user_miguel', 'user_felipe'],
        titulo: 'Conversación con felipe',
        fecha_creacion: now
      }
    ],
    mensajes: [
      {
        ID_mensaje: 'msg_seed',
        ID_conversacion: 'conv_felipe_miguel',
        ID_usuario: 'user_felipe',
        contenido: 'Hola, me interesa continuar el proceso de adopción.',
        fecha_envio: now
      }
    ],
    campanas: [],
    eventos_refugio: [],
    noticias_destacadas: [],
    contenido_educativo: [],
    comentarios_comunidad: []
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

// ─── FUNCIONES CORE DE BASE DE DATOS ─────────────────────────────────────
// Estas funciones se encargan de leer, guardar y asegurar la integridad de los datos en localStorage.
function ensureDb() {
  const current = readDb(false);
  const baseline = createDefaultDb();
  let db = current || baseline;

  Object.keys(baseline).forEach(key => {
    if (db[key] === undefined) db[key] = baseline[key];
  });

  [
    'usuario',
    'perfiles_usuario',
    'credenciales_seguridad',
    'historial_actividad',
    'historial_cambios',
    'notificaciones',
    'favoritos_intereses',
    'solicitudes_adopcion',
    'reportes_denuncias',
    'configuracion_cuenta',
    'animales_adopcion',
    'conversaciones',
    'mensajes',
    'campanas',
    'eventos_refugio',
    'noticias_destacadas',
    'contenido_educativo',
    'comentarios_comunidad',
    'asistencias_eventos',
    'satisfaccion_formularios'
  ].forEach(key => {
    if (!Array.isArray(db[key])) db[key] = [];
  });

  baseline.usuario.forEach(seedUser => {
    if (!db.usuario.some(user => user.ID_usuario === seedUser.ID_usuario)) db.usuario.push(seedUser);
  });

  baseline.animales_adopcion.forEach(seedAnimal => {
    if (!db.animales_adopcion.some(animal => animal.ID_animal === seedAnimal.ID_animal)) {
      db.animales_adopcion.push(seedAnimal);
    }
  });

  saveDb(db);
  return db;
}

function readDb(ensure = true) {
  try {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) return ensure ? ensureDb() : null;
    return JSON.parse(stored);
  } catch {
    return ensure ? createDefaultDb() : null;
  }
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function encodeCredential(value) {
  return btoa(unescape(encodeURIComponent(`huellas:${value}`)));
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── GESTIÓN DE SESIÓN Y SEGURIDAD ──────────────────────────────────────
// Controla el inicio de sesión, cierre de sesión y la validación de permisos de usuario.
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    ID_usuario: user.ID_usuario,
    rol_usuario: user.rol_usuario,
    nombre_completo: user.nombre_completo || user.nombre || '',
    started_at: new Date().toISOString()
  }));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getCurrentUser() {
  const session = getSession();
  if (!session?.ID_usuario) return null;
  const db = readDb();
  return db.usuario.find(user => user.ID_usuario === session.ID_usuario && user.estado_cuenta === 'activo') || null;
}

function hasPermission(permission, user = getCurrentUser()) {
  if (!user) return false;
  return (ROLE_PERMISSIONS[user.rol_usuario] || []).includes(permission);
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'HP';
  return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

function roleLabel(role) {
  return ROLE_LABELS[role] || 'USUARIO';
}

// ─── FUNCIONES DE UTILIDAD ──────────────────────────────────────────────
// Herramientas auxiliares para limpieza de datos, formateo de texto y manejo de HTML.
function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function escapeHtml(value = '') {
  const element = document.createElement('div');
  element.textContent = String(value);
  return element.innerHTML;
}

function escapeAttr(value = '') {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

function addActivity(db, userId, action, description) {
  db.historial_actividad.push({
    ID_actividad: makeId('act'),
    ID_usuario: userId,
    tipo_accion: action,
    descripcion: description,
    fecha_hora: new Date().toISOString(),
    ip_dispositivo: 'localStorage'
  });
}

function addChange(db, userId, field, previousValue, nextValue) {
  db.historial_cambios.push({
    ID_cambio: makeId('chg'),
    ID_usuario: userId,
    campo_modificado: field,
    valor_anterior: previousValue,
    valor_nuevo: nextValue,
    fecha_cambio: new Date().toISOString()
  });
}

function addNotification(db, userId, type, content) {
  db.notificaciones.push({
    ID_notificacion: makeId('notif'),
    ID_usuario: userId,
    tipo_notificacion: type,
    contenido: content,
    leida: false,
    fecha_envio: new Date().toISOString()
  });
}

// ─── INTERFAZ DE USUARIO Y NAVEGACIÓN ───────────────────────────────────
// Gestiona los estados visuales de la navegación, avatares de sesión y visibilidad de elementos.
function setActivePageLink() {
  const current = document.body.dataset.page;
  document.querySelectorAll('[data-page-link]').forEach(link => {
    const target = link.dataset.pageLink;
    if (target === current) {
      link.classList.add('page-link-active');
      link.classList.remove('text-gray-500', 'font-medium', 'text-gray-400');
    } else {
      link.classList.remove('page-link-active');
    }
  });
}

function renderSessionNav() {
  const user = getCurrentUser();
  const navGroups = document.querySelectorAll('nav .flex.items-center.gap-4.text-sm.font-medium');
  const navActions = navGroups[navGroups.length - 1];
  if (!navActions || !user) return;

  const db = readDb();
  const profile = db.perfiles_usuario.find(p => p.ID_usuario === user.ID_usuario);
  const foto = profile ? profile.foto_perfil : '';

  let avatarContent = getInitials(user.nombre_completo);
  if (foto) {
    const isIdb = foto.startsWith('idb://');
    const srcAttr = isIdb ? '' : `src="${escapeAttr(foto)}"`;
    const idbAttr = isIdb ? `data-idb-src="${escapeAttr(foto)}"` : '';
    avatarContent = `<img ${srcAttr} ${idbAttr} alt="Avatar" class="w-full h-full object-cover rounded-[0.9rem]">`;
  }

  navActions.innerHTML = `
    <a href="Perfil.html#info" class="text-right leading-tight hover:text-brand-blue transition">
      <span class="block text-[10px] text-brand-blue font-bold uppercase tracking-wider">${roleLabel(user.rol_usuario)}</span>
      <span class="block text-brand-dark font-bold">${user.nombre_completo}</span>
    </a>
    <a href="Perfil.html#info" class="session-avatar relative overflow-hidden flex items-center justify-center p-0" aria-label="Abrir perfil">
      ${avatarContent}
    </a>
    <button type="button" class="text-gray-300 hover:text-brand-blue transition" data-logout aria-label="Cerrar sesión">
      <i class="fa-solid fa-right-from-bracket"></i>
    </button>
    <div data-lang-toggle class="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md text-xs cursor-pointer border border-gray-100">
      <span class="lang-text">ES</span> <i class="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
    </div>
  `;

  navActions.querySelector('[data-logout]')?.addEventListener('click', () => {
    clearSession();
    window.location.href = 'LoginYUnete.html#login';
  });
}

function applyPermissionGates() {
  const user = getCurrentUser();
  document.querySelectorAll('[data-requires-permission]').forEach(element => {
    element.classList.toggle('hidden', !hasPermission(element.dataset.requiresPermission, user));
  });
}

// ─── SECCIÓN DE COMUNIDAD ────────────────────────────────────────────────
// Lógica para el foro de la comunidad, manejo de pestañas, comentarios y respuestas.
function initCommunityTabs() {
  const communityRoot = document.querySelector('[data-community-root]');
  if (!communityRoot) return;

  const tabs = document.querySelectorAll('.community-tab');
  const feeds = document.querySelectorAll('.community-feed');

  function activate(tabId) {
    feeds.forEach(feed => {
      feed.classList.toggle('hidden', feed.dataset.feed !== tabId);
    });

    tabs.forEach(tab => {
      const isActive = tab.dataset.tab === tabId;
      tab.classList.toggle('community-active-tab', isActive);
      tab.classList.toggle('text-gray-600', !isActive);
      tab.classList.toggle('hover:bg-gray-50', !isActive);
    });
    
    if (window.resetCommunityComposer) window.resetCommunityComposer();
    renderCommunityComments(tabId);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab.dataset.tab));
  });

  activate(communityRoot.dataset.defaultTab || 'general');
}

function initCommunityComposer() {
  const composer = document.querySelector('[data-community-composer]');
  const input = document.querySelector('[data-community-input]');
  const submit = document.querySelector('[data-community-submit]');
  if (!composer || !input || !submit) return;

  const user = getCurrentUser();
  const avatar = document.querySelector('[data-community-avatar]');
  if (avatar) {
    if (user) {
      const db = readDb();
      const profile = db.perfiles_usuario.find(p => p.ID_usuario === user.ID_usuario);
      const foto = profile ? profile.foto_perfil : '';
      if (foto) {
        const isIdb = foto.startsWith('idb://');
        const srcAttr = isIdb ? '' : `src="${escapeAttr(foto)}"`;
        const idbAttr = isIdb ? `data-idb-src="${escapeAttr(foto)}"` : '';
        avatar.innerHTML = `<img ${srcAttr} ${idbAttr} alt="Avatar" class="w-full h-full object-cover">`;
        avatar.classList.add('overflow-hidden', 'relative', 'p-0');
      } else {
        avatar.classList.remove('overflow-hidden', 'relative', 'p-0');
        avatar.textContent = getInitials(user.nombre_completo);
      }
    } else {
      avatar.classList.remove('overflow-hidden', 'relative', 'p-0');
      avatar.textContent = 'US';
    }
  }

  submit.addEventListener('click', () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = 'LoginYUnete.html#login';
      return;
    }
    if (!hasPermission('comments:create', currentUser)) return;

    const content = input.value.trim();
    if (!content) return;

    const db = readDb();
    const activeTab = document.querySelector('.community-active-tab')?.dataset.tab || 'general';

    if (window.communityUI?.editingId) {
      const comment = db.comentarios_comunidad.find(c => c.ID_comentario === window.communityUI.editingId);
      if (comment) {
        comment.contenido = content;
        addActivity(db, currentUser.ID_usuario, 'editar comentario', 'Comentario editado en comunidad.');
      }
    } else {
      db.comentarios_comunidad.push({
        ID_comentario: makeId('comment'),
        ID_usuario: currentUser.ID_usuario,
        categoria: activeTab,
        parent_id: window.communityUI?.replyingToId || null,
        contenido: content,
        likes: [],
        fecha_creacion: new Date().toISOString()
      });
      addActivity(db, currentUser.ID_usuario, 'publicar comentario', window.communityUI?.replyingToId ? 'Respuesta publicada en comunidad.' : 'Comentario publicado en comunidad.');
    }

    saveDb(db);
    resetCommunityComposer();
    renderCommunityComments(activeTab);
  });
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submit.click();
  });
}

window.communityUI = {
  replyingToId: null,
  editingId: null
};

function resetCommunityComposer() {
  window.communityUI.replyingToId = null;
  window.communityUI.editingId = null;
  
  const input = document.querySelector('[data-community-input]');
  if (input) {
    input.value = '';
    input.placeholder = 'Escribe aquí...';
  }
  
  const existingIndicator = document.getElementById('community-composer-indicator');
  if (existingIndicator) existingIndicator.remove();
}

window.resetCommunityComposer = resetCommunityComposer;

function showComposerIndicator(text) {
  const composer = document.querySelector('[data-community-composer]');
  if (!composer) return;
  
  let indicator = document.getElementById('community-composer-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'community-composer-indicator';
    indicator.className = 'flex items-center justify-between px-4 py-1.5 bg-blue-50 text-brand-blue text-[10px] font-bold rounded-t-xl -mb-1 relative z-10 mx-1';
    composer.parentNode.insertBefore(indicator, composer);
  }
  
  indicator.innerHTML = `
    <span>${text}</span>
    <button type="button" onclick="window.resetCommunityComposer()" class="text-gray-400 hover:text-brand-blue"><i class="fa-solid fa-xmark"></i></button>
  `;
}

function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
  return date.toLocaleDateString('es-CO');
}

function renderCommunityComments(tabId = 'general') {
  const activeFeed = document.querySelector(`.community-feed[data-feed="${tabId}"]`);
  if (!activeFeed) return;
  
  let dynamicContainer = activeFeed.querySelector('[data-community-dynamic-posts]');
  if (!dynamicContainer) {
    activeFeed.innerHTML = '<div class="space-y-4" data-community-dynamic-posts></div>';
    dynamicContainer = activeFeed.querySelector('[data-community-dynamic-posts]');
  }

  const db = readDb();
  const user = getCurrentUser();
  
  if (tabId === 'denuncias') {
    const denuncias = (db.reportes_denuncias || []).sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
    dynamicContainer.innerHTML = denuncias.map(denuncia => renderDenunciaCard(denuncia, db, user)).join('') || 
      `<div class="bg-transparent border border-dashed border-gray-200 rounded-2xl p-10 text-center">
        <p class="text-gray-400 text-sm">No hay denuncias reportadas. Puedes crear una si necesitas ayuda.</p>
      </div>`;
    attachDenunciaEvents(dynamicContainer);
  } else {
    const topComments = db.comentarios_comunidad
      .filter(c => c.categoria === tabId && !c.parent_id)
      .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

    dynamicContainer.innerHTML = topComments.map(comment => renderPost(comment, db, user)).join('') || 
      `<div class="bg-transparent border border-dashed border-gray-200 rounded-2xl p-10 text-center">
        <p class="text-gray-400 text-sm">No hay publicaciones todavía en esta categoría. Sé el primero.</p>
      </div>`;
      
    attachCommunityEvents(dynamicContainer);
  }
}

function renderPost(comment, db, currentUser, isReply = false) {
  const author = db.usuario.find(u => u.ID_usuario === comment.ID_usuario);
  const initials = getInitials(author?.nombre_completo || 'US');
  const time = getRelativeTime(comment.fecha_creacion);
  const likes = comment.likes || [];
  const likedByMe = currentUser && likes.includes(currentUser.ID_usuario);
  const canManage = currentUser && (currentUser.ID_usuario === comment.ID_usuario || currentUser.rol_usuario === 'admin');
  
  const profile = db.perfiles_usuario.find(p => p.ID_usuario === comment.ID_usuario);
  const foto = profile ? profile.foto_perfil : '';

  let avatarHtml = `<div class="${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold ${isReply ? 'text-[10px]' : 'text-sm'}">${escapeHtml(initials)}</div>`;
  if (foto) {
    const isIdb = foto.startsWith('idb://');
    const srcAttr = isIdb ? '' : `src="${escapeAttr(foto)}"`;
    const idbAttr = isIdb ? `data-idb-src="${escapeAttr(foto)}"` : '';
    avatarHtml = `<div class="${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full overflow-hidden relative p-0"><img ${srcAttr} ${idbAttr} alt="Avatar" class="w-full h-full object-cover"></div>`;
  }

  const replies = db.comentarios_comunidad
    .filter(c => c.parent_id === comment.ID_comentario)
    .sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion));

  const categoryLabels = {
    general: 'General',
    casos: 'Éxito',
    denuncias: 'Denuncia',
    perdidos: 'Perdidos'
  };

  return `
    <div class="${isReply ? 'bg-brand-gray rounded-xl p-4 ml-4 border-l-2 border-brand-blue mt-2' : 'bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100'}">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          ${avatarHtml}
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-brand-dark ${isReply ? 'text-xs' : 'text-sm'}">${escapeHtml(author?.nombre_completo || 'Usuario')}</h4>
              ${!isReply ? `<span class="text-[10px] bg-blue-50 text-brand-blue font-bold px-2 py-0.5 rounded-full">${categoryLabels[comment.categoria] || 'Comunidad'}</span>` : ''}
            </div>
            <p class="text-[10px] text-gray-400">${time}</p>
          </div>
        </div>
        ${canManage ? `
          <div class="flex gap-2">
            <button class="text-[10px] text-gray-400 hover:text-brand-blue transition" data-action="edit" data-id="${comment.ID_comentario}" title="Editar"><i class="fa-solid fa-pencil"></i></button>
            <button class="text-[10px] text-gray-400 hover:text-red-500 transition" data-action="delete" data-id="${comment.ID_comentario}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
          </div>
        ` : ''}
      </div>
      
      <p class="${isReply ? 'text-xs' : 'text-sm'} text-brand-dark mb-4 leading-relaxed">${escapeHtml(comment.contenido)}</p>
      
      <div class="flex items-center gap-4 ${isReply ? '' : 'mb-2'}">
        <button class="text-[11px] ${likedByMe ? 'text-brand-blue font-bold' : 'text-gray-400'} hover:text-brand-blue font-medium flex items-center gap-1 transition" data-action="like" data-id="${comment.ID_comentario}">
          <i class="${likedByMe ? 'fa-solid' : 'fa-regular'} fa-heart"></i> ${likes.length}
        </button>
        ${!isReply ? `
          <button class="text-[11px] text-gray-400 hover:text-brand-blue font-medium flex items-center gap-1 transition" data-action="reply" data-id="${comment.ID_comentario}">
            <i class="fa-regular fa-comment"></i> RESPONDER
          </button>
        ` : ''}
      </div>

      ${replies.length > 0 ? `
        <div class="mt-2 space-y-2">
          ${replies.map(reply => renderPost(reply, db, currentUser, true)).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function attachCommunityEvents(container) {
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      const db = readDb();
      const user = getCurrentUser();
      
      if (!user) {
        window.location.href = 'LoginYUnete.html#login';
        return;
      }

      if (action === 'like') {
        const comment = db.comentarios_comunidad.find(c => c.ID_comentario === id);
        if (comment) {
          if (!comment.likes) comment.likes = [];
          const idx = comment.likes.indexOf(user.ID_usuario);
          if (idx > -1) comment.likes.splice(idx, 1);
          else comment.likes.push(user.ID_usuario);
          saveDb(db);
          renderCommunityComments(comment.categoria);
        }
      } else if (action === 'reply') {
        const comment = db.comentarios_comunidad.find(c => c.ID_comentario === id);
        if (comment) {
          window.communityUI.replyingToId = id;
          window.communityUI.editingId = null;
          const author = userById(db, comment.ID_usuario);
          showComposerIndicator(`Respondiendo a ${author?.nombre_completo || 'Usuario'}`);
          document.querySelector('[data-community-input]')?.focus();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (action === 'edit') {
        const comment = db.comentarios_comunidad.find(c => c.ID_comentario === id);
        if (comment) {
          window.communityUI.editingId = id;
          window.communityUI.replyingToId = null;
          const input = document.querySelector('[data-community-input]');
          if (input) {
            input.value = comment.contenido;
            input.focus();
          }
          showComposerIndicator('Editando comentario...');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (action === 'delete') {
        if (confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
          const comment = db.comentarios_comunidad.find(c => c.ID_comentario === id);
          if (comment) {
            const cat = comment.categoria;
            db.comentarios_comunidad = db.comentarios_comunidad.filter(c => c.ID_comentario !== id && c.parent_id !== id);
            saveDb(db);
            renderCommunityComments(cat);
          }
        }
      }
    });
  });
}

function renderDenunciaCard(denuncia, db, currentUser) {
  const author = denuncia.anonimo ? null : userById(db, denuncia.ID_usuario);
  const authorName = author ? author.nombre_completo : 'Usuario Anónimo';
  const initials = author ? getInitials(author.nombre_completo) : 'AN';
  const time = getRelativeTime(denuncia.fecha_creacion);
  
  const estadoLabel = {
    revision: 'En revisión',
    aprobada: 'Aprobada',
    rechazada: 'Rechazada'
  }[denuncia.estado] || 'En revisión';
  
  const estadoColors = {
    revision: 'bg-yellow-100 text-yellow-700',
    aprobada: 'bg-green-100 text-green-700',
    rechazada: 'bg-red-100 text-red-700'
  }[denuncia.estado] || 'bg-gray-100 text-gray-700';

  const isRefugio = currentUser && currentUser.rol_usuario === 'refugio';
  
  const profile = author ? db.perfiles_usuario.find(p => p.ID_usuario === author.ID_usuario) : null;
  const foto = profile ? profile.foto_perfil : '';

  let avatarHtml = `<div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">${escapeHtml(initials)}</div>`;
  if (foto && !denuncia.anonimo) {
    const isIdb = foto.startsWith('idb://');
    const srcAttr = isIdb ? '' : `src="${escapeAttr(foto)}"`;
    const idbAttr = isIdb ? `data-idb-src="${escapeAttr(foto)}"` : '';
    avatarHtml = `<div class="w-10 h-10 rounded-full overflow-hidden relative p-0"><img ${srcAttr} ${idbAttr} alt="Avatar" class="w-full h-full object-cover"></div>`;
  }

  let mediaHtml = '';
  if (denuncia.evidencia_imagen) {
    mediaHtml = createContentMedia(denuncia.evidencia_imagen, denuncia.tipo_caso, 'h-48');
  }

  return `
    <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative" data-denuncia-id="${denuncia.ID_denuncia}">
      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center gap-3">
          ${avatarHtml}
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-brand-dark text-sm">${escapeHtml(authorName)}</h4>
              <span class="text-[10px] bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded-full">${escapeHtml(denuncia.tipo_caso.toUpperCase())}</span>
            </div>
            <p class="text-[10px] text-gray-400">${time} • ${escapeHtml(denuncia.ubicacion)}</p>
          </div>
        </div>
        
        <div class="flex flex-col items-end gap-2">
          <span class="text-[10px] font-bold px-3 py-1 rounded-full ${estadoColors}">${estadoLabel}</span>
          ${isRefugio ? `
            <div class="flex gap-1 mt-1">
              <button class="text-[10px] text-gray-400 hover:text-green-500 transition px-1" data-denuncia-action="aprobar" title="Aprobar"><i class="fa-solid fa-check"></i></button>
              <button class="text-[10px] text-gray-400 hover:text-yellow-500 transition px-1" data-denuncia-action="revisar" title="Poner en revisión"><i class="fa-solid fa-clock"></i></button>
              <button class="text-[10px] text-gray-400 hover:text-red-500 transition px-1" data-denuncia-action="rechazar" title="Rechazar"><i class="fa-solid fa-xmark"></i></button>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div class="mb-4">
        <p class="text-sm text-brand-dark leading-relaxed whitespace-pre-wrap">${escapeHtml(denuncia.descripcion)}</p>
      </div>
      
      ${mediaHtml}
      
      ${isRefugio ? `
        <div class="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <button class="text-[11px] text-gray-400 hover:text-brand-blue font-medium flex items-center gap-1 transition" data-denuncia-action="pdf">
            <i class="fa-solid fa-file-pdf"></i> DESCARGAR PDF
          </button>
          <button class="text-[11px] text-gray-400 hover:text-red-500 font-medium flex items-center gap-1 transition ml-auto" data-denuncia-action="delete">
            <i class="fa-solid fa-trash"></i> ELIMINAR
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function attachDenunciaEvents(container) {
  container.querySelectorAll('[data-denuncia-action]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const action = btn.dataset.denunciaAction;
      const card = btn.closest('[data-denuncia-id]');
      if (!card) return;
      const denunciaId = card.dataset.denunciaId;
      const db = readDb();
      const user = getCurrentUser();
      
      if (!user) return;
      
      const denuncia = db.reportes_denuncias.find(d => d.ID_denuncia === denunciaId);
      if (!denuncia) return;

      if (action === 'delete') {
        if (confirm('¿Estás seguro de eliminar esta denuncia? Esta acción no se puede deshacer.')) {
          db.reportes_denuncias = db.reportes_denuncias.filter(d => d.ID_denuncia !== denunciaId);
          saveDb(db);
          renderCommunityComments('denuncias');
        }
      } else if (action === 'aprobar') {
        denuncia.estado = 'aprobada';
        saveDb(db);
        renderCommunityComments('denuncias');
      } else if (action === 'revisar') {
        denuncia.estado = 'revision';
        saveDb(db);
        renderCommunityComments('denuncias');
      } else if (action === 'rechazar') {
        denuncia.estado = 'rechazada';
        saveDb(db);
        renderCommunityComments('denuncias');
      } else if (action === 'pdf') {
        generarPdfDenuncia(denuncia, db);
      }
    });
  });
}

function generarPdfDenuncia(denuncia, db) {
  if (typeof html2pdf === 'undefined') {
    alert('❌ La librería para generar PDF no está disponible.');
    return;
  }
  
  const author = denuncia.anonimo ? null : userById(db, denuncia.ID_usuario);
  const authorName = author ? author.nombre_completo : 'Usuario Anónimo';
  const time = new Date(denuncia.fecha_creacion).toLocaleString('es-CO');
  
  const pdfContainer = document.getElementById('pdf-container');
  if (!pdfContainer) return;
  
  pdfContainer.innerHTML = `
    <div style="padding: 40px; font-family: 'Inter', sans-serif; color: #0B132B;">
      <div style="border-bottom: 2px solid #00A3FF; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: 900; margin: 0;">REPORTE DE DENUNCIA</h1>
        <p style="color: #64748b; font-size: 12px; margin-top: 5px;">ID: ${denuncia.ID_denuncia}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <table style="width: 100%; text-align: left; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 30%; background-color: #f8fafc;">Tipo de Caso:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${escapeHtml(denuncia.tipo_caso)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc;">Ubicación / Barrio:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${escapeHtml(denuncia.ubicacion)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc;">Reportado por:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${escapeHtml(authorName)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc;">Fecha y Hora:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${time}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc;">Estado:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${denuncia.estado.toUpperCase()}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Descripción del Caso:</h3>
        <p style="font-size: 14px; line-height: 1.6; white-space: pre-wrap; background-color: #f8fafc; padding: 15px; border-radius: 8px;">${escapeHtml(denuncia.descripcion)}</p>
      </div>
      
      ${denuncia.evidencia_imagen ? `
        <div>
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Evidencia Adjunta:</h3>
          <p style="font-size: 12px; color: #64748b;">(El archivo multimedia original se encuentra disponible en la plataforma principal)</p>
        </div>
      ` : '<p style="font-size: 12px; color: #64748b; font-style: italic;">No se adjuntó evidencia multimedia.</p>'}
      
      <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        Generado por HuellasPro - ${new Date().toLocaleString('es-CO')}
      </div>
    </div>
  `;
  
  pdfContainer.classList.remove('hidden');
  
  const opt = {
    margin:       10,
    filename:     `Denuncia_${denuncia.ID_denuncia}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(pdfContainer).save().then(() => {
    pdfContainer.classList.add('hidden');
    pdfContainer.innerHTML = '';
  });
}

// ─── GESTIÓN DE DENUNCIAS ────────────────────────────────────────────────
// Módulo para que los usuarios reporten casos y los refugios gestionen estos reportes (incluye descarga de PDF).
function initDenunciasLogic() {
  const openBtns = document.querySelectorAll('[data-open-denuncia-modal]');
  const closeBtns = document.querySelectorAll('[data-close-denuncia-modal]');
  const modal = document.querySelector('[data-denuncia-modal]');
  const form = document.querySelector('[data-denuncia-form]');
  
  if (!modal || !form) return;
  
  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const user = getCurrentUser();
      if (!user) {
        window.location.href = 'LoginYUnete.html#login';
        return;
      }
      form.reset();
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    });
  });
  
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    });
  });
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    
    const db = readDb();
    
    const submitBtn = form.querySelector('[data-submit-denuncia-btn]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subiendo...';
    submitBtn.disabled = true;
    
    try {
      let evidenciaBase64 = '';
      const fileInput = form.elements.evidencia;
      if (fileInput.files.length > 0) {
        evidenciaBase64 = await readSelectedImage(fileInput.files[0], '');
      }
      
      const nuevaDenuncia = {
        ID_denuncia: makeId('den'),
        ID_usuario: user.ID_usuario,
        tipo_caso: form.elements.tipo_caso.value,
        ubicacion: form.elements.ubicacion.value.trim(),
        descripcion: form.elements.descripcion.value.trim(),
        evidencia_imagen: evidenciaBase64,
        anonimo: form.elements.anonimo.checked,
        estado: 'revision',
        fecha_creacion: new Date().toISOString()
      };
      
      if (!db.reportes_denuncias) db.reportes_denuncias = [];
      db.reportes_denuncias.push(nuevaDenuncia);
      addActivity(db, user.ID_usuario, 'crear denuncia', `Denuncia creada en ${nuevaDenuncia.ubicacion}.`);
      saveDb(db);
      
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      
      alert('✅ Denuncia enviada exitosamente. Se encuentra en revisión.');
      renderCommunityComments('denuncias');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ─── AUTENTICACIÓN (LOGIN Y REGISTRO) ───────────────────────────────────
// Maneja los formularios de ingreso y creación de nuevas cuentas de usuario o refugio.
function initAuthTabs() {
  const authRoot = document.querySelector('[data-auth-root]');
  if (!authRoot) return;

  const panels = document.querySelectorAll('.auth-panel');

  function activate(panelId) {
    panels.forEach(panel => {
      panel.classList.toggle('auth-panel-hidden', panel.dataset.panel !== panelId);
    });
  }

  function syncFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'unete') activate('unete');
    else if (hash === 'forgot') activate('forgot');
    else activate('login');
  }

  window.addEventListener('hashchange', syncFromHash);
  syncFromHash();
}

function initAuthForms() {
  const loginForm = document.querySelector('[data-login-form]');
  const signupForm = document.querySelector('[data-signup-form]');
  const message = document.querySelector('[data-auth-message]');

  function showMessage(text, type = 'error') {
    if (!message) return;
    message.textContent = text;
    message.className = `mt-5 text-center text-xs font-semibold ${type === 'success' ? 'text-brand-blue' : 'text-red-500'}`;
  }

  loginForm?.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(loginForm);
    const email = normalizeEmail(form.get('email') || '');
    const password = form.get('password') || '';
    const db = readDb();
    const user = db.usuario.find(item => item.correo_electronico === email && item.estado_cuenta === 'activo');
    const credential = user && db.credenciales_seguridad.find(item => item.ID_usuario === user.ID_usuario);

    if (!user || !credential || credential.contrasena_hash !== encodeCredential(password)) {
      if (credential) credential.intentos_fallidos_login += 1;
      saveDb(db);
      showMessage('Correo o contraseña incorrectos.');
      return;
    }

    credential.intentos_fallidos_login = 0;
    credential.fecha_ultimo_login = new Date().toISOString();
    addActivity(db, user.ID_usuario, 'iniciar sesión', 'Ingreso exitoso a la plataforma.');
    saveDb(db);
    setSession(user);
    showMessage('Sesión iniciada correctamente.', 'success');
    if (user.rol_usuario === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'Perfil.html#info';
    }
  });

  signupForm?.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(signupForm);
    const name = String(form.get('name') || '').trim();
    const email = normalizeEmail(form.get('email') || '');
    const password = String(form.get('password') || '');
    const role = String(form.get('role') || 'usuario');

    if (!name || !email || !password) {
      showMessage('Completa nombre, correo y contraseña.');
      return;
    }

    const db = readDb();
    if (db.usuario.some(user => user.correo_electronico === email)) {
      showMessage('Ya existe una cuenta con ese correo.');
      return;
    }

    const userId = makeId('user');
    const today = new Date().toISOString().slice(0, 10);
    const user = {
      ID_usuario: userId,
      nombre_completo: name,
      correo_electronico: email,
      telefono: '',
      ciudad_ubicacion_general: 'Bogotá',
      fecha_registro: today,
      estado_cuenta: 'activo',
      rol_usuario: role,
      verificado: false
    };

    db.usuario.push(user);
    db.perfiles_usuario.push({
      ID_perfil: makeId('profile'),
      ID_usuario: userId,
      foto_perfil: '',
      biografia_descripcion: '',
      preferencias: role === 'refugio' ? ['gestión de adopciones'] : ['adopción responsable'],
      configuracion_privacidad: 'publico'
    });
    db.credenciales_seguridad.push({
      ID_credencial: makeId('cred'),
      ID_usuario: userId,
      contrasena_hash: encodeCredential(password),
      intentos_fallidos_login: 0,
      fecha_ultimo_login: new Date().toISOString(),
      token_recuperacion_contrasena: '',
      fecha_expiracion_token: '',
      autenticacion_doble_factor: false
    });
    db.configuracion_cuenta.push({
      ID_configuracion: makeId('config'),
      ID_usuario: userId,
      idioma: 'es',
      notificaciones_activas: true,
      privacidad_perfil: 'publico'
    });
    addActivity(db, userId, 'crear cuenta', `Registro creado con rol ${roleLabel(role)}.`);
    addNotification(db, userId, 'sistema', `Bienvenido a HuellasPro. Tu rol actual es ${roleLabel(role)}.`);
    saveDb(db);
    setSession(user);
    showMessage('Cuenta creada correctamente.', 'success');
    window.location.href = 'Perfil.html#info';
  });

  initForgotPasswordForm(showMessage);
}

function initForgotPasswordForm(showMessage) {
  const form = document.querySelector('[data-forgot-form]');
  if (!form) return;

  const step1 = form.querySelector('[data-forgot-step="1"]');
  const step2 = form.querySelector('[data-forgot-step="2"]');
  const resetBtn = form.querySelector('[data-forgot-reset-btn]');
  let verifiedUserId = null;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const email = normalizeEmail(form.elements.email.value);
    const db = readDb();
    const user = db.usuario.find(u => u.correo_electronico === email && u.estado_cuenta === 'activo');

    if (!user) {
      showMessage('No existe una cuenta activa con ese correo.');
      return;
    }

    verifiedUserId = user.ID_usuario;
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
    showMessage('Usuario verificado.', 'success');
  });

  resetBtn?.addEventListener('click', () => {
    const newPassword = form.elements.newPassword.value;
    if (newPassword.length < 4) {
      showMessage('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    const db = readDb();
    const credential = db.credenciales_seguridad.find(c => c.ID_usuario === verifiedUserId);
    if (credential) {
      credential.contrasena_hash = encodeCredential(newPassword);
      addActivity(db, verifiedUserId, 'recuperar contraseña', 'Contraseña restablecida exitosamente.');
      saveDb(db);
      showMessage('Contraseña actualizada. Ya puedes iniciar sesión.', 'success');
      
      setTimeout(() => {
        window.location.hash = 'login';
        // Reset form for next time
        form.reset();
        step1.classList.remove('hidden');
        step2.classList.add('hidden');
        verifiedUserId = null;
      }, 2000);
    }
  });
}

// ─── MÓDULO DE ADOPCIONES ───────────────────────────────────────────────
// Funcionalidad para listar mascotas, filtrar por categorías y gestionar las fichas de animales.
function syncAdoptionCardsFromDb(adoptionRoot) {
  const list = adoptionRoot.querySelector('[data-animal-list]');
  if (!list) return;

  const db = readDb();
  list.querySelectorAll('[data-animal-card]').forEach(card => {
    const storedAnimal = db.animales_adopcion.find(animal => animal.ID_animal === card.dataset.animalId);
    if (storedAnimal?.estado_publicacion === 'archivado') card.remove();
    else if (storedAnimal) card.outerHTML = createAnimalCardHtml(storedAnimal);
  });

  const existingIds = new Set([...list.querySelectorAll('[data-animal-card]')].map(card => card.dataset.animalId));
  db.animales_adopcion
    .filter(animal => animal.estado_publicacion !== 'archivado' && !existingIds.has(animal.ID_animal))
    .forEach(animal => {
      list.insertAdjacentHTML('beforeend', createAnimalCardHtml(animal));
    });
}

function renderAnimalOwnerControls(adoptionRoot) {
  const user = getCurrentUser();
  const db = readDb();
  adoptionRoot.querySelectorAll('[data-animal-card]').forEach(card => {
    card.querySelector('[data-animal-owner-actions]')?.remove();
    const animal = db.animales_adopcion.find(item => item.ID_animal === card.dataset.animalId);
    const canManage = user && animal?.ID_refugio === user.ID_usuario && hasPermission('animals:edit', user);
    if (!canManage) return;

    card.insertAdjacentHTML('afterbegin', `
      <div class="animal-card-owner-actions" data-animal-owner-actions>
        <button type="button" data-edit-pet="${escapeAttr(animal.ID_animal)}" aria-label="Editar ${escapeAttr(animal.nombre)}"><i class="fa-solid fa-pen"></i></button>
        <button type="button" data-delete-pet="${escapeAttr(animal.ID_animal)}" aria-label="Eliminar ${escapeAttr(animal.nombre)}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `);
  });

  adoptionRoot.querySelectorAll('[data-edit-pet]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      openPetEditor(button.dataset.editPet);
    });
  });

  adoptionRoot.querySelectorAll('[data-delete-pet]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      deletePet(button.dataset.deletePet);
    });
  });
}

function createAnimalCardHtml(animal) {
  const isIdb = animal.imagen && animal.imagen.startsWith('idb://');
  const srcAttr = isIdb ? '' : escapeAttr(animal.imagen);
  const dataIdbAttr = isIdb ? `data-idb-src="${escapeAttr(animal.imagen)}"` : '';

  const imageHtml = animal.imagen
    ? `<img src="${srcAttr}" ${dataIdbAttr} alt="${escapeAttr(animal.nombre)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">`
    : '<i class="fa-solid fa-image text-gray-300 text-4xl"></i>';
  const mediaClasses = animal.imagen
    ? 'relative h-48 rounded-[1.5rem] overflow-hidden mb-4'
    : 'relative h-48 bg-gray-100 rounded-[1.5rem] overflow-hidden mb-4 flex items-center justify-center';

  return `
    <div class="bg-white rounded-[2rem] p-2 pb-6 shadow-sm border border-gray-100 hover:shadow-lg transition group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue/30" tabindex="0" role="button" aria-label="Ver detalle de ${escapeAttr(animal.nombre)}" data-animal-card data-animal-id="${escapeAttr(animal.ID_animal)}" data-species="${escapeAttr(animal.especie)}" data-location="${escapeAttr(animal.ubicacion_key)}" data-health="${escapeAttr(animal.estado_salud)}" data-tamano="${escapeAttr(animal.tamano)}" data-gender="${escapeAttr(animal.sexo)}" data-vaccinated="${escapeAttr(animal.vacunado)}" data-sterilized="${escapeAttr(animal.esterilizado)}" data-story="${escapeAttr(animal.historia)}">
      <div class="${mediaClasses}">
        ${imageHtml}
        <div class="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-brand-dark shadow-sm">${escapeHtml(animal.ciudad)}</div>
      </div>
      <div class="px-4">
        <div class="flex justify-between items-start mb-1">
          <h4 class="text-xl font-bold text-brand-dark">${escapeHtml(animal.nombre)}</h4>
          <i class="fa-solid ${animal.especie === 'gatos' ? 'fa-shield-cat' : 'fa-shield-dog'} text-brand-blue text-sm"></i>
        </div>
        <p class="text-[10px] font-bold text-brand-blue tracking-wider uppercase mb-2">${escapeHtml(animal.raza)} • ${escapeHtml(animal.edad)}</p>
        <p class="text-sm text-gray-500 line-clamp-2">${escapeHtml(animal.descripcion)}</p>
      </div>
    </div>
  `;
}

function initAdoptionFilters() {
  const adoptionRoot = document.querySelector('[data-adoption-root]');
  if (!adoptionRoot) return;

  syncAdoptionCardsFromDb(adoptionRoot);
  renderAnimalOwnerControls(adoptionRoot);

  const filters = [...adoptionRoot.querySelectorAll('[data-filter]')];
  const cards = [...adoptionRoot.querySelectorAll('[data-animal-card]')];
  const filterButton = adoptionRoot.querySelector('[data-filter-submit]');
  const clearButton = adoptionRoot.querySelector('[data-filter-clear]');
  const emptyResults = adoptionRoot.querySelector('[data-empty-results]');

  function getSelectedFilters() {
    return filters.reduce((selected, filter) => {
      selected[filter.dataset.filter] = filter.value;
      return selected;
    }, {});
  }

  function applyFilters() {
    const selected = getSelectedFilters();
    let visibleCards = 0;

    cards.forEach(card => {
      const matches = Object.entries(selected).every(([key, value]) => {
        if (!value) return true;
        if (key === 'health' && value === 'vacunado') {
          return (card.dataset.vaccinated || '').toLowerCase().startsWith('vacunad');
        }
        if (key === 'health' && value === 'esterilizado') {
          return (card.dataset.sterilized || '').toLowerCase().startsWith('esterilizad');
        }
        return card.dataset[key] === value;
      });

      card.classList.toggle('hidden', !matches);
      if (matches) visibleCards += 1;
    });

    if (emptyResults) {
      emptyResults.classList.toggle('hidden', visibleCards > 0);
    }
  }

  function clearFilters() {
    filters.forEach(filter => {
      filter.value = '';
    });

    applyFilters();
  }

  filterButton?.addEventListener('click', applyFilters);
  clearButton?.addEventListener('click', clearFilters);
  filters.forEach(filter => {
    filter.addEventListener('change', applyFilters);
  });

  applyFilters();
}

function initPetPublisherModal() {
  const modal = document.querySelector('[data-pet-editor-modal]');
  const form = document.querySelector('[data-pet-editor-form]');
  const openButton = document.querySelector('[data-open-pet-modal]');
  const closeButtons = document.querySelectorAll('[data-close-pet-modal]');
  if (!modal || !form) return;

  openButton?.addEventListener('click', () => openPetEditor());
  closeButtons.forEach(button => button.addEventListener('click', closePetEditor));
  modal.addEventListener('click', event => {
    if (!event.target.closest('.pet-editor-modal')) closePetEditor();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const user = getCurrentUser();
    if (!hasPermission('animals:create', user)) return;

    const db = readDb();
    const animalId = form.elements.animalId.value;
    const existingAnimal = db.animales_adopcion.find(animal => animal.ID_animal === animalId && animal.ID_refugio === user.ID_usuario);
    const image = await readSelectedImage(form.elements.photo.files[0], existingAnimal?.imagen || '');
    const name = form.elements.name.value.trim();
    const city = form.elements.city.value;
    const story = form.elements.story.value.trim();
    const vaccinated = form.elements.vaccinated.checked;
    const sterilized = form.elements.sterilized.checked;

    const nextAnimal = {
      ID_animal: existingAnimal?.ID_animal || makeId('animal'),
      ID_refugio: existingAnimal?.ID_refugio || user.ID_usuario,
      nombre: name,
      especie: form.elements.species.value,
      raza: form.elements.breed.value.trim().toUpperCase(),
      edad: existingAnimal?.edad || 'RECIÉN LLEGADO',
      ciudad: city,
      ubicacion_key: normalizeLocation(city),
      estado_salud: vaccinated ? 'sano' : 'tratamiento',
      tamano: form.elements.size.value,
      sexo: form.elements.gender.value,
      vacunado: vaccinated ? 'Vacunado' : 'Pendiente',
      esterilizado: sterilized ? 'Esterilizado' : 'Pendiente',
      imagen: image,
      descripcion: story,
      historia: story,
      estado_publicacion: 'publicado'
    };

    if (existingAnimal) {
      Object.assign(existingAnimal, nextAnimal);
      addActivity(db, user.ID_usuario, 'editar animal', `Ficha editada para ${name}.`);
    } else {
      db.animales_adopcion.push(nextAnimal);
      addActivity(db, user.ID_usuario, 'publicar animal', `Ficha creada para ${name}.`);
    }

    saveDb(db);
    window.location.reload();
  });
}

function openPetEditor(animalId = '') {
  const modal = document.querySelector('[data-pet-editor-modal]');
  const form = document.querySelector('[data-pet-editor-form]');
  const title = document.querySelector('[data-pet-modal-title]');
  const user = getCurrentUser();
  if (!modal || !form || !hasPermission('animals:create', user)) return;

  form.reset();
  form.elements.animalId.value = '';
  title.textContent = 'Publicar Nueva Mascota';

  if (animalId) {
    const db = readDb();
    const animal = db.animales_adopcion.find(item => item.ID_animal === animalId && item.ID_refugio === user.ID_usuario);
    if (!animal) return;
    title.textContent = 'Editar Mascota';
    form.elements.animalId.value = animal.ID_animal;
    form.elements.name.value = animal.nombre;
    form.elements.species.value = animal.especie;
    form.elements.breed.value = animal.raza;
    form.elements.city.value = animal.ciudad;
    form.elements.gender.value = animal.sexo;
    form.elements.size.value = animal.tamano;
    form.elements.vaccinated.checked = animal.vacunado !== 'Pendiente';
    form.elements.sterilized.checked = animal.esterilizado !== 'Pendiente';
    form.elements.story.value = animal.historia || animal.descripcion;
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closePetEditor() {
  const modal = document.querySelector('[data-pet-editor-modal]');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function deletePet(animalId) {
  const user = getCurrentUser();
  if (!hasPermission('animals:edit', user)) return;
  const db = readDb();
  const animal = db.animales_adopcion.find(item => item.ID_animal === animalId && item.ID_refugio === user.ID_usuario);
  if (!animal) return;
  const confirmed = window.confirm(`¿Eliminar la ficha de ${animal.nombre}?`);
  if (!confirmed) return;

  animal.estado_publicacion = 'archivado';
  addActivity(db, user.ID_usuario, 'eliminar animal', `Ficha archivada para ${animal.nombre}.`);
  saveDb(db);
  [...document.querySelectorAll('[data-animal-card]')]
    .find(card => card.dataset.animalId === animalId)
    ?.remove();
}

function readSelectedImage(file, fallback = '') {
  if (!file) return Promise.resolve(fallback);
  
  // Límite de tamaño para convertir a base64 (200 KB) para evitar llenar localStorage
  const MAX_BASE64_SIZE = 200 * 1024;
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  
  return new Promise((resolve, reject) => {
    // Si el archivo es demasiado grande (como videos), guardarlo en IndexedDB
    if (file.size > MAX_BASE64_SIZE) {
      console.log(`📦 Archivo grande detectado (${fileSizeMB} MB) - guardando en IndexedDB`);
      const request = indexedDB.open('HuellasProMedia', 1);
      request.onupgradeneeded = e => {
        e.target.result.createObjectStore('media');
      };
      request.onsuccess = e => {
        const db = e.target.result;
        const tx = db.transaction('media', 'readwrite');
        const store = tx.objectStore('media');
        const id = 'media_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        store.put(file, id);
        tx.oncomplete = () => {
          resolve(`idb://${file.type}::${id}`);
        };
        tx.onerror = () => resolve(fallback);
      };
      request.onerror = () => resolve(fallback);
      return;
    }
    
    // Para archivos pequeños, convertir a base64
    const reader = new FileReader();
    reader.onload = () => {
      console.log(`✅ Archivo procesado (${fileSizeMB} MB) - convertido a base64`);
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      resolve(fallback);
    };
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total * 100).toFixed(0);
        console.log(`⏳ Cargando: ${percentComplete}%`);
      }
    };
    reader.readAsDataURL(file);
  });
}

function initAdoptionModal() {
  const adoptionRoot = document.querySelector('[data-adoption-root]');
  const modal = document.querySelector('[data-animal-modal]');
  if (!adoptionRoot || !modal) return;

  const cards = [...adoptionRoot.querySelectorAll('[data-animal-card]')];
  const closeButtons = modal.querySelectorAll('[data-modal-close]');
  const modalImage = modal.querySelector('[data-modal-image]');
  const modalPlaceholder = modal.querySelector('[data-modal-placeholder]');
  const modalName = modal.querySelector('[data-modal-name]');
  const modalMeta = modal.querySelector('[data-modal-meta]');
  const modalGender = modal.querySelector('[data-modal-gender]');
  const modalSize = modal.querySelector('[data-modal-size]');
  const modalHealth = modal.querySelector('[data-modal-health]');
  const modalVaccinated = modal.querySelector('[data-modal-vaccinated]');
  const modalSterilized = modal.querySelector('[data-modal-sterilized]');
  const modalStory = modal.querySelector('[data-modal-story]');
  const adoptButton = modal.querySelector('[data-modal-adopt]');
  const favoriteButton = modal.querySelector('[data-modal-favorite]');
  const messageButton = modal.querySelector('[data-modal-message]');
  let lastFocusedCard = null;

  const sizeLabels = {
    pequeno: 'Pequeño',
    mediano: 'Mediano',
    grande: 'Grande'
  };

  const healthLabels = {
    sano: 'Sano',
    tratamiento: 'En tratamiento'
  };

  function getCardData(card) {
    const db = readDb();
    const storedAnimal = db.animales_adopcion.find(animal => animal.ID_animal === card.dataset.animalId);
    const image = card.querySelector('img');
    const name = storedAnimal?.nombre || card.querySelector('h4')?.textContent.trim() || 'Sin nombre';
    const meta = card.querySelector('p')?.textContent.trim() || '';
    const breed = storedAnimal?.raza || meta.split('•')[0]?.trim() || 'Sin raza';
    const location = storedAnimal?.ciudad || card.querySelector('.absolute.bottom-3')?.textContent.trim() || '';
    const story = storedAnimal?.historia || card.dataset.story || card.querySelector('.text-sm')?.textContent.trim() || 'Aún no hay una historia registrada para este animal.';

    return {
      id: storedAnimal?.ID_animal || card.dataset.animalId || name,
      name,
      breed,
      location,
      story,
      imageSrc: storedAnimal?.imagen || (image?.src ? image.src.replace('w=400', 'w=900') : ''),
      imageAlt: image?.alt || name,
      gender: storedAnimal?.sexo || card.dataset.gender || 'Por definir',
      size: sizeLabels[storedAnimal?.tamano || card.dataset.tamano] || 'Por definir',
      health: healthLabels[storedAnimal?.estado_salud || card.dataset.health] || 'Por definir',
      vaccinated: storedAnimal?.vacunado || card.dataset.vaccinated || 'Vacunado',
      sterilized: storedAnimal?.esterilizado || card.dataset.sterilized || 'Esterilizado'
    };
  }

  function setChipText(element, value, checked = false) {
    if (!element) return;
    element.textContent = checked && value !== 'Pendiente' ? `✓ ${value}` : value;
  }

  function refreshFavoriteState(animalId) {
    const user = getCurrentUser();
    const db = readDb();
    const isFavorite = Boolean(user && db.favoritos_intereses.some(item => item.ID_usuario === user.ID_usuario && item.ID_animal === animalId));
    favoriteButton?.classList.toggle('animal-detail-icon-btn-active', isFavorite);
  }

  function openModal(card) {
    const data = getCardData(card);
    lastFocusedCard = card;
    modal.dataset.animalId = data.id;

    modalName.textContent = data.name;
    modalMeta.textContent = `${data.breed} • ${data.location}`;
    modalStory.textContent = data.story;
    setChipText(modalGender, data.gender);
    setChipText(modalSize, data.size);
    setChipText(modalHealth, data.health);
    setChipText(modalVaccinated, data.vaccinated, true);
    setChipText(modalSterilized, data.sterilized, true);
    if (adoptButton) adoptButton.textContent = 'Solicitar adopción';

    if (data.imageSrc) {
      if (data.imageSrc.startsWith('idb://')) {
        modalImage.src = '';
        modalImage.setAttribute('data-idb-src', data.imageSrc);
        modalImage.removeAttribute('data-idb-resolved');
      } else {
        modalImage.src = data.imageSrc.replace('w=400', 'w=900');
        modalImage.removeAttribute('data-idb-src');
      }
      modalImage.alt = data.imageAlt;
      modalImage.classList.remove('hidden');
      modalPlaceholder.classList.add('hidden');
      modalPlaceholder.classList.remove('flex');
    } else {
      modalImage.removeAttribute('src');
      modalImage.alt = '';
      modalImage.classList.add('hidden');
      modalPlaceholder.classList.remove('hidden');
      modalPlaceholder.classList.add('flex');
    }

    refreshFavoriteState(data.id);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lastFocusedCard?.focus();
  }

  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(card);
      }
    });
  });

  adoptButton?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'LoginYUnete.html#login';
      return;
    }

    const db = readDb();
    const animalId = modal.dataset.animalId;
    const animal = db.animales_adopcion.find(item => item.ID_animal === animalId);
    if (!animal) return;

    const existing = db.solicitudes_adopcion.find(item => item.ID_usuario === user.ID_usuario && item.ID_animal === animalId && item.estado_solicitud === 'pendiente');
    if (existing) {
      adoptButton.textContent = 'Solicitud enviada';
      return;
    }

    db.solicitudes_adopcion.push({
      ID_solicitud: makeId('sol'),
      ID_usuario: user.ID_usuario,
      ID_animal: animalId,
      estado_solicitud: 'pendiente',
      fecha_solicitud: new Date().toISOString().slice(0, 10),
      comentarios_usuario: 'Solicitud creada desde la ficha de adopción.',
      calificacion: 'BUENA'
    });
    addActivity(db, user.ID_usuario, 'enviar solicitud', `Solicitud enviada para ${animal.nombre}.`);
    addNotification(db, animal.ID_refugio, 'adopción', `${user.nombre_completo} envió una solicitud para ${animal.nombre}.`);
    saveDb(db);
    adoptButton.textContent = 'Solicitud enviada';
  });

  favoriteButton?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'LoginYUnete.html#login';
      return;
    }

    const db = readDb();
    const animalId = modal.dataset.animalId;
    const index = db.favoritos_intereses.findIndex(item => item.ID_usuario === user.ID_usuario && item.ID_animal === animalId);
    if (index >= 0) {
      db.favoritos_intereses.splice(index, 1);
      addActivity(db, user.ID_usuario, 'quitar favorito', `Se quitó ${animalId} de favoritos.`);
    } else {
      db.favoritos_intereses.push({
        ID_favorito: makeId('fav'),
        ID_usuario: user.ID_usuario,
        ID_animal: animalId,
        fecha_guardado: new Date().toISOString().slice(0, 10)
      });
      addActivity(db, user.ID_usuario, 'guardar favorito', `Se guardó ${animalId} como favorito.`);
    }
    saveDb(db);
    refreshFavoriteState(animalId);
  });

  messageButton?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'LoginYUnete.html#login';
      return;
    }

    const db = readDb();
    const animal = db.animales_adopcion.find(item => item.ID_animal === modal.dataset.animalId);
    if (!animal) return;

    if (animal.ID_refugio === user.ID_usuario) {
      window.alert('Esta ficha pertenece a tu refugio. El chat se usa para que los adoptantes contacten al refugio.');
      return;
    }

    let conversation = db.conversaciones.find(item => {
      return item.ID_animal === animal.ID_animal
        && item.participantes.includes(user.ID_usuario)
        && item.participantes.includes(animal.ID_refugio);
    });

    if (!conversation) {
      conversation = {
        ID_conversacion: makeId('conv'),
        participantes: [user.ID_usuario, animal.ID_refugio],
        ID_animal: animal.ID_animal,
        titulo: `Conversación sobre ${animal.nombre}`,
        fecha_creacion: new Date().toISOString()
      };
      db.conversaciones.push(conversation);
      addNotification(db, animal.ID_refugio, 'mensaje', `${user.nombre_completo} abrió un chat por ${animal.nombre}.`);
    }

    addActivity(db, user.ID_usuario, 'abrir conversación', `Conversación abierta sobre ${animal.nombre}.`);
    saveDb(db);
    sessionStorage.setItem(SELECTED_CONVERSATION_KEY, conversation.ID_conversacion);
    window.location.href = 'Perfil.html#mensajes';
  });

  closeButtons.forEach(button => {
    button.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', event => {
    if (!event.target.closest('.animal-detail-modal')) closeModal();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

// ─── PERFIL DE USUARIO ──────────────────────────────────────────────────
// Panel personal donde el usuario ve sus datos, favoritos, mensajes y solicitudes.
function initProfilePage() {
  const profileRoot = document.querySelector('[data-profile-root]');
  if (!profileRoot) return;

  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'LoginYUnete.html#login';
    return;
  }

  renderProfileShell(user);
  initProfileNavigation();
  initProfileInfoForm();
  initProfilePhotoUpload();
  initShelterForms();
  initSatisfactionForm();
  renderProfileView(getProfileTabFromHash());

  window.addEventListener('hashchange', () => renderProfileView(getProfileTabFromHash()));
}

function getProfileTabFromHash() {
  const tab = window.location.hash.replace('#', '') || 'info';
  const user = getCurrentUser();
  if (tab === 'refugio' && !hasPermission('shelter_panel:access', user)) return 'info';
  return ['info', 'solicitudes', 'favoritos', 'mensajes', 'refugio'].includes(tab) ? tab : 'info';
}

function renderProfileShell(user) {
  const db = readDb();
  const profile = db.perfiles_usuario.find(p => p.ID_usuario === user.ID_usuario);
  const foto = profile ? profile.foto_perfil : '';

  document.querySelectorAll('[data-profile-name]').forEach(element => {
    if ('value' in element) element.value = user.nombre_completo;
    else element.textContent = user.nombre_completo;
  });
  document.querySelectorAll('[data-profile-email]').forEach(element => {
    if ('value' in element) element.value = user.correo_electronico;
    else element.textContent = user.correo_electronico;
  });
  document.querySelectorAll('[data-profile-role]').forEach(element => {
    element.textContent = roleLabel(user.rol_usuario);
  });
  document.querySelectorAll('[data-profile-initials]').forEach(element => {
    element.textContent = getInitials(user.nombre_completo);
    if (foto) element.classList.add('hidden');
    else element.classList.remove('hidden');
  });
  document.querySelectorAll('[data-profile-image]').forEach(element => {
    if (foto) {
      if (foto.startsWith('idb://')) {
        element.src = '';
        element.setAttribute('data-idb-src', foto);
        element.removeAttribute('data-idb-resolved');
      } else {
        element.src = foto;
        element.removeAttribute('data-idb-src');
      }
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
      element.removeAttribute('src');
    }
  });
  document.querySelectorAll('[data-requires-permission]').forEach(element => {
    element.classList.toggle('hidden', !hasPermission(element.dataset.requiresPermission, user));
  });

  resolveAllIdbMedia();
}

function initProfilePhotoUpload() {
  const photoInput = document.querySelector('[data-profile-photo-input]');
  if (!photoInput) return;
  photoInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida.');
      event.target.value = '';
      return;
    }

    try {
      const user = getCurrentUser();
      const media = await readSelectedImage(file, '');
      const db = readDb();
      let profile = db.perfiles_usuario.find(p => p.ID_usuario === user.ID_usuario);
      
      if (!profile) {
        profile = {
          ID_perfil: makeId('profile'),
          ID_usuario: user.ID_usuario,
          foto_perfil: '',
          biografia: '',
          enlaces_sociales: []
        };
        db.perfiles_usuario.push(profile);
      }
      
      profile.foto_perfil = media;
      addActivity(db, user.ID_usuario, 'actualizar foto', 'Has actualizado tu foto de perfil.');
      saveDb(db);
      
      renderProfileShell(user);
      renderSessionNav();
    } catch (e) {
      console.error('Error al subir foto de perfil:', e);
      alert('Hubo un error al procesar la imagen.');
    }
  });
}

function initProfileNavigation() {
  document.querySelectorAll('[data-profile-tab]').forEach(button => {
    button.addEventListener('click', () => {
      window.location.hash = button.dataset.profileTab;
    });
  });
}

function setActiveProfileTab(tab) {
  document.querySelectorAll('[data-profile-tab]').forEach(button => {
    button.classList.toggle('profile-menu-active', button.dataset.profileTab === tab);
  });
  document.querySelectorAll('[data-profile-view]').forEach(view => {
    view.classList.toggle('hidden', view.dataset.profileView !== tab);
  });
}

function initProfileInfoForm() {
  const form = document.querySelector('[data-profile-info-form]');
  if (!form) return;

  const user = getCurrentUser();
  form.elements.publicName.value = user.nombre_completo;
  form.elements.email.value = user.correo_electronico;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const db = readDb();
    const currentUser = getCurrentUser();
    const nextName = form.elements.publicName.value.trim();
    const nextEmail = normalizeEmail(form.elements.email.value);
    const duplicate = db.usuario.some(item => item.ID_usuario !== currentUser.ID_usuario && item.correo_electronico === nextEmail);

    if (!nextName || !nextEmail || duplicate) return;

    const storedUser = db.usuario.find(item => item.ID_usuario === currentUser.ID_usuario);
    if (storedUser.nombre_completo !== nextName) {
      addChange(db, storedUser.ID_usuario, 'nombre_completo', storedUser.nombre_completo, nextName);
      storedUser.nombre_completo = nextName;
    }
    if (storedUser.correo_electronico !== nextEmail) {
      addChange(db, storedUser.ID_usuario, 'correo_electronico', storedUser.correo_electronico, nextEmail);
      storedUser.correo_electronico = nextEmail;
    }

    addActivity(db, storedUser.ID_usuario, 'editar perfil', 'Actualización de datos de cuenta.');
    saveDb(db);
    renderProfileShell(storedUser);
    renderSessionNav();
  });
}

function renderProfileView(tab) {
  setActiveProfileTab(tab);
  if (tab === 'solicitudes') renderRequestsView();
  if (tab === 'favoritos') renderFavoritesView();
  if (tab === 'mensajes') renderMessagesView();
  if (tab === 'refugio') renderShelterPanel();
}

function animalById(db, animalId) {
  return db.animales_adopcion.find(animal => animal.ID_animal === animalId);
}

function userById(db, userId) {
  return db.usuario.find(user => user.ID_usuario === userId);
}

function statusLabel(status) {
  return {
    pendiente: 'PENDIENTE',
    aprobada: 'APROBADA',
    rechazada: 'RECHAZADA'
  }[status] || status;
}

function renderRequestsView() {
  const container = document.querySelector('[data-requests-list]');
  if (!container) return;

  const db = readDb();
  const user = getCurrentUser();
  const requests = hasPermission('adoption_requests:review', user)
    ? db.solicitudes_adopcion.filter(request => animalById(db, request.ID_animal)?.ID_refugio === user.ID_usuario)
    : db.solicitudes_adopcion.filter(request => request.ID_usuario === user.ID_usuario);

  if (!requests.length) {
    container.innerHTML = '<div class="profile-empty">Aún no hay solicitudes registradas.</div>';
    return;
  }

  container.innerHTML = requests.map(request => {
    const animal = animalById(db, request.ID_animal);
    const adopter = userById(db, request.ID_usuario);
    return hasPermission('adoption_requests:review', user)
      ? createShelterRequestHtml(request, animal, adopter, db)
      : createUserRequestHtml(request, animal, db, user);
  }).join('');

  container.querySelectorAll('[data-request-status]').forEach(select => {
    select.addEventListener('change', () => updateRequestStatus(select.dataset.requestStatus, select.value));
  });

  container.querySelectorAll('[data-open-satisfaction]').forEach(btn => {
    btn.addEventListener('click', () => {
      openSatisfactionModal(btn.dataset.openSatisfaction);
    });
  });
}

function createShelterRequestHtml(request, animal, adopter, db) {
  const satisfaccion = (db.satisfaccion_formularios || []).find(f => f.ID_solicitud === request.ID_solicitud);
  
  const feedbackHtml = satisfaccion
    ? `<div class="profile-feedback-card">
        <p class="profile-eyebrow">RETROALIMENTACIÓN DEL ADOPTANTE</p>
        <div class="profile-rating-row">
          <span>Calificación:</span>
          <strong>${escapeHtml(satisfaccion.calificacion_satisfaccion)}</strong>
        </div>
        <em>"${escapeHtml(satisfaccion.comentarios_satisfaccion || 'Sin comentarios')}"</em>
      </div>`
    : `<div class="profile-feedback-card">
        <p class="profile-eyebrow">RETROALIMENTACIÓN DEL ADOPTANTE</p>
        <div class="profile-rating-row">
          <span>Calificación:</span>
          <strong>${escapeHtml(request.calificacion || 'BUENA')}</strong>
        </div>
        <em>"${escapeHtml(request.comentarios_usuario || 'Solicitud creada desde la ficha de adopción.')}"</em>
      </div>`;

  return `
    <article class="profile-request-card">
      <div class="profile-request-animal">
        ${animal?.imagen ? `<img src="${animal.imagen.startsWith('idb://') ? '' : animal.imagen}" ${animal.imagen.startsWith('idb://') ? `data-idb-src="${animal.imagen}"` : ''} alt="${animal.nombre}">` : '<div class="profile-thumb-placeholder"><i class="fa-solid fa-image"></i></div>'}
        <div>
          <h3>${animal?.nombre || 'Animal'}</h3>
          <p>ADOPTANTE: ${adopter?.nombre_completo || 'Usuario'}</p>
        </div>
      </div>
      ${feedbackHtml}
      <select class="profile-status-select" data-request-status="${request.ID_solicitud}">
        <option value="pendiente" ${request.estado_solicitud === 'pendiente' ? 'selected' : ''}>PENDIENTE</option>
        <option value="aprobada" ${request.estado_solicitud === 'aprobada' ? 'selected' : ''}>APROBAR</option>
        <option value="rechazada" ${request.estado_solicitud === 'rechazada' ? 'selected' : ''}>RECHAZAR</option>
      </select>
    </article>
  `;
}

function createUserRequestHtml(request, animal, db, user) {
  const satisfaccion = (db.satisfaccion_formularios || []).find(f => f.ID_solicitud === request.ID_solicitud);
  const isApproved = request.estado_solicitud === 'aprobada';
  const needsForm = isApproved && !satisfaccion;
  const hasForm = isApproved && satisfaccion;

  let actionHtml = `<span class="profile-status-pill">${statusLabel(request.estado_solicitud)}</span>`;

  if (needsForm) {
    actionHtml = `
      <div class="satisfaction-action-col">
        <span class="profile-status-pill profile-status-pill-approved">${statusLabel(request.estado_solicitud)}</span>
        <button type="button" class="satisfaction-fill-btn" data-open-satisfaction="${request.ID_solicitud}">
          <i class="fa-solid fa-clipboard-check"></i> Llenar Formulario de Satisfacción
        </button>
      </div>
    `;
  } else if (hasForm) {
    actionHtml = `
      <div class="satisfaction-action-col">
        <span class="profile-status-pill profile-status-pill-approved">${statusLabel(request.estado_solicitud)}</span>
        <div class="satisfaction-completed-badge">
          <i class="fa-solid fa-circle-check"></i> Formulario enviado
        </div>
      </div>
    `;
  }

  return `
    <article class="profile-request-card profile-request-card-user">
      <div class="profile-request-animal">
        ${animal?.imagen ? `<img src="${animal.imagen.startsWith('idb://') ? '' : animal.imagen}" ${animal.imagen.startsWith('idb://') ? `data-idb-src="${animal.imagen}"` : ''} alt="${animal.nombre}">` : '<div class="profile-thumb-placeholder"><i class="fa-solid fa-image"></i></div>'}
        <div>
          <h3>${animal?.nombre || 'Animal'}</h3>
          <p>${animal?.ciudad || 'Colombia'}</p>
        </div>
      </div>
      ${actionHtml}
    </article>
  `;
}

function updateRequestStatus(requestId, nextStatus) {
  const db = readDb();
  const request = db.solicitudes_adopcion.find(item => item.ID_solicitud === requestId);
  if (!request) return;
  const animal = animalById(db, request.ID_animal);
  addChange(db, request.ID_usuario, 'estado_solicitud', request.estado_solicitud, nextStatus);
  request.estado_solicitud = nextStatus;
  addActivity(db, getCurrentUser().ID_usuario, 'revisar solicitud', `Solicitud de ${animal?.nombre || 'animal'} marcada como ${nextStatus}.`);
  addNotification(db, request.ID_usuario, 'adopción', `Tu solicitud para ${animal?.nombre || 'un animal'} fue marcada como ${statusLabel(nextStatus)}.`);

  // Si se aprueba la solicitud, enviar notificación de formulario de satisfacción
  if (nextStatus === 'aprobada') {
    const refugio = getCurrentUser();
    addNotification(db, request.ID_usuario, 'satisfacción',
      `¡Felicidades! Tu adopción de ${animal?.nombre || 'un animal'} ha sido aprobada por ${refugio?.nombre_completo || 'el refugio'}. Por favor llena el formulario de satisfacción en tus solicitudes.`);
  }

  saveDb(db);
  renderRequestsView();
}

function renderFavoritesView() {
  const container = document.querySelector('[data-favorites-list]');
  const pagination = document.querySelector('[data-favorites-pagination]');
  if (!container) return;

  const db = readDb();
  const user = getCurrentUser();
  const perPage = 6;
  const favoriteAnimals = db.favoritos_intereses
    .filter(favorite => favorite.ID_usuario === user.ID_usuario)
    .map(favorite => animalById(db, favorite.ID_animal))
    .filter(Boolean);

  if (!favoriteAnimals.length) {
    container.innerHTML = '<div class="profile-empty">Todavía no tienes animales guardados.</div>';
    if (pagination) pagination.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(favoriteAnimals.length / perPage);
  const storedPage = Number(sessionStorage.getItem(FAVORITES_PAGE_KEY) || '1');
  const currentPage = Math.min(Math.max(storedPage, 1), totalPages);
  const start = (currentPage - 1) * perPage;
  const visibleAnimals = favoriteAnimals.slice(start, start + perPage);

  sessionStorage.setItem(FAVORITES_PAGE_KEY, String(currentPage));

  container.innerHTML = visibleAnimals.map(animal => {
    const isIdb = animal.imagen && animal.imagen.startsWith('idb://');
    const srcAttr = isIdb ? '' : escapeAttr(animal.imagen);
    const dataIdbAttr = isIdb ? `data-idb-src="${escapeAttr(animal.imagen)}"` : '';
    return `
    <button type="button" class="profile-favorite-card" data-favorite-animal="${escapeAttr(animal.ID_animal)}">
      ${animal.imagen ? `<img src="${srcAttr}" ${dataIdbAttr} alt="${escapeAttr(animal.nombre)}">` : '<div class="profile-thumb-placeholder"><i class="fa-solid fa-image"></i></div>'}
      <div>
        <h3>${escapeHtml(animal.nombre)}</h3>
        <p>${escapeHtml(animal.ciudad)}</p>
      </div>
    </button>
  `}).join('');

  container.querySelectorAll('[data-favorite-animal]').forEach(card => {
    card.addEventListener('click', () => openFavoriteAnimalModal(card.dataset.favoriteAnimal));
  });

  if (!pagination) return;
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  pagination.innerHTML = `
    <button type="button" data-favorites-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    ${Array.from({ length: totalPages }, (_, index) => {
      const page = index + 1;
      return `<button type="button" class="${page === currentPage ? 'profile-page-active' : ''}" data-favorites-page="${page}">${page}</button>`;
    }).join('')}
    <button type="button" data-favorites-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;

  pagination.querySelectorAll('[data-favorites-page]').forEach(button => {
    button.addEventListener('click', () => {
      const nextPage = Number(button.dataset.favoritesPage);
      if (!nextPage || nextPage < 1 || nextPage > totalPages) return;
      sessionStorage.setItem(FAVORITES_PAGE_KEY, String(nextPage));
      renderFavoritesView();
    });
  });
}

function openFavoriteAnimalModal(animalId) {
  const modal = document.querySelector('[data-profile-animal-modal]');
  if (!modal) return;

  const db = readDb();
  const animal = animalById(db, animalId);
  if (!animal) return;

  const image = modal.querySelector('[data-profile-animal-image]');
  const placeholder = modal.querySelector('[data-profile-animal-placeholder]');
  const sizeLabels = {
    pequeno: 'Pequeño',
    mediano: 'Mediano',
    grande: 'Grande'
  };
  const healthLabels = {
    sano: 'Sano',
    tratamiento: 'En tratamiento'
  };

  modal.querySelector('[data-profile-animal-name]').textContent = animal.nombre;
  modal.querySelector('[data-profile-animal-meta]').textContent = `${animal.raza} • ${animal.ciudad}`;
  modal.querySelector('[data-profile-animal-gender]').textContent = animal.sexo || 'Por definir';
  modal.querySelector('[data-profile-animal-size]').textContent = sizeLabels[animal.tamano] || 'Por definir';
  modal.querySelector('[data-profile-animal-health]').textContent = healthLabels[animal.estado_salud] || 'Por definir';
  modal.querySelector('[data-profile-animal-vaccinated]').textContent = animal.vacunado === 'Pendiente' ? 'Pendiente' : `✓ ${animal.vacunado}`;
  modal.querySelector('[data-profile-animal-sterilized]').textContent = animal.esterilizado === 'Pendiente' ? 'Pendiente' : `✓ ${animal.esterilizado}`;
  modal.querySelector('[data-profile-animal-story]').textContent = animal.historia || animal.descripcion || 'Sin historia registrada.';

  if (animal.imagen) {
    if (animal.imagen.startsWith('idb://')) {
      image.src = '';
      image.setAttribute('data-idb-src', animal.imagen);
      image.removeAttribute('data-idb-resolved');
    } else {
      image.src = animal.imagen.replace('w=400', 'w=900');
      image.removeAttribute('data-idb-src');
    }
    image.alt = animal.nombre;
    image.classList.remove('hidden');
    placeholder.classList.add('hidden');
    placeholder.classList.remove('flex');
  } else {
    image.removeAttribute('src');
    image.alt = '';
    image.classList.add('hidden');
    placeholder.classList.remove('hidden');
    placeholder.classList.add('flex');
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  modal.querySelectorAll('[data-profile-animal-close]').forEach(button => {
    button.onclick = closeFavoriteAnimalModal;
  });

  modal.onclick = event => {
    if (!event.target.closest('.animal-detail-modal')) closeFavoriteAnimalModal();
  };
}

function closeFavoriteAnimalModal() {
  const modal = document.querySelector('[data-profile-animal-modal]');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderMessagesView() {
  const conversationList = document.querySelector('[data-conversation-list]');
  const messagePanel = document.querySelector('[data-message-panel]');
  if (!conversationList || !messagePanel) return;

  const db = readDb();
  const user = getCurrentUser();
  const conversations = db.conversaciones.filter(conversation => conversation.participantes.includes(user.ID_usuario));

  if (!conversations.length) {
    conversationList.innerHTML = '<div class="profile-empty">No hay conversaciones.</div>';
    messagePanel.innerHTML = '<h2>Selecciona una conversación</h2>';
    return;
  }

  const storedSelectedId = sessionStorage.getItem(SELECTED_CONVERSATION_KEY);
  const selectedId = conversations.some(conversation => conversation.ID_conversacion === storedSelectedId)
    ? storedSelectedId
    : conversations[0].ID_conversacion;
  sessionStorage.setItem(SELECTED_CONVERSATION_KEY, selectedId);

  conversationList.innerHTML = conversations.map(conversation => {
    const otherId = conversation.participantes.find(id => id !== user.ID_usuario);
    const other = userById(db, otherId);
    const animal = animalById(db, conversation.ID_animal);
    const isActive = conversation.ID_conversacion === selectedId;
    return `
      <button type="button" class="profile-conversation-card ${isActive ? 'profile-conversation-active' : ''}" data-conversation="${escapeAttr(conversation.ID_conversacion)}">
        <span>CONVERSACIÓN CON</span>
        <strong>${escapeHtml(other?.nombre_completo || 'usuario')}</strong>
        ${animal ? `<small>${escapeHtml(animal.nombre)}</small>` : ''}
      </button>
    `;
  }).join('');

  renderConversationPanel(selectedId);

  conversationList.querySelectorAll('[data-conversation]').forEach(button => {
    button.addEventListener('click', () => {
      sessionStorage.setItem(SELECTED_CONVERSATION_KEY, button.dataset.conversation);
      renderMessagesView();
    });
  });
}

function renderConversationPanel(conversationId) {
  const messagePanel = document.querySelector('[data-message-panel]');
  if (!messagePanel) return;

  const db = readDb();
  const user = getCurrentUser();
  const conversation = db.conversaciones.find(item => item.ID_conversacion === conversationId && item.participantes.includes(user.ID_usuario));
  if (!conversation) {
    messagePanel.innerHTML = '<h2>Selecciona una conversación</h2>';
    return;
  }

  const otherId = conversation.participantes.find(id => id !== user.ID_usuario);
  const other = userById(db, otherId);
  const animal = animalById(db, conversation.ID_animal);
  const messages = db.mensajes.filter(message => message.ID_conversacion === conversation.ID_conversacion);

  messagePanel.innerHTML = `
    <header class="profile-message-header">
      <div>
        <h2>${escapeHtml(other?.nombre_completo || 'usuario')}</h2>
        <p>${animal ? `Chat sobre ${escapeHtml(animal.nombre)}` : escapeHtml(conversation.titulo)}</p>
      </div>
    </header>
    <div class="profile-message-list" data-active-message-list>
      ${messages.map(message => {
        const author = userById(db, message.ID_usuario);
        const mine = message.ID_usuario === user.ID_usuario;
        return `
          <div class="profile-message ${mine ? 'profile-message-own' : ''}">
            <strong>${escapeHtml(author?.nombre_completo || 'usuario')}</strong>
            <p>${escapeHtml(message.contenido)}</p>
          </div>
        `;
      }).join('') || '<div class="profile-empty">No hay mensajes todavía. Escribe el primero.</div>'}
    </div>
    <form class="profile-message-composer" data-message-form>
      <input type="text" name="message" placeholder="Escribe un mensaje..." autocomplete="off" required>
      <button type="submit" aria-label="Enviar mensaje"><i class="fa-solid fa-paper-plane"></i></button>
    </form>
  `;

  const list = messagePanel.querySelector('[data-active-message-list]');
  list.scrollTop = list.scrollHeight;

  messagePanel.querySelector('[data-message-form]')?.addEventListener('submit', event => {
    event.preventDefault();
    const input = event.currentTarget.elements.message;
    const content = input.value.trim();
    if (!content) return;

    const nextDb = readDb();
    nextDb.mensajes.push({
      ID_mensaje: makeId('msg'),
      ID_conversacion: conversation.ID_conversacion,
      ID_usuario: user.ID_usuario,
      contenido: content,
      fecha_envio: new Date().toISOString()
    });
    addActivity(nextDb, user.ID_usuario, 'enviar mensaje', `Mensaje enviado en ${conversation.titulo}.`);
    if (otherId) addNotification(nextDb, otherId, 'mensaje', `${user.nombre_completo} te envió un mensaje.`);
    saveDb(nextDb);
    input.value = '';
    renderConversationPanel(conversation.ID_conversacion);
  });
}

function initShelterForms() {
  const animalForm = document.querySelector('[data-shelter-animal-form]');
  const contentForm = document.querySelector('[data-shelter-content-form]');

  animalForm?.addEventListener('submit', event => {
    event.preventDefault();
    const user = getCurrentUser();
    if (!hasPermission('animals:create', user)) return;
    const form = new FormData(animalForm);
    const db = readDb();
    const animalId = String(form.get('animalId') || '');
    const existingAnimal = db.animales_adopcion.find(animal => animal.ID_animal === animalId && animal.ID_refugio === user.ID_usuario);
    const nextAnimal = {
      ID_animal: existingAnimal?.ID_animal || makeId('animal'),
      ID_refugio: existingAnimal?.ID_refugio || user.ID_usuario,
      nombre: String(form.get('name') || 'Nuevo animal').trim(),
      especie: String(form.get('species') || 'perros'),
      raza: String(form.get('breed') || 'CRIOLLO').trim().toUpperCase(),
      edad: String(form.get('age') || 'RECIÉN LLEGADO').trim().toUpperCase(),
      ciudad: String(form.get('city') || 'Bogotá').trim(),
      ubicacion_key: normalizeLocation(form.get('city') || 'Bogotá'),
      estado_salud: String(form.get('health') || 'sano'),
      tamano: String(form.get('size') || 'mediano'),
      sexo: String(form.get('gender') || 'Por definir'),
      vacunado: 'Vacunado',
      esterilizado: 'Pendiente',
      imagen: String(form.get('image') || '').trim(),
      descripcion: String(form.get('description') || 'Ficha creada por el refugio.').trim(),
      historia: String(form.get('description') || 'Ficha creada por el refugio.').trim(),
      estado_publicacion: existingAnimal?.estado_publicacion || 'publicado'
    };

    if (existingAnimal) {
      Object.assign(existingAnimal, nextAnimal);
      addActivity(db, user.ID_usuario, 'editar animal', `Ficha actualizada para ${nextAnimal.nombre}.`);
    } else {
      db.animales_adopcion.push(nextAnimal);
      addActivity(db, user.ID_usuario, 'publicar animal', `Ficha creada para ${nextAnimal.nombre}.`);
    }

    saveDb(db);
    animalForm.reset();
    renderShelterPanel();
  });

  contentForm?.addEventListener('submit', event => {
    event.preventDefault();
    const user = getCurrentUser();
    if (!hasPermission('campaigns:create', user)) return;
    const form = new FormData(contentForm);
    const type = String(form.get('type') || 'campana');
    const record = {
      ID_contenido: makeId(type),
      ID_usuario: user.ID_usuario,
      titulo: String(form.get('title') || '').trim(),
      descripcion: String(form.get('description') || '').trim(),
      fecha_creacion: new Date().toISOString()
    };
    const target = type === 'evento' ? 'eventos_refugio' : type === 'noticia' ? 'noticias_destacadas' : 'campanas';
    dbPushContent(target, record);
    contentForm.reset();
    renderShelterPanel();
  });
}

function dbPushContent(target, record) {
  const db = readDb();
  db[target].push(record);
  addActivity(db, getCurrentUser().ID_usuario, 'crear contenido', `Se creó ${record.titulo}.`);
  saveDb(db);
}

// ─── EVENTOS, NOTICIAS Y CAMPAÑAS ──────────────────────────────────────
// Gestión de contenido dinámico para eventos de salud, noticias de impacto y campañas de recaudación.
function initEventsContent() {
  if (!document.querySelector('[data-page="eventos"]')) return;

  const permissionByType = {
    campana: 'campaigns:create',
    noticia: 'news:create',
    evento: 'events:create'
  };

  renderEventsContent();

  document.querySelectorAll('[data-open-content-modal]').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.openContentModal;
      if (!hasPermission(permissionByType[type])) return;
      
      // Aseguramos que el formulario esté vacío al crear nuevo contenido
      const form = document.querySelector(`[data-event-content-form="${type}"]`);
      if (form) form.reset();
      
      openEventContentModal(type);
    });
  });

  document.querySelectorAll('[data-close-content-modal]').forEach(button => {
    button.addEventListener('click', closeEventContentModal);
  });

  document.querySelectorAll('[data-event-content-modal]').forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target === modal) closeEventContentModal();
    });
  });

  // Agregar validadores de archivo multimedia
  document.querySelectorAll('[data-event-content-form]').forEach(form => {
    const mediaInput = form.querySelector('input[name="media"]');
    if (mediaInput) {
      mediaInput.addEventListener('change', (event) => {
        validateMediaFile(event.target);
      });
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      saveEventContent(form.dataset.eventContentForm, form);
    });
  });

  // Listeners para cerrar el modal de detalles
  document.querySelectorAll('[data-close-detail-modal]').forEach(button => {
    button.addEventListener('click', closeContentDetailModal);
  });
  
  const detailModal = document.querySelector('[data-event-detail-modal]');
  if (detailModal) {
    detailModal.addEventListener('click', event => {
      if (event.target === detailModal) closeContentDetailModal();
    });
  }
}

function validateMediaFile(fileInput) {
  const file = fileInput.files[0];
  if (!file) return true;

  const MAX_SIZE = 150 * 1024 * 1024; // 150 MB (aumentado para videos)
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'video/mp4',
    'video/webm',
    'video/quicktime', // MOV
    'audio/mpeg', // MP3
    'video/x-msvideo' // AVI
  ];

  // Función para formatear tamaño con unidades correctas
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  const fileSizeFormatted = formatFileSize(file.size);
  const maxSizeFormatted = formatFileSize(MAX_SIZE);
  
  // Validar tamaño
  if (file.size > MAX_SIZE) {
    alert(`❌ El archivo es demasiado grande.\n\nArchivo: "${file.name}"\nTamaño actual: ${fileSizeFormatted}\nTamaño máximo permitido: ${maxSizeFormatted}`);
    fileInput.value = '';
    return false;
  }

  // Validar tipo de archivo por MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    alert(`❌ Formato de archivo no permitido.\n\nArchivo: "${file.name}"\nTipo: ${file.type || 'desconocido'}\n\nFormatos soportados:\n• Imágenes: JPG, PNG, GIF, WebP\n• Videos: MP4, WebM, MOV, AVI\n• Documentos: PDF`);
    fileInput.value = '';
    return false;
  }

  console.log(`✅ Archivo válido: ${file.name} (${fileSizeFormatted}, ${file.type})`);
  return true;
}

function openEventContentModal(type) {
  const modal = document.querySelector(`[data-event-content-modal="${type}"]`);
  const form = document.querySelector(`[data-event-content-form="${type}"]`);
  if (!modal || !form) return;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  form.querySelector('input, select, textarea')?.focus();
}

function closeEventContentModal() {
  document.querySelectorAll('[data-event-content-modal]').forEach(modal => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  });
  
  // Limpiar datos de edición de todos los formularios
  document.querySelectorAll('[data-event-content-form]').forEach(form => {
    delete form.dataset.editingContentId;
    delete form.dataset.editingContentType;
    
    // Restaurar texto del botón
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.dataset.originalText) {
      submitBtn.textContent = submitBtn.dataset.originalText;
      delete submitBtn.dataset.originalText;
    }
  });
  
  document.body.classList.remove('modal-open');
}

function openContentDetailModal(type, id) {
  const db = readDb();
  let item = null;
  if (type === 'campana') item = db.campanas.find(c => c.ID_contenido === id);
  else if (type === 'noticia') item = db.noticias_destacadas.find(c => c.ID_contenido === id);
  else if (type === 'evento') item = db.eventos_refugio.find(c => c.ID_contenido === id);
  else if (type === 'educacion') item = db.contenido_educativo.find(c => c.ID_contenido === id);
  
  if (!item) return;
  
  const modal = document.querySelector('[data-event-detail-modal]');
  if (!modal) return;
  
  const author = userById(db, item.ID_usuario);
  
  modal.querySelector('[data-detail-category]').textContent = (item.categoria || item.tipo || type).toUpperCase();
  modal.querySelector('[data-detail-title]').textContent = item.titulo;
  modal.querySelector('[data-detail-description]').textContent = item.descripcion;
  modal.querySelector('[data-detail-author-name]').textContent = author?.nombre_completo || 'Usuario';
  modal.querySelector('[data-detail-author-initials]').textContent = getInitials(author?.nombre_completo || 'HP');
  
  // Media container
  const mediaContainer = modal.querySelector('[data-detail-media-container]');
  let mediaHtml = createContentMedia(item.multimedia || item.imagen, item.titulo, 'h-64');
  if (item.multimedia2) {
    mediaHtml += '<div class="mt-4">' + createContentMedia(item.multimedia2, item.titulo + ' adicional', 'h-64') + '</div>';
  }
  mediaContainer.innerHTML = mediaHtml;
  
  // Meta container
  const metaContainer = modal.querySelector('[data-detail-meta-container]');
  let metaHtml = '';
  if (type === 'campana') {
    metaHtml = `
      <div class="bg-blue-50 p-3 rounded-xl">
        <p class="text-[10px] text-brand-blue font-bold uppercase mb-1">Meta del Objetivo</p>
        <p class="text-sm font-bold text-brand-dark">${escapeHtml(item.meta_objetivo || 'Por definir')}</p>
      </div>
    `;
  } else if (type === 'noticia') {
    metaHtml = `
      <div class="bg-blue-50 p-3 rounded-xl col-span-2">
        <p class="text-[10px] text-brand-blue font-bold uppercase mb-1">Resumen</p>
        <p class="text-sm font-medium text-brand-dark">${escapeHtml(item.resumen || '')}</p>
      </div>
    `;
  } else if (type === 'evento') {
    metaHtml = `
      <div class="bg-blue-50 p-3 rounded-xl">
        <p class="text-[10px] text-brand-blue font-bold uppercase mb-1">Fecha y Hora</p>
        <p class="text-sm font-bold text-brand-dark">${formatContentDate(item.fecha_evento)} • ${item.hora_evento}</p>
      </div>
      <div class="bg-blue-50 p-3 rounded-xl">
        <p class="text-[10px] text-brand-blue font-bold uppercase mb-1">Ubicación</p>
        <p class="text-sm font-bold text-brand-dark">${escapeHtml(item.ubicacion)}</p>
      </div>
    `;
  } else if (type === 'educacion') {
    metaHtml = `
      <div class="bg-blue-50 p-3 rounded-xl col-span-2">
        <p class="text-[10px] text-brand-blue font-bold uppercase mb-1">Categoría</p>
        <p class="text-sm font-bold text-brand-dark">${escapeHtml(item.categoria || 'Guía')}</p>
      </div>
    `;
  }
  metaContainer.innerHTML = metaHtml;
  
  // Actions
  const actionsContainer = modal.querySelector('[data-detail-actions]');
  const currentUser = getCurrentUser();
  if (type === 'evento') {
    const isAttending = currentUser && (db.asistencias_eventos || []).some(a => a.ID_evento === item.ID_contenido && a.ID_usuario === currentUser.ID_usuario);
    const attendBtnText = isAttending ? 'Confirmado' : 'Asistir al Evento';
    const attendBtnClass = isAttending ? 'bg-brand-blue' : 'bg-brand-dark';
    
    actionsContainer.innerHTML = `
      <button class="attend-btn ${attendBtnClass} text-white text-sm px-8 py-2.5 rounded-full hover:opacity-90 transition shadow-sm font-bold"
              data-event-id="${escapeAttr(item.ID_contenido)}">
        ${isAttending ? '<i class="fa-solid fa-check mr-1"></i>' : ''} ${attendBtnText}
      </button>
    `;
  } else if (type === 'campana') {
    actionsContainer.innerHTML = `<button class="bg-brand-blue text-white text-sm px-8 py-2.5 rounded-full hover:bg-blue-600 transition shadow-sm font-bold">Donar / Apoyar</button>`;
  } else {
    actionsContainer.innerHTML = '';
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeContentDetailModal() {
  const modal = document.querySelector('[data-event-detail-modal]');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function openEditContentModal(contentType, contentId) {
  const db = readDb();
  let content = null;
  let typeKey = '';

  // Encontrar el contenido según el tipo
  if (contentType === 'campana') {
    content = db.campanas.find(c => c.ID_contenido === contentId);
    typeKey = 'campana';
  } else if (contentType === 'noticia') {
    content = db.noticias_destacadas.find(c => c.ID_contenido === contentId);
    typeKey = 'noticia';
  } else if (contentType === 'evento') {
    content = db.eventos_refugio.find(c => c.ID_contenido === contentId);
    typeKey = 'evento';
  } else if (contentType === 'educacion') {
    content = db.contenido_educativo.find(c => c.ID_contenido === contentId);
    typeKey = 'educacion';
  }

  if (!content) {
    alert('❌ No se encontró el contenido a editar.');
    return;
  }

  const user = getCurrentUser();
  if (user.ID_usuario !== content.ID_usuario && user.rol_usuario !== 'admin') {
    alert('❌ No tienes permiso para editar este contenido.');
    return;
  }

  // Llenar el formulario con los datos actuales
  const form = document.querySelector(`[data-event-content-form="${typeKey}"]`);
  if (!form) return;

  form.reset();
  
  // Llenar los campos
  form.elements.title.value = content.titulo || '';
  form.elements.description.value = content.descripcion || '';

  if (typeKey === 'campana') {
    form.elements.category.value = content.categoria || 'Recaudación';
    form.elements.goal.value = content.meta_objetivo || '';
  } else if (typeKey === 'noticia') {
    form.elements.category.value = content.categoria || 'Actualización';
    form.elements.summary.value = content.resumen || '';
  } else if (typeKey === 'evento') {
    form.elements.date.value = content.fecha_evento || '';
    form.elements.time.value = content.hora_evento || '';
    form.elements.location.value = content.ubicacion || '';
  } else if (typeKey === 'educacion') {
    form.elements.category.value = content.categoria || 'GUÍA ADOPTANTE';
  }

  // Guardar el ID del contenido para saber que es edición
  form.dataset.editingContentId = contentId;
  form.dataset.editingContentType = contentType;

  // Cambiar el texto del botón
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.dataset.originalText = originalText;
  submitBtn.textContent = typeKey === 'campana' ? 'Guardar Campaña' : typeKey === 'noticia' ? 'Guardar Noticia' : typeKey === 'educacion' ? 'Guardar Contenido' : 'Guardar Evento';

  openEventContentModal(typeKey);
}

function deleteContent(contentType, contentId) {
  const db = readDb();
  const user = getCurrentUser();
  let content = null;
  let typeKey = '';

  // Encontrar el contenido
  if (contentType === 'campana') {
    content = db.campanas.find(c => c.ID_contenido === contentId);
    typeKey = 'campanas';
  } else if (contentType === 'noticia') {
    content = db.noticias_destacadas.find(c => c.ID_contenido === contentId);
    typeKey = 'noticias_destacadas';
  } else if (contentType === 'evento') {
    content = db.eventos_refugio.find(c => c.ID_contenido === contentId);
    typeKey = 'eventos_refugio';
  } else if (contentType === 'educacion') {
    content = db.contenido_educativo.find(c => c.ID_contenido === contentId);
    typeKey = 'contenido_educativo';
  }

  if (!content) {
    alert('❌ No se encontró el contenido a eliminar.');
    return;
  }

  // Verificar permisos
  if (user.ID_usuario !== content.ID_usuario && user.rol_usuario !== 'admin') {
    alert('❌ No tienes permiso para eliminar este contenido.');
    return;
  }

  // Eliminar el contenido
  const index = db[typeKey].findIndex(c => c.ID_contenido === contentId);
  if (index > -1) {
    const title = content.titulo;
    db[typeKey].splice(index, 1);
    saveDb(db);
    addActivity(db, user.ID_usuario, 'eliminar contenido', `Contenido eliminado: ${title}.`);
    renderEventsContent();
    renderEducationContent();
    renderShelterPanel();
    alert('✅ Contenido eliminado exitosamente.');
  }
}

async function saveEventContent(type, form) {
  const user = getCurrentUser();
  const permissionByType = {
    campana: 'campaigns:create',
    noticia: 'news:create',
    evento: 'events:create',
    educacion: 'education:create'
  };
  if (!hasPermission(permissionByType[type], user)) return;

  const file = form.elements.media?.files?.[0];
  const file2 = form.elements.media2?.files?.[0];
  const isEditing = !!form.dataset.editingContentId;
  
  // Función auxiliar para formatear tamaño
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }
  
  // Validar tamaño de archivo (máximo 150 MB para videos)
  const MAX_SIZE = 150 * 1024 * 1024;
  if (file && file.size > MAX_SIZE) {
    const fileSize = formatFileSize(file.size);
    const maxSize = formatFileSize(MAX_SIZE);
    alert(`❌ El archivo es demasiado grande.\n\nTamaño actual: ${fileSize}\nTamaño máximo permitido: ${maxSize}`);
    return;
  }
  if (file2 && file2.size > MAX_SIZE) {
    const fileSize = formatFileSize(file2.size);
    const maxSize = formatFileSize(MAX_SIZE);
    alert(`❌ El segundo archivo es demasiado grande.\n\nTamaño actual: ${fileSize}\nTamaño máximo permitido: ${maxSize}`);
    return;
  }

  // Mostrar indicador de carga
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn?.textContent;
  if (submitBtn) submitBtn.textContent = '⏳ Guardando...';
  if (submitBtn) submitBtn.disabled = true;

  try {
    const db = readDb();
    const now = new Date().toISOString();
    const title = String(form.elements.title?.value || '').trim();
    const description = String(form.elements.description?.value || '').trim();
    
    if (!title || !description) {
      alert('⚠️ Por favor completa todos los campos requeridos');
      return;
    }

    if (isEditing) {
      // MODO EDICIÓN
      const contentId = form.dataset.editingContentId;
      const contentType = form.dataset.editingContentType;
      let content = null;

      if (contentType === 'campana') {
        content = db.campanas.find(c => c.ID_contenido === contentId);
        if (content) {
          content.titulo = title;
          content.categoria = String(form.elements.category?.value || 'Recaudacion').trim();
          content.meta_objetivo = String(form.elements.goal?.value || '').trim();
          content.descripcion = description;
          if (file) content.multimedia = await readSelectedImage(file, content.multimedia);
          content.fecha_actualizacion = now;
          addActivity(db, user.ID_usuario, 'editar campaña', `Campaña actualizada: ${title}.`);
        }
      }

      if (contentType === 'noticia') {
        content = db.noticias_destacadas.find(c => c.ID_contenido === contentId);
        if (content) {
          content.titulo = title;
          content.categoria = String(form.elements.category?.value || 'Actualizacion').trim();
          content.resumen = String(form.elements.summary?.value || '').trim();
          content.descripcion = description;
          if (file) content.multimedia = await readSelectedImage(file, content.multimedia);
          content.fecha_actualizacion = now;
          addActivity(db, user.ID_usuario, 'editar noticia', `Noticia actualizada: ${title}.`);
        }
      }

      if (contentType === 'evento') {
        content = db.eventos_refugio.find(c => c.ID_contenido === contentId);
        if (content) {
          content.titulo = title;
          content.fecha_evento = String(form.elements.date?.value || '').trim();
          content.hora_evento = String(form.elements.time?.value || '').trim();
          content.ubicacion = String(form.elements.location?.value || '').trim();
          content.descripcion = description;
          if (file) content.multimedia = await readSelectedImage(file, content.multimedia);
          content.fecha_actualizacion = now;
          addActivity(db, user.ID_usuario, 'editar evento', `Evento actualizado: ${title}.`);
        }
      }

      if (contentType === 'educacion') {
        content = db.contenido_educativo.find(c => c.ID_contenido === contentId);
        if (content) {
          content.titulo = title;
          content.categoria = String(form.elements.category?.value || 'GUÍA ADOPTANTE').trim();
          content.descripcion = description;
          if (file) content.multimedia = await readSelectedImage(file, content.multimedia);
          if (file2) content.multimedia2 = await readSelectedImage(file2, content.multimedia2);
          content.fecha_actualizacion = now;
          addActivity(db, user.ID_usuario, 'editar educacion', `Contenido educativo actualizado: ${title}.`);
        }
      }

      // Limpiar los datos de edición del formulario
      delete form.dataset.editingContentId;
      delete form.dataset.editingContentType;
    } else {
      // MODO CREACIÓN
      const media = await readSelectedImage(file, '');
      const media2 = file2 ? await readSelectedImage(file2, '') : '';

      if (type === 'campana') {
        db.campanas.push({
          ID_contenido: makeId('campana'),
          ID_usuario: user.ID_usuario,
          titulo: title,
          categoria: String(form.elements.category?.value || 'Recaudacion').trim(),
          meta_objetivo: String(form.elements.goal?.value || '').trim(),
          descripcion: description,
          multimedia: media,
          fecha_creacion: now
        });
        addActivity(db, user.ID_usuario, 'crear campana', `Campaña creada: ${title}.`);
      }

      if (type === 'noticia') {
        db.noticias_destacadas.push({
          ID_contenido: makeId('noticia'),
          ID_usuario: user.ID_usuario,
          titulo: title,
          categoria: String(form.elements.category?.value || 'Actualizacion').trim(),
          resumen: String(form.elements.summary?.value || '').trim(),
          descripcion: description,
          multimedia: media,
          fecha_creacion: now
        });
        addActivity(db, user.ID_usuario, 'crear noticia', `Noticia creada: ${title}.`);
      }

      if (type === 'evento') {
        db.eventos_refugio.push({
          ID_contenido: makeId('evento'),
          ID_usuario: user.ID_usuario,
          titulo: title,
          fecha_evento: String(form.elements.date?.value || '').trim(),
          hora_evento: String(form.elements.time?.value || '').trim(),
          ubicacion: String(form.elements.location?.value || '').trim(),
          descripcion: description,
          multimedia: media,
          estado: 'ABIERTO',
          fecha_creacion: now
        });
        addActivity(db, user.ID_usuario, 'crear evento', `Evento creado: ${title}.`);
      }

      if (type === 'educacion') {
        db.contenido_educativo.push({
          ID_contenido: makeId('educacion'),
          ID_usuario: user.ID_usuario,
          titulo: title,
          categoria: String(form.elements.category?.value || 'GUÍA ADOPTANTE').trim(),
          descripcion: description,
          multimedia: media,
          multimedia2: media2,
          fecha_creacion: now
        });
        addActivity(db, user.ID_usuario, 'crear educacion', `Contenido educativo creado: ${title}.`);
      }
    }

    saveDb(db);
    closeEventContentModal();
    renderEventsContent();
    renderEducationContent();
    renderShelterPanel();
    alert('✅ Contenido ' + (isEditing ? 'actualizado' : 'publicado') + ' exitosamente');
  } catch (error) {
    console.error('Error al guardar contenido:', error);
    alert('❌ Error al guardar el contenido. Por favor intenta de nuevo.');
  } finally {
    if (submitBtn) {
      submitBtn.textContent = originalText || (type === 'campana' ? 'Publicar Campaña' : type === 'noticia' ? 'Publicar Noticia' : type === 'educacion' ? 'Publicar Contenido' : 'Crear Evento');
      submitBtn.disabled = false;
    }
  }
}

function renderEventsContent() {
  const db = readDb();
  const campaignsContainer = document.querySelector('[data-campaigns-list]');
  const newsContainer = document.querySelector('[data-news-list]');
  const eventsContainer = document.querySelector('[data-events-list]');

  if (campaignsContainer) {
    const campaigns = sortContentByDate(db.campanas);
    campaignsContainer.hidden = campaigns.length === 0;
    campaignsContainer.innerHTML = campaigns
      .map(item => createCampaignCard(item, db))
      .join('');
  }

  if (newsContainer) {
    const news = sortContentByDate(db.noticias_destacadas);
    newsContainer.hidden = news.length === 0;
    newsContainer.innerHTML = news
      .map(item => createNewsCard(item, db))
      .join('');
  }

  if (eventsContainer) {
    const events = sortContentByDate(db.eventos_refugio);
    eventsContainer.hidden = events.length === 0;
    eventsContainer.innerHTML = events
      .map(item => createEventCard(item, db))
      .join('');
  }

  // Agregar event listeners para editar y eliminar
  attachContentEventListeners();
}

function attachContentEventListeners() {
  // Listeners para botones de edición
  document.querySelectorAll('.content-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const contentType = btn.dataset.contentType;
      const contentId = btn.dataset.contentId;
      openEditContentModal(contentType, contentId);
    });
  });

  // Listeners para botones de eliminación
  document.querySelectorAll('.content-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const contentType = btn.dataset.contentType;
      const contentId = btn.dataset.contentId;
      if (confirm('¿Estás seguro de que deseas eliminar este contenido? Esta acción no se puede deshacer.')) {
        deleteContent(contentType, contentId);
      }
    });
  });

  // Listeners para botones de detalles
  document.querySelectorAll('[data-detail-trigger]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const contentType = trigger.dataset.contentType;
      const contentId = trigger.dataset.contentId;
      openContentDetailModal(contentType, contentId);
    });
  });
  // Listeners para botones de asistencia
  document.querySelectorAll('.attend-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const eventId = btn.dataset.eventId;
      toggleAttendance(eventId);
    });
  });
}

function toggleAttendance(eventId) {
  const user = getCurrentUser();
  if (!user) {
    alert('❌ Debes iniciar sesión para confirmar tu asistencia.');
    return;
  }
  
  const db = readDb();
  if (!db.asistencias_eventos) db.asistencias_eventos = [];
  
  const index = db.asistencias_eventos.findIndex(a => a.ID_evento === eventId && a.ID_usuario === user.ID_usuario);
  
  if (index !== -1) {
    // Quitar asistencia (Toggle off)
    db.asistencias_eventos.splice(index, 1);
  } else {
    // Agregar asistencia (Toggle on)
    db.asistencias_eventos.push({
      ID_asistencia: makeId('ast'),
      ID_evento: eventId,
      ID_usuario: user.ID_usuario,
      fecha_asistencia: new Date().toISOString()
    });
    
    // Notificar al autor del evento
    const event = db.eventos_refugio.find(e => e.ID_contenido === eventId);
    if (event && event.ID_usuario !== user.ID_usuario) {
      addNotification(db, event.ID_usuario, 'evento', `${user.nombre_completo} asistirá a tu evento: ${event.titulo}`);
    }
  }
  
  saveDb(db);
  renderEventsContent(); // Refrescar las tarjetas
  
  // Si el modal de detalle está abierto, refrescarlo también para mostrar el nuevo estado
  const detailModal = document.querySelector('[data-event-detail-modal]:not(.hidden)');
  if (detailModal) {
    openContentDetailModal('evento', eventId);
  }
}

function sortContentByDate(items) {
  return [...items].sort((a, b) => new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0));
}

function createCampaignCard(item, db) {
  const author = userById(db, item.ID_usuario);
  const image = item.multimedia || item.imagen || '';
  const currentUser = getCurrentUser();
  const canEdit = currentUser && (currentUser.ID_usuario === item.ID_usuario || currentUser.rol_usuario === 'admin');
  
  return `
    <article class="bg-brand-gray rounded-[1.5rem] p-2 pb-4" data-content-id="${escapeAttr(item.ID_contenido)}">
      <div class="cursor-pointer" data-detail-trigger data-content-type="campana" data-content-id="${escapeAttr(item.ID_contenido)}">
        ${createContentMedia(image, item.titulo, 'h-32')}
      </div>
      <div class="px-2">
        <div class="flex justify-between items-start gap-3 mb-1 cursor-pointer" data-detail-trigger data-content-type="campana" data-content-id="${escapeAttr(item.ID_contenido)}">
          <h4 class="font-bold text-brand-dark text-sm">${escapeHtml(item.titulo || 'Campaña')}</h4>
          <span class="text-[8px] bg-blue-100 text-brand-blue font-bold px-2 py-0.5 rounded-full">${escapeHtml(item.categoria || 'RECAUDACION')}</span>
        </div>
        <p class="text-[10px] text-gray-400 mb-2">META: ${escapeHtml(item.meta_objetivo || item.meta || 'Por definir')}</p>
        <div class="cursor-pointer" data-detail-trigger data-content-type="campana" data-content-id="${escapeAttr(item.ID_contenido)}">
          <p class="text-xs text-gray-500 line-clamp-2 mb-1">${escapeHtml(item.descripcion || '')}</p>
          <button type="button" class="text-[10px] text-brand-blue font-bold hover:underline mb-3">Ver detalles...</button>
        </div>
        <div class="flex justify-between items-center gap-2 mt-1">
          <p class="text-[10px] text-gray-400 font-medium">AUTOR: ${escapeHtml(author?.nombre_completo || 'REFUGIO')}</p>
          ${canEdit ? `
            <div class="flex gap-2">
              <button type="button" class="content-edit-btn text-[8px] bg-brand-blue text-white px-2 py-1 rounded hover:bg-blue-600" data-content-type="campana" data-content-id="${escapeAttr(item.ID_contenido)}" title="Editar">
                <i class="fa-solid fa-pencil"></i> Editar
              </button>
              <button type="button" class="content-delete-btn text-[8px] bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" data-content-type="campana" data-content-id="${escapeAttr(item.ID_contenido)}" title="Eliminar">
                <i class="fa-solid fa-trash"></i> Eliminar
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    </article>
  `;
}

function createNewsCard(item, db) {
  const author = userById(db, item.ID_usuario);
  const image = item.multimedia || item.imagen || '';
  const currentUser = getCurrentUser();
  const canEdit = currentUser && (currentUser.ID_usuario === item.ID_usuario || currentUser.rol_usuario === 'admin');
  
  return `
    <article class="bg-brand-gray rounded-[1.5rem] p-4" data-content-id="${escapeAttr(item.ID_contenido)}">
      <div class="cursor-pointer" data-detail-trigger data-content-type="noticia" data-content-id="${escapeAttr(item.ID_contenido)}">
        ${image ? createContentMedia(image, item.titulo, 'h-28') : ''}
      </div>
      <div class="flex justify-between items-start gap-3 mb-1 cursor-pointer" data-detail-trigger data-content-type="noticia" data-content-id="${escapeAttr(item.ID_contenido)}">
        <h4 class="font-bold text-brand-dark text-sm">${escapeHtml(item.titulo || 'Noticia')}</h4>
        <span class="text-[8px] bg-blue-100 text-brand-blue font-bold px-2 py-0.5 rounded-full">${escapeHtml(item.categoria || 'ACTUALIZACION')}</span>
      </div>
      <p class="text-xs text-brand-dark font-medium mb-2 mt-2">${escapeHtml(item.resumen || 'Resumen pendiente')}</p>
      <div class="cursor-pointer" data-detail-trigger data-content-type="noticia" data-content-id="${escapeAttr(item.ID_contenido)}">
        <p class="text-xs text-gray-500 line-clamp-3 mb-1">${escapeHtml(item.descripcion || '')}</p>
        <button type="button" class="text-[10px] text-brand-blue font-bold hover:underline mb-3">Leer noticia completa...</button>
      </div>
      <div class="flex justify-between items-center gap-2 mt-1">
        <p class="text-[10px] text-gray-400 font-medium">AUTOR: ${escapeHtml(author?.nombre_completo || 'REFUGIO')}</p>
        ${canEdit ? `
          <div class="flex gap-2">
            <button type="button" class="content-edit-btn text-[8px] bg-brand-blue text-white px-2 py-1 rounded hover:bg-blue-600" data-content-type="noticia" data-content-id="${escapeAttr(item.ID_contenido)}" title="Editar">
              <i class="fa-solid fa-pencil"></i> Editar
            </button>
            <button type="button" class="content-delete-btn text-[8px] bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" data-content-type="noticia" data-content-id="${escapeAttr(item.ID_contenido)}" title="Eliminar">
              <i class="fa-solid fa-trash"></i> Eliminar
            </button>
          </div>
        ` : ''}
      </div>
    </article>
  `;
}

function createEventCard(item, db) {
  const author = userById(db, item.ID_usuario);
  const image = item.multimedia || item.imagen || '';
  const dateLabel = [formatContentDate(item.fecha_evento || item.fecha), item.hora_evento, item.ubicacion]
    .filter(Boolean)
    .join(' • ');
  const currentUser = getCurrentUser();
  const canEdit = currentUser && (currentUser.ID_usuario === item.ID_usuario || currentUser.rol_usuario === 'admin');
  
  // Verificar si el usuario ya asiste
  const isAttending = currentUser && (db.asistencias_eventos || []).some(a => a.ID_evento === item.ID_contenido && a.ID_usuario === currentUser.ID_usuario);
  const attendBtnText = isAttending ? 'Asistiendo' : 'Asistir';
  const attendBtnClass = isAttending ? 'bg-brand-blue text-white' : 'bg-brand-dark text-white';
  
  return `
    <article class="bg-brand-gray rounded-[1.5rem] p-4" data-content-id="${escapeAttr(item.ID_contenido)}">
      <div class="cursor-pointer" data-detail-trigger data-content-type="evento" data-content-id="${escapeAttr(item.ID_contenido)}">
        ${image ? createContentMedia(image, item.titulo, 'h-28') : ''}
      </div>
      <div class="flex justify-between items-start gap-3 mb-1 cursor-pointer" data-detail-trigger data-content-type="evento" data-content-id="${escapeAttr(item.ID_contenido)}">
        <h4 class="font-bold text-brand-dark text-sm">${escapeHtml(item.titulo || 'Evento')}</h4>
        <span class="text-[8px] bg-blue-100 text-brand-blue font-bold px-2 py-0.5 rounded-full">${escapeHtml(item.estado || 'ABIERTO')}</span>
      </div>
      <p class="text-[10px] text-gray-400 mb-2">${escapeHtml(dateLabel || 'Fecha por definir')}</p>
      <div class="cursor-pointer" data-detail-trigger data-content-type="evento" data-content-id="${escapeAttr(item.ID_contenido)}">
        <p class="text-xs text-gray-500 line-clamp-2 mb-1">${escapeHtml(item.descripcion || '')}</p>
        <button type="button" class="text-[10px] text-brand-blue font-bold hover:underline mb-4">Ver detalles del evento...</button>
      </div>
      <div class="flex justify-between items-center gap-2 mt-1 flex-wrap">
        <p class="text-[10px] text-gray-400 font-medium">AUTOR: ${escapeHtml(author?.nombre_completo || 'REFUGIO')}</p>
        <div class="flex gap-2">
          ${canEdit ? `
            <button type="button" class="content-edit-btn text-[8px] bg-brand-blue text-white px-2 py-1 rounded hover:bg-blue-600" data-content-type="evento" data-content-id="${escapeAttr(item.ID_contenido)}" title="Editar">
              <i class="fa-solid fa-pencil"></i> Editar
            </button>
            <button type="button" class="content-delete-btn text-[8px] bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" data-content-type="evento" data-content-id="${escapeAttr(item.ID_contenido)}" title="Eliminar">
              <i class="fa-solid fa-trash"></i> Eliminar
            </button>
          ` : ''}
          <button type="button" 
                  class="attend-btn ${attendBtnClass} text-xs px-4 py-1.5 rounded-full hover:opacity-90 transition"
                  data-event-id="${escapeAttr(item.ID_contenido)}">
            ${isAttending ? '<i class="fa-solid fa-check mr-1"></i>' : ''} ${attendBtnText}
          </button>
        </div>
      </div>
    </article>
  `;
}

function createContentMedia(src, title, heightClass) {
  if (!src) {
    return `
      <div class="${heightClass} bg-white rounded-xl mb-3 flex flex-col items-center justify-center text-gray-300 border border-dashed border-gray-200">
        <i class="fa-solid fa-image mb-1"></i>
        <span class="text-[10px]">SIN MULTIMEDIA</span>
      </div>
    `;
  }

  // Detectar el tipo de contenido desde el dataURL o blob URL
  const mediaType = detectMediaType(src);
  const isIdb = src.startsWith('idb://');
  const srcAttr = isIdb ? '' : escapeAttr(src);
  const dataIdbAttr = isIdb ? `data-idb-src="${escapeAttr(src)}"` : '';
  
  if (mediaType === 'video' || mediaType === 'blob') {
    return `
      <div class="${heightClass} bg-gray-900 rounded-xl mb-3 overflow-hidden">
        <video src="${srcAttr}" ${dataIdbAttr} title="${escapeAttr(title || 'Contenido')}" 
               class="w-full h-full object-cover" controls style="background: #1F2937;">
        </video>
      </div>
    `;
  }
  
  if (mediaType === 'pdf') {
    return `
      <div class="${heightClass} bg-white rounded-xl mb-3 flex flex-col items-center justify-center text-red-500 border border-dashed border-red-200">
        <i class="fa-solid fa-file-pdf mb-2" style="font-size: 2rem;"></i>
        <span class="text-[10px]">ARCHIVO PDF</span>
        <a href="${srcAttr}" ${dataIdbAttr} download="${escapeAttr(title || 'documento')}.pdf" 
           class="text-[9px] text-brand-blue hover:underline mt-1">
          Descargar PDF
        </a>
      </div>
    `;
  }

  // Por defecto, mostrar como imagen
  return `
    <div class="${heightClass} bg-gray-200 rounded-xl mb-3 overflow-hidden">
      <img src="${srcAttr}" ${dataIdbAttr} alt="${escapeAttr(title || 'Contenido')}" class="w-full h-full object-cover" onerror="if(!this.hasAttribute('data-idb-src')) this.style.display='none';">
    </div>
  `;
}

function detectMediaType(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return 'image';
  
  // Detectar por dataURL MIME types
  if (dataUrl.includes('data:video/')) return 'video';
  if (dataUrl.includes('data:application/pdf')) return 'pdf';
  
  // Detectar por blob: URLs (no se puede saber el tipo, asumir video si es blob)
  if (dataUrl.startsWith('blob:')) {
    // Los blobs creados desde videos generalmente son Blob URLs
    // Asumimos que son videos si no hay otra evidencia
    // En el futuro, se podría almacenar el tipo MIME junto con el blob URL
    console.log('📌 Blob URL detectado:', dataUrl.substring(0, 30) + '...');
    return 'blob';
  }
  
  if (dataUrl.startsWith('idb://')) {
    if (dataUrl.includes('video/')) return 'video';
    if (dataUrl.includes('pdf')) return 'pdf';
    return 'image';
  }
  
  // Por defecto, asumir que es una imagen
  return 'image';
}

function formatContentDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-CO');
}

function normalizeLocation(value) {
  return String(value).trim().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

function renderShelterPanel() {
  const animalsList = document.querySelector('[data-shelter-animals]');
  const contentList = document.querySelector('[data-shelter-content]');
  if (!animalsList || !contentList) return;

  const db = readDb();
  const user = getCurrentUser();
  const animals = db.animales_adopcion.filter(animal => animal.ID_refugio === user.ID_usuario);
  const content = [
    ...db.campanas.map(item => ({ ...item, tipo: 'Campaña' })),
    ...db.eventos_refugio.map(item => ({ ...item, tipo: 'Evento' })),
    ...db.noticias_destacadas.map(item => ({ ...item, tipo: 'Noticia' })),
    ...db.contenido_educativo.map(item => ({ ...item, tipo: 'Educación' }))
  ].filter(item => item.ID_usuario === user.ID_usuario);

  animalsList.innerHTML = animals.map(animal => `
    <article class="profile-admin-row">
      <strong>${escapeHtml(animal.nombre)}</strong>
      <span>${escapeHtml(animal.raza)} • ${escapeHtml(animal.ciudad)}</span>
      <small>${escapeHtml(animal.estado_publicacion)}</small>
      <button type="button" class="profile-inline-btn" data-edit-animal="${escapeAttr(animal.ID_animal)}">Editar</button>
    </article>
  `).join('') || '<div class="profile-empty">No hay fichas creadas.</div>';

  contentList.innerHTML = content.map(item => `
    <article class="profile-admin-row">
      <strong>${escapeHtml(item.titulo)}</strong>
      <span>${escapeHtml(item.tipo)}</span>
      <small>${new Date(item.fecha_creacion).toLocaleDateString('es-CO')}</small>
    </article>
  `).join('') || '<div class="profile-empty">No hay campañas, eventos o noticias.</div>';

  animalsList.querySelectorAll('[data-edit-animal]').forEach(button => {
    button.addEventListener('click', () => fillAnimalForm(button.dataset.editAnimal));
  });
}

function fillAnimalForm(animalId) {
  const form = document.querySelector('[data-shelter-animal-form]');
  if (!form) return;

  const db = readDb();
  const animal = db.animales_adopcion.find(item => item.ID_animal === animalId);
  if (!animal) return;

  form.elements.animalId.value = animal.ID_animal;
  form.elements.name.value = animal.nombre;
  form.elements.species.value = animal.especie;
  form.elements.size.value = animal.tamano;
  form.elements.breed.value = animal.raza;
  form.elements.age.value = animal.edad;
  form.elements.city.value = animal.ciudad;
  form.elements.health.value = animal.estado_salud;
  form.elements.gender.value = animal.sexo;
  form.elements.image.value = animal.imagen;
  form.elements.description.value = animal.historia || animal.descripcion;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── EDUCACIÓN RESPONSABLE ─────────────────────────────────────────────
// Sección de materiales educativos, guías de cuidado y tutoriales para dueños de mascotas.
function initEducationContent() {
  const page = document.body.dataset.page;
  if (page !== 'educacion') return;

  renderEducationContent();

  // Listeners para abrir modal de creación
  document.querySelectorAll('[data-open-content-modal]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const type = trigger.dataset.openContentModal;
      openEventContentModal(type);
    });
  });

  // Listeners para cerrar modal
  document.querySelectorAll('[data-close-content-modal]').forEach(button => {
    button.addEventListener('click', closeEventContentModal);
  });
  
  document.querySelectorAll('[data-event-content-modal]').forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target === modal) closeEventContentModal();
    });
  });

  // Listeners para envío de formularios
  document.querySelectorAll('[data-event-content-form]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = form.dataset.eventContentForm;
      await saveEventContent(type, form);
    });
  });

  // Listener para validación de archivos
  document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', () => validateMediaFile(input));
  });

  // Listeners para cerrar modal de detalles
  document.querySelectorAll('[data-close-detail-modal]').forEach(button => {
    button.addEventListener('click', closeContentDetailModal);
  });
  
  const detailModal = document.querySelector('[data-event-detail-modal]');
  if (detailModal) {
    detailModal.addEventListener('click', event => {
      if (event.target === detailModal) closeContentDetailModal();
    });
  }
}

function renderEducationContent() {
  const container = document.querySelector('[data-education-list]');
  if (!container) return;

  const db = readDb();
  const education = sortContentByDate(db.contenido_educativo);
  
  if (education.length === 0) {
    // Si no hay contenido dinámico, no borramos el estático por ahora o mostramos un mensaje
    return;
  }

  container.innerHTML = education.map(item => createEducationCard(item, db)).join('');
  attachContentEventListeners();
}

function createEducationCard(item, db) {
  const author = userById(db, item.ID_usuario);
  const image = item.multimedia || item.imagen || '';
  const currentUser = getCurrentUser();
  const canEdit = currentUser && (currentUser.ID_usuario === item.ID_usuario || currentUser.rol_usuario === 'admin');
  
  return `
    <article class="bg-white rounded-3xl shadow-sm border border-gray-100 flex overflow-hidden hover:shadow-md transition" data-content-id="${escapeAttr(item.ID_contenido)}">
      <div class="w-2/5 md:w-1/3 cursor-pointer" data-detail-trigger data-content-type="educacion" data-content-id="${escapeAttr(item.ID_contenido)}">
        <img src="${escapeAttr(image)}" alt="${escapeAttr(item.titulo)}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80'">
      </div>
      <div class="w-3/5 md:w-2/3 p-6 flex flex-col justify-center">
        <div class="flex justify-between items-start mb-2">
          <p class="text-[9px] font-bold text-brand-blue tracking-widest uppercase">${escapeHtml(item.categoria || 'GUÍA')}</p>
          ${canEdit ? `
            <div class="flex gap-2">
              <button type="button" class="content-edit-btn text-gray-400 hover:text-brand-blue transition" data-content-type="educacion" data-content-id="${escapeAttr(item.ID_contenido)}">
                <i class="fa-solid fa-pencil text-xs"></i>
              </button>
              <button type="button" class="content-delete-btn text-gray-400 hover:text-red-500 transition" data-content-type="educacion" data-content-id="${escapeAttr(item.ID_contenido)}">
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          ` : ''}
        </div>
        <h3 class="text-lg font-bold text-brand-dark mb-2 leading-tight cursor-pointer" data-detail-trigger data-content-type="educacion" data-content-id="${escapeAttr(item.ID_contenido)}">
          ${escapeHtml(item.titulo)}
        </h3>
        <p class="text-xs text-gray-500 mb-4 line-clamp-2">${escapeHtml(item.descripcion)}</p>
        <button type="button" class="text-[10px] font-bold text-brand-dark hover:text-brand-blue flex items-center gap-1 w-fit" data-detail-trigger data-content-type="educacion" data-content-id="${escapeAttr(item.ID_contenido)}">
          VER MATERIAL <i class="fa-solid fa-chevron-right text-[8px]"></i>
        </button>
      </div>
    </article>
  `;
}

// ─── Satisfaction Form Logic ───────────────────────────────────────────

// ─── FORMULARIOS DE SATISFACCIÓN ──────────────────────────────────────
// Sistema de retroalimentación post-adopción para evaluar la experiencia entre adoptantes y refugios.
function initSatisfactionForm() {
  const modal = document.querySelector('[data-satisfaction-modal]');
  const form = document.querySelector('[data-satisfaction-form]');
  if (!modal || !form) return;

  // Close buttons
  modal.querySelectorAll('[data-close-satisfaction]').forEach(btn => {
    btn.addEventListener('click', closeSatisfactionModal);
  });

  // Click outside to close
  modal.addEventListener('click', e => {
    if (!e.target.closest('.satisfaction-modal-card')) closeSatisfactionModal();
  });

  // Form submission
  form.addEventListener('submit', e => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;

    const solicitudId = form.dataset.solicitudId;
    if (!solicitudId) return;

    const calificacion = form.elements.calificacion_satisfaccion.value;
    const comentarios = form.elements.comentarios_satisfaccion.value.trim();

    if (!calificacion) {
      alert('Por favor selecciona una calificación.');
      return;
    }

    const db = readDb();
    const request = db.solicitudes_adopcion.find(r => r.ID_solicitud === solicitudId);
    if (!request) return;

    const animal = animalById(db, request.ID_animal);
    const refugioId = animal?.ID_refugio;

    // Check if a form already exists for this request
    if (!db.satisfaccion_formularios) db.satisfaccion_formularios = [];
    const existing = db.satisfaccion_formularios.find(f => f.ID_solicitud === solicitudId);
    if (existing) {
      alert('Ya has enviado el formulario de satisfacción para esta solicitud.');
      closeSatisfactionModal();
      return;
    }

    // Save the satisfaction form
    db.satisfaccion_formularios.push({
      ID_satisfaccion: makeId('sat'),
      ID_solicitud: solicitudId,
      ID_usuario: user.ID_usuario,
      ID_animal: request.ID_animal,
      nombre_mascota: animal?.nombre || 'Animal',
      nombre_refugio: refugioId ? (userById(db, refugioId)?.nombre_completo || 'Refugio') : 'Refugio',
      calificacion_satisfaccion: calificacion,
      comentarios_satisfaccion: comentarios,
      fecha_envio: new Date().toISOString()
    });

    addActivity(db, user.ID_usuario, 'enviar satisfacción', `Formulario de satisfacción enviado para ${animal?.nombre || 'un animal'}.`);

    // Notify the shelter
    if (refugioId) {
      addNotification(db, refugioId, 'satisfacción',
        `${user.nombre_completo} envió un formulario de satisfacción para la adopción de ${animal?.nombre || 'un animal'}. Calificación: ${calificacion}.`);
    }

    saveDb(db);
    closeSatisfactionModal();
    alert('✅ ¡Gracias! Tu formulario de satisfacción ha sido enviado exitosamente.');
    renderRequestsView();
  });
}

function openSatisfactionModal(solicitudId) {
  const modal = document.querySelector('[data-satisfaction-modal]');
  const form = document.querySelector('[data-satisfaction-form]');
  if (!modal || !form) return;

  const db = readDb();
  const request = db.solicitudes_adopcion.find(r => r.ID_solicitud === solicitudId);
  if (!request) return;

  const animal = animalById(db, request.ID_animal);
  const refugioUser = animal ? userById(db, animal.ID_refugio) : null;

  // Fill in the form fields
  form.dataset.solicitudId = solicitudId;
  const mascotaInput = form.querySelector('[data-satisfaction-mascota]');
  const refugioInput = form.querySelector('[data-satisfaction-refugio]');
  if (mascotaInput) mascotaInput.value = animal?.nombre || 'Animal';
  if (refugioInput) refugioInput.value = refugioUser?.nombre_completo || 'Refugio';

  form.elements.calificacion_satisfaccion.value = '';
  form.elements.comentarios_satisfaccion.value = '';

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeSatisfactionModal() {
  const modal = document.querySelector('[data-satisfaction-modal]');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

// ─── TRADUCCIÓN Y MULTILENGUAJE ────────────────────────────────────────
// Integración con Google Translate para soportar cambio de idioma entre Español e Inglés.
function initLanguageToggle() {
  if (!document.getElementById('google_translate_element')) {
    const gtDiv = document.createElement('div');
    gtDiv.id = 'google_translate_element';
    gtDiv.style.display = 'none';
    document.body.appendChild(gtDiv);

    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({pageLanguage: 'es', includedLanguages: 'en,es', autoDisplay: false}, 'google_translate_element');
    };

    const gtScriptSrc = document.createElement('script');
    gtScriptSrc.type = 'text/javascript';
    gtScriptSrc.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(gtScriptSrc);
  }

  function updateLangUI(lang) {
    document.querySelectorAll('[data-lang-toggle] .lang-text').forEach(span => {
      span.textContent = lang.toUpperCase();
    });
  }

  const match = document.cookie.match(/googtrans=\/es\/([a-z]{2})/);
  const activeLang = match ? match[1] : 'es';
  
  setTimeout(() => updateLangUI(activeLang), 100);

  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('[data-lang-toggle]');
    if (toggleBtn) {
      const currentCookie = document.cookie.match(/googtrans=\/es\/([a-z]{2})/);
      const current = currentCookie ? currentCookie[1] : 'es';
      const nextLang = current === 'es' ? 'en' : 'es';
      
      updateLangUI(nextLang);
      
      document.cookie = `googtrans=/es/${nextLang}; path=/;`;
      document.cookie = `googtrans=/es/${nextLang}; path=/; domain=${location.hostname};`;
      
      window.location.reload();
    }
  });
}
