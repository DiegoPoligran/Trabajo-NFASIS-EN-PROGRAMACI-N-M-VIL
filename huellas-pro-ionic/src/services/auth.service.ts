
import { reactive } from 'vue';
import { DatabaseService } from './database';

const SESSION_KEY = 'huellasPro.session.v1';

const ROLE_LABELS: Record<string, string> = {
  admin: 'ADMINISTRADOR',
  usuario: 'USUARIO',
  refugio: 'REFUGIO ALIADO'
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'content:view', 'comments:create', 'adoption_requests:manage',
    'shelter_panel:access', 'animals:create', 'animals:edit',
    'adoption_requests:review', 'campaigns:create', 'events:create',
    'news:create', 'education:create', 'admin:access',
    'users:manage', 'system:configure'
  ],
  usuario: [
  'content:view', 'comments:create', 'adoption_requests:create',
  'favorites:manage', 'messages:send', 'profile:edit', 'events:attend'
],
  refugio: [
    'content:view', 'comments:create', 'adoption_requests:manage',
    'shelter_panel:access', 'animals:create', 'animals:edit', 'animals:publish',
    'adoption_requests:review', 'campaigns:create', 'events:create',
    'news:create', 'education:create', 'messages:send', 'profile:edit',
    'events:manage'
  ]
};

