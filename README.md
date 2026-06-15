# Bethel Church — MSBN España

Sitio web oficial de Bethel Church, construido con **React 19** + **Tailwind CSS v4** + **Vite**.

## 📁 Estructura del proyecto

```
bethel-church/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx          # Entry point
    ├── App.jsx           # Componente raíz
    ├── index.css         # Tailwind v4 import
    ├── data/
    │   └── index.js      # Datos: NAV_LINKS, SERVICES, CONGREGATIONS, etc.
    ├── hooks/
    │   └── useContactForm.js  # Hook del formulario de contacto
    └── components/
        ├── Icon.jsx           # SVG icon system (lucide-style)
        ├── TopBar.jsx         # Barra superior con teléfono y redes
        ├── Header.jsx         # Navbar sticky con logo y menú
        ├── MobileMenu.jsx     # Menú deslizante para móvil
        ├── Hero.jsx           # Sección hero con imagen de fondo
        ├── Welcome.jsx        # Sección "Nuestra Identidad"
        ├── Services.jsx       # Tarjetas de ministerios/servicios
        ├── CongregationCard.jsx # Tarjeta individual de congregación
        ├── Congregations.jsx  # Sección de congregaciones + mapa + horarios
        ├── Contact.jsx        # Formulario de contacto + redes sociales
        └── Footer.jsx         # Pie de página
```

## 🚀 Inicio rápido

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Vista previa del build
npm run preview
```

## 🛠 Stack

| Herramienta | Versión |
|---|---|
| React | ^19.0.0 |
| Tailwind CSS | ^4.2.4 |
| @tailwindcss/vite | ^4.2.4 |
| Vite | ^6.3.2 |

## 📝 Notas

- **Tailwind v4** usa `@import "tailwindcss"` en el CSS, sin archivo `tailwind.config.js`.
- El plugin `@tailwindcss/vite` reemplaza a `postcss` para la integración con Vite.
- Los datos centralizados están en `src/data/index.js` — edita ahí para actualizar contenido.
- El hook `useContactForm` está listo para conectarse a un backend o servicio de email.
