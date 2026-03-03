# 🎓 ClassLab Widget — Guía de Integración para Canvas LMS

> Desarrollado por [LiDARit.com](https://lidarit.com) / [AITopStaff.com](https://aitopstaff.com)

## ¿Qué es?

Un widget flotante que aparece en todas las páginas de Canvas LMS, invitando a los estudiantes a practicar con el simulador de clases ClassLab. Al hacer clic, se expande en pantalla completa cargando classlab.app.

---

## 📁 Archivos

| Archivo | Descripción |
|---------|-------------|
| `classlab-widget.js` | **El script principal** — esto es lo que se integra en Canvas |
| `demo-standalone.html` | Demo visual para ver cómo queda (abrir en navegador) |

---

## 🔧 Opción 1: Custom JavaScript en Canvas (Recomendado)

Esta es la forma más limpia. Requiere acceso de **Admin** a Canvas.

### Pasos:

1. Ir a **Admin → Themes** (o **Administración → Temas**)
2. Abrir el tema activo y hacer clic en **Edit this theme**
3. En la pestaña **Upload**, buscar el campo **JavaScript file** 
4. Subir el archivo `classlab-widget.js`
5. Hacer clic en **Apply theme**

> ⚠️ Si ya tienen un archivo JS custom, agregar el contenido de `classlab-widget.js` al final del archivo existente.

### Alternativa — Pegarlo directamente:

Si Canvas permite Custom JS inline:

1. Ir a **Admin → Settings → Custom JavaScript**
2. Copiar y pegar todo el contenido de `classlab-widget.js`
3. Guardar

---

## 🔧 Opción 2: Alojar el JS externamente

Si prefieren servir el archivo desde su propio servidor:

1. Subir `classlab-widget.js` a un servidor accesible (ej: `https://cdn.scala.com/classlab-widget.js`)
2. En Canvas, agregar en Custom JavaScript:

```javascript
(function() {
  var s = document.createElement('script');
  s.src = 'https://cdn.scala.com/classlab-widget.js';
  s.async = true;
  document.head.appendChild(s);
})();
```

---

## 🔧 Opción 3: Inyección vía Sub-Account o Course-Level

Para activar solo en ciertos cursos (no en todo Canvas):

1. Ir al **curso específico → Settings → Navigation**
2. O usar la API de Canvas para inyectar JS a nivel de sub-account

---

## ⚙️ Configuración

### Filtrar por cursos (IMPORTANTE)

El widget **solo se muestra en los cursos que configures**. Editar la línea `ALLOWED_COURSE_IDS` al inicio del script:

```javascript
// Mostrar SOLO en estos cursos (agregar los IDs como strings):
const ALLOWED_COURSE_IDS = ['12345', '67890', '11111'];

// Dejar vacío para mostrar en TODOS los cursos:
const ALLOWED_COURSE_IDS = [];
```

**¿Dónde encuentro el ID del curso?**
En la URL de Canvas: `https://tu-canvas.instructure.com/courses/12345` → el ID es `12345`

### URL del simulador

```javascript
const CLASSLAB_URL = 'https://classlab.app';  // URL del simulador
```

Si necesitan pasar parámetros (ej: ID de curso):

```javascript
const CLASSLAB_URL = 'https://classlab.app?course=PEDAGOGIA_101';
```

---

## 🎨 Personalización

### Cambiar colores (marca Scala)
Buscar las líneas con `#6366f1` y `#8b5cf6` y reemplazar con los colores de Scala:

```javascript
background: linear-gradient(135deg, #COLOR1, #COLOR2);
```

### Cambiar textos
Buscar en el HTML del widget:
- `ClassLab` → nombre del widget
- `¡Practica tu clase!` → call to action
- `🎓 ClassLab — Simulador de Clases` → título del panel expandido

### Cambiar posición
La posición `left: 90px` asume el sidebar de Canvas colapsado (80px). Si el sidebar es diferente, ajustar este valor.

---

## 🔒 Requisitos Técnicos

- **Canvas debe permitir iframes** de `classlab.app` (verificar Content Security Policy)
- Si classlab.app tiene headers `X-Frame-Options: DENY`, NO funcionará en iframe — contactar al equipo de ClassLab para permitir embedding desde el dominio de Canvas de Scala
- El widget solicita permisos de **micrófono y cámara** (necesarios para el simulador)

### Headers necesarios en classlab.app:
```
X-Frame-Options: ALLOW-FROM https://scala.instructure.com
# O mejor:
Content-Security-Policy: frame-ancestors 'self' https://scala.instructure.com
```

---

## 🧪 Probar antes de integrar

1. Abrir `demo-standalone.html` en un navegador
2. Verificar que el widget morado aparece a la izquierda
3. Hacer clic → debe expandirse mostrando classlab.app
4. Verificar que classlab.app carga correctamente en el iframe

---

## 📱 API JavaScript (Avanzado)

El widget expone una API global para control programático:

```javascript
// Abrir el widget
ClassLabWidget.open();

// Cerrar el widget
ClassLabWidget.close();

// Cambiar la URL (ej: para pasar parámetros del curso)
ClassLabWidget.setUrl('https://classlab.app?course=ABC123');
```

Esto permite integraciones más profundas, como abrir el simulador desde un botón dentro del contenido del curso.

---

## ❓ Troubleshooting

| Problema | Solución |
|----------|----------|
| Widget no aparece | Verificar que el JS se cargó (F12 → Console → buscar errores) |
| ClassLab no carga en iframe | Verificar headers X-Frame-Options / CSP en classlab.app |
| Widget tapado por el sidebar | Ajustar `left: 90px` a un valor mayor |
| Widget aparece en páginas donde no debería | Agregar condicional al inicio del script para filtrar por URL |

---

---

**Desarrollado por [LiDARit.com](https://lidarit.com) / [AITopStaff.com](https://aitopstaff.com)**
Para soporte técnico con la integración, contactar al equipo en [aitopstaff.com](https://aitopstaff.com).
