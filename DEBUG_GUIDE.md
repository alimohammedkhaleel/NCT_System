# 🧪 DEBUG & TEST GUIDE

## El Problema y la Solución

### ❌ Problemas Identificados:
1. **BotpressChat se cargaba en la página de Login** → Causaba error de inicialización
2. **Login.jsx usaba `apiLogin` en lugar de `login` de AuthContext** → No actualizaba el estado global

### ✅ Soluciones Implementadas:
1. **Modified App.jsx** → BotpressChat ahora SOLO carga después de autenticarse
2. **Fixed Login.jsx** → Ahora usa `login()` de AuthContext que actualiza el estado global

---

## 🔍 Verificar que Todo Funciona

### Paso 1: Verifica que ambos servidores están funcionando

**Terminal 1 - Servidor Backend:**
```bash
cd server
npm start
```

Busca en la salida:
```
✅ Database connection established successfully
🚀 Server is running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd client/frontend
npm run dev
```

Busca en la salida:
```
➜ Local: http://localhost:5173/
```

### Paso 2: Prueba la API directamente

Abre PowerShell/Terminal y ejecuta:

```bash
# Prueba la salud del servidor
curl http://localhost:5000/api/health

# Resultado esperado:
# {"status":"OK","timestamp":"..."}
```

### Paso 3: Prueba el login con curl

```bash
# Comando para login
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"admin123"}'

# Deberías ver:
# {"success":true,"message":"تم تسجيل الدخول بنجاح","data":{"user":{...},"token":"eyJ..."}}
```

---

## 🌐 Prueba en el Navegador

### 1. Abre DevTools (F12)
```
Función: Abierto → F12 o Ctrl+Shift+I
```

### 2. Ve a la pestaña "Network"
- Mantén la pestaña abierta
- Irá a http://localhost:5173

### 3. Completa el formulario de login
- Username: `admin`
- Password: `admin123`
- Click: **Log in**

### 4. En Network, deberías ver:
```
POST /api/auth/login ✅ 200 OK
GET /api/auth/profile ✅ 200 OK
```

### 5. Verifica la respuesta
- Haz click en POST `/api/auth/login`
- Ve a la pestaña "Response"
- Deberías ver:
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      ...
    },
    "token": "eyJ..."
  }
}
```

---

## 🧩 Verifica los Cambios

### Cambio 1: App.jsx
Abre `src/App.jsx` y verifica:

**ANTES (Incorrecto):**
```jsx
<BotpressChat />  // Carga en TODAS las páginas
```

**DESPUÉS (Correcto):**
```jsx
const ConditionalBotpressChat = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;  // Solo si está autenticado
  return <BotpressChat />;
};
```

---

### Cambio 2: Login.jsx
Abre `src/pages/Login.jsx` y verifica:

**ANTES (Incorrecto):**
```jsx
import { login as apiLogin, validateLoginForm } from '../api/auth';

// En handleSubmit:
const result = await apiLogin(formData.username, formData.password);
```

**DESPUÉS (Correcto):**
```jsx
import { validateLoginForm } from '../api/auth';
const { isAuthenticated, loading, login } = useAuth();

// En handleSubmit:
const result = await login(formData.username, formData.password);
```

---

## 🧠 Cómo Funcionaba Antes vs Ahora

### ANTES (Incorrecto):
```
Usuario intenta login
    ↓
Login.jsx llama apiLogin()
    ↓
Token se guarda en localStorage
    ↓
PERO AuthContext no se actualiza ❌
    ↓
isAuthenticated sigue siendo false
    ↓
Redirige de vuelta a /login ❌
    ↓
BotpressChat en App causa error ❌
```

### AHORA (Correcto):
```
Usuario intenta login
    ↓
Login.jsx llama login() de AuthContext
    ↓
Token se guarda + Axios headers se actualizan ✅
    ↓
setUser() actualiza el estado ✅
    ↓
setIsAuthenticated(true) se ejecuta ✅
    ↓
Componente se re-renderiza ✅
    ↓
Redirige a /dashboard ✅
    ↓
BotpressChat SOLO carga si isAuthenticated=true ✅
```

---

## 🐛 Si Aún No Funciona

### 🔴 Error: "Cannot GET /api/auth/login"
```
Problema: El servidor no está corriendo
Solución:
- Abre Terminal 1
- cd server && npm start
- Espera a ver "Server is running on port 5000"
```

### 🔴 Error: "CORS error"
```
Problema: Cliente y servidor en puertos distintos sin CORS
Solución:
- Verifica .env en server:
  CLIENT_URL=http://localhost:5173
  CORS_ORIGIN=http://localhost:5173
- Reinicia el servidor
```

### 🔴 Error: "TypeError: Cannot read property 'data' of undefined"
```
Problema: La respuesta de la API no tiene la estructura esperada
Solución:
- Verifica en Network que la respuesta es:
  {"success":true,"data":{"user":{...},"token":"..."}}
- NO debería ser:
  {"user":{...},"token":"..."}  ❌
```

### 🔴 Error: "Cannot find module"
```
Problema: Dependencias no instaladas
Solución:
cd client/frontend
npm install
npm run dev
```

---

## 📊 Checklist Final

- [ ] Terminal 1: `npm start` muestra "🚀 Server is running"
- [ ] Terminal 2: `npm run dev` muestra "Local: http://localhost:5173"
- [ ] `curl http://localhost:5000/api/health` responde OK
- [ ] `curl http://localhost:5000/api/auth/login` responde con token
- [ ] Network tab muestra POST /api/auth/login ✅ 200
- [ ] Login page carga sin errores de Botpress
- [ ] Hacer login redirige a /dashboard
- [ ] BotpressChat aparece SOLO en /dashboard (no en /login)

---

## 🎯 Próximos Pasos

Si todo funciona:
1. ✅ Cierra DevTools (F12)
2. ✅ Navega por la aplicación
3. ✅ Prueba crear nuevos usuarios
4. ✅ Prueba diferentes roles (profesor, estudiante, etc.)

Si aún hay problemas:
1. Verifica server console para errores
2. Verifica browser console (F12) para errores
3. Lee TROUBLESHOOTING.md
4. Ejecuta `npm run db:reset` si la BD está corrupta

---

**Última actualización:** 7 Abril 2026
