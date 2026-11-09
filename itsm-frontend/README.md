# itsm-frontend

Aplicación React + Vite para el SaaS ITSM. Incluye la base compartida, acceso de demostración, dashboard y módulo de Problemas. Los módulos de Incidentes, Cambios, Solicitudes y Usuarios se pueden añadir después, cada uno en su carpeta bajo `src/modules/`.

## Ejecutar sin esperar al equipo

Requiere Node.js 20 y npm:

```powershell
npm install
npm run dev
```

Abre la URL que muestra Vite. El modo demostración viene activado (`VITE_DEMO_MODE=true` en `.env.example`): selecciona un tenant y escribe cualquier contraseña. Los problemas demo se guardan en el almacenamiento local del navegador.

## Conectar la API

Copia `.env.example` a `.env.local` y configura, cuando estén disponibles:

```text
VITE_DEMO_MODE=false
VITE_API_AUTH=https://.../dev
VITE_API_PROBLEMAS=https://.../dev
```

Las URLs deben ser la base de la API, sin añadir `/problemas` o `/auth/login`; los servicios agregan esas rutas. El login real obtiene el JWT de `/auth/login`, y el cliente HTTP adjunta `Authorization: Bearer ...`. Una respuesta 401 cierra la sesión. No guardes secretos en variables `VITE_*`, porque se incluyen en el código público del navegador.

El cliente maneja `401` cerrando la sesión y presenta los errores `403` como falta de permisos; verifica que el API incluya mensajes de error compatibles con `{"error":{"mensaje":"..."}}`.

Mantén `VITE_DEMO_MODE=true` mientras el endpoint de login real no esté integrado y probado. Cámbialo a `false` en Amplify solo cuando `/auth/login` esté disponible.

Para el entorno del grupo, usa las URLs de las APIs desplegadas en `dev` y `us-east-1`. El navegador se conecta a las APIs; la publicación y el consumo de SNS/SQS los realizan los microservicios, no el frontend.

## Estructura para colaborar

```text
src/
  context/       autenticación y sesión
  modules/
    auth/        login
    dashboard/   KPIs y resumen
    problems/    módulo del integrante 2
    incidents/   agregar aquí el módulo del integrante 1
    changes/     agregar aquí el módulo del integrante 3
    requests/    agregar aquí el módulo del integrante 4
    users/       agregar aquí el módulo del integrante 5
  services/      cliente HTTP e integración de APIs
  shared/        layout y componentes compartidos
```

Cada persona trabaja en `src/modules/{su_modulo}` y registra sus rutas en `src/App.jsx`. Mantén las carpetas `context`, `services` y `shared` estables y acuerda cambios con el grupo para evitar conflictos.

## Despliegue en Amplify

Conecta el repositorio GitHub en Amplify Hosting y usa la rama `main`. Amplify detectará `amplify.yml`, instalará dependencias con `npm ci` y publicará `dist/`. Añade `VITE_DEMO_MODE` y las URLs públicas de API en las variables de entorno de Amplify. Para usar `npm ci`, conserva y sube `package-lock.json` generado por `npm install`.

En Amplify Hosting, configura una regla de reescritura para que las rutas de React funcionen al recargar la página: **Source** `/<*>`, **Target** `/index.html`, **Status** `200 (Rewrite)`. Verifica que las rutas de archivos estáticos sigan sirviéndose desde `dist/`.