export function can(permission: string): boolean {
  const role = sessionState.user?.rol_usuario;

  if (!role) return false;

  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

export interface User {
  ID_usuario: string;
  nombre_completo: string;
  correo_electronico: string;
  rol_usuario: string;
  estado_cuenta: string;
  [key: string]: any;
}

export interface SessionData {
  ID_usuario: string;
  rol_usuario: string;
  nombre_completo: string;
  started_at: string;
}

// Estado reactivo global de la sesión
export const sessionState = reactive<{
  user: User | null;
  isLoading: boolean;
}>({
  user: null,
  isLoading: false
});

// Funciones auxiliares
function getInitials(name: string = ''): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'HP';
  return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

function roleLabel(role: string): string {
  return ROLE_LABELS[role] || 'USUARIO';
}

// Servicio de Autenticación
export const AuthService = {
  // Inicializar sesión al abrir la app
  initSession(): boolean {
    try {
      const sessionData = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      if (sessionData?.ID_usuario) {
        const user = DatabaseService.getUsuarioById(sessionData.ID_usuario);
        if (user && user.estado_cuenta === 'activo') {
          sessionState.user = user;
          return true;
        }
      }
    } catch (e) {
      console.error('Error al inicializar sesión:', e);
    }
    sessionState.user = null;
    localStorage.removeItem(SESSION_KEY);
    return false;
  },

  // Login
  async login(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    sessionState.isLoading = true;
    const db = DatabaseService.readDb();
    const normalizedEmail = email.trim().toLowerCase();

    const user = db.usuario.find(
      item => item.correo_electronico === normalizedEmail && item.estado_cuenta === 'activo'
    );
    const credential = user && db.credenciales_seguridad.find(
      item => item.ID_usuario === user.ID_usuario
    );

    const encodedPassword = DatabaseService.encodeCredential(password);

    if (!user || !credential || credential.contrasena_hash !== encodedPassword) {
      if (credential) {
        credential.intentos_fallidos_login = (credential.intentos_fallidos_login || 0) + 1;
        DatabaseService.saveDb(db);
      }
      sessionState.isLoading = false;
      return { success: false, message: 'Correo o contraseña incorrectos.' };
    }

    // Éxito
    credential.intentos_fallidos_login = 0;
    credential.fecha_ultimo_login = new Date().toISOString();
    DatabaseService.saveDb(db);

    // Guardar sesión
    const sessionData: SessionData = {
      ID_usuario: user.ID_usuario,
      rol_usuario: user.rol_usuario,
      nombre_completo: user.nombre_completo || user.nombre || '',
      started_at: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    sessionState.user = user;
    sessionState.isLoading = false;

    return { success: true, user };
  },

  // Registro
  async register(name: string, email: string, password: string, role: string = 'usuario'): Promise<{ success: boolean; message?: string; user?: User }> {
    sessionState.isLoading = true;
    const db = DatabaseService.readDb();
    const normalizedEmail = email.trim().toLowerCase();

    if (db.usuario.some(user => user.correo_electronico === normalizedEmail)) {
      sessionState.isLoading = false;
      return { success: false, message: 'Ya existe una cuenta con ese correo.' };
    }

    if (!name || !email || !password) {
      sessionState.isLoading = false;
      return { success: false, message: 'Completa nombre, correo y contraseña.' };
    }

    const userId = DatabaseService.makeId('user');
    const today = new Date().toISOString().slice(0, 10);

    // Crear usuario
    const newUser: User = {
      ID_usuario: userId,
      nombre_completo: name.trim(),
      correo_electronico: normalizedEmail,
      telefono: '',
      ciudad_ubicacion_general: 'Bogotá',
      fecha_registro: today,
      estado_cuenta: 'activo',
      rol_usuario: role,
      verificado: false
    };

    // Crear credencial
    const newCredential = {
      ID_credencial: DatabaseService.makeId('cred'),
      ID_usuario: userId,
      contrasena_hash: DatabaseService.encodeCredential(password),
      intentos_fallidos_login: 0,
      fecha_ultimo_login: new Date().toISOString(),
      token_recuperacion_contrasena: '',
      fecha_expiracion_token: '',
      autenticacion_doble_factor: false
    };

    // Crear perfil
    const newProfile = {
      ID_perfil: DatabaseService.makeId('profile'),
      ID_usuario: userId,
      foto_perfil: '',
      biografia_descripcion: '',
      preferencias: role === 'refugio' ? ['gestión de adopciones'] : ['adopción responsable'],
      configuracion_privacidad: 'publico'
    };

    // Crear configuración
    const newConfig = {
      ID_configuracion: DatabaseService.makeId('config'),
      ID_usuario: userId,
      idioma: 'es',
      notificaciones_activas: true,
      privacidad_perfil: 'publico'
    };

    db.usuario.push(newUser);
    db.credenciales_seguridad.push(newCredential);
    db.perfiles_usuario.push(newProfile);
    if (!db.configuracion_cuenta) db.configuracion_cuenta = [];
    db.configuracion_cuenta.push(newConfig);

    // Historial de actividad
    if (!db.historial_actividad) db.historial_actividad = [];
    db.historial_actividad.push({
      ID_actividad: DatabaseService.makeId('act'),
      ID_usuario: userId,
      tipo_accion: 'crear cuenta',
      descripcion: `Registro creado con rol ${roleLabel(role)}.`,
      fecha_hora: new Date().toISOString(),
      ip_dispositivo: 'localStorage'
    });

    // Notificación de bienvenida
    if (!db.notificaciones) db.notificaciones = [];
    db.notificaciones.push({
      ID_notificacion: DatabaseService.makeId('notif'),
      ID_usuario: userId,
      tipo_notificacion: 'sistema',
      contenido: `Bienvenido a HuellasPro. Tu rol actual es ${roleLabel(role)}.`,
      leida: false,
      fecha_envio: new Date().toISOString()
    });

    DatabaseService.saveDb(db);

    // Auto-login
    const sessionData: SessionData = {
      ID_usuario: newUser.ID_usuario,
      rol_usuario: newUser.rol_usuario,
      nombre_completo: newUser.nombre_completo,
      started_at: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    sessionState.user = newUser;
    sessionState.isLoading = false;

    return { success: true, user: newUser };
  },

  // Recuperar contraseña (paso 1: verificar email)
  verifyEmailForRecovery(email: string): { success: boolean; message?: string; userId?: string } {
    const db = DatabaseService.readDb();
    const normalizedEmail = email.trim().toLowerCase();
    const user = db.usuario.find(
      u => u.correo_electronico === normalizedEmail && u.estado_cuenta === 'activo'
    );
    
    if (!user) {
      return { success: false, message: 'No existe una cuenta activa con ese correo.' };
    }
    return { success: true, userId: user.ID_usuario };
  },

  // Recuperar contraseña (paso 2: cambiar contraseña)
  resetPassword(userId: string, newPassword: string): { success: boolean; message?: string } {
    if (newPassword.length < 4) {
      return { success: false, message: 'La contraseña debe tener al menos 4 caracteres.' };
    }

    const db = DatabaseService.readDb();
    const credential = db.credenciales_seguridad.find(c => c.ID_usuario === userId);
    
    if (!credential) {
      return { success: false, message: 'Error al encontrar las credenciales.' };
    }

    credential.contrasena_hash = DatabaseService.encodeCredential(newPassword);
    DatabaseService.saveDb(db);

    return { success: true, message: 'Contraseña actualizada correctamente.' };
  },

  // Cerrar sesión
  logout(router: any): void {
    localStorage.removeItem(SESSION_KEY);
    sessionState.user = null;
    if (router) {
      router.push('/login');
    }
  },

  // Verificar permisos
  hasPermission(permission: string): boolean {
    if (!sessionState.user) return false;
    return (ROLE_PERMISSIONS[sessionState.user.rol_usuario] || []).includes(permission);
  },

   canCreateAnimals(): boolean {
    return this.hasPermission('animals:create');
  },

  canEditAnimals(): boolean {
    return this.hasPermission('animals:edit');
  },

  canPublishAnimals(): boolean {
    return this.hasPermission('animals:publish');
  },

  canManageAdoptionRequests(): boolean {
    return this.hasPermission('adoption_requests:manage');
  },

  canSendMessages(): boolean {
    return this.hasPermission('messages:send');
  },

  canManageFavorites(): boolean {
    return this.hasPermission('favorites:manage');
  },

  getRoleLabel(role: string): string {
    return roleLabel(role);
  },

  getInitials(name: string): string {
    return getInitials(name);
  },

  isLoggedIn(): boolean {
    return sessionState.user !== null;
  },

  getUserRole(): string {
    return sessionState.user?.rol_usuario || '';
  }
};
