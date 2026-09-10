# Coffee Shop Operations & Data Dashboard

Sistema web para la gestión de operaciones de una cafetería, desarrollado como solución para digitalizar el proceso de ventas, control de inventario, gestión de clientes y visualización de indicadores del negocio.

## Demo

Aplicación desplegada:

https://coffee-shop-operations-dashboard-erh.netlify.app/

## Descripción

Coffee Shop Operations & Data Dashboard permite gestionar desde una misma aplicación:

- Catálogo público de productos.
- Registro de ventas.
- Control automático de inventario.
- Gestión administrativa de productos.
- Gestión de clientes e historial de compras.
- Dashboard con indicadores de operación.
- Gestión de imágenes de productos.
- Control de acceso para usuarios administrativos.

El sistema utiliza Supabase como plataforma de datos y servicios backend, aprovechando PostgreSQL, autenticación, Row Level Security (RLS), funciones PostgreSQL y Storage.

---

## Funcionalidades

### Catálogo y ventas

Los clientes pueden:

- Consultar los productos disponibles.
- Visualizar imágenes, precios y existencias.
- Seleccionar la cantidad a comprar.
- Registrar nombre completo y correo electrónico.
- Confirmar la compra.
- Obtener un resumen de la operación.

El registro de la venta se realiza mediante una función PostgreSQL que centraliza la operación y garantiza la consistencia entre venta y stock:

1. Valida los datos recibidos.
2. Bloquea el producto durante la operación.
3. Verifica la disponibilidad del stock.
4. Obtiene el precio directamente desde la base de datos.
5. Calcula subtotal, IVA y total.
6. Registra o actualiza el cliente.
7. Registra la venta.
8. Registra el detalle de la venta.
9. Descuenta el stock.
10. Actualiza la fecha de modificación del producto.

De esta forma, el precio y la disponibilidad utilizados en la operación no dependen de valores confiados directamente al frontend.

### Inventario

El área administrativa permite:

- Crear productos.
- Editar productos.
- Gestionar precios.
- Gestionar existencias.
- Subir y actualizar imágenes.
- Retirar productos del catálogo.
- Reactivar productos retirados.
- Visualizar productos con stock bajo.

Los productos retirados no se eliminan físicamente cuando existen referencias históricas. Se utiliza el campo `activo` para conservar la información histórica.

### Clientes

El módulo de clientes permite consultar:

- Nombre completo.
- Correo electrónico.
- Cantidad de compras.
- Total gastado.
- Fecha de la última compra.
- Historial detallado de compras.

### Dashboard

El panel administrativo presenta:

- Ingresos totales.
- Clientes destacados.
- Productos con stock bajo.
- Top 5 de productos más vendidos.
- Ingresos generados por producto.
- Cantidad de unidades vendidas.

---

## Tecnologías

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend y datos

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- PostgreSQL Functions / RPC
- Row Level Security (RLS)

### Herramientas

- Git
- GitHub
- Visual Studio Code
- Supabase CLI
- Podman para el entorno local de Supabase

---

## Arquitectura

La aplicación utiliza una arquitectura frontend organizada por componentes, páginas y servicios.

```text
React + Vite
│
├── Pages
│   ├── Catalogo
│   └── Dashboard
│
├── Components
│   ├── Login
│   ├── CompraModal
│   ├── ConfirmacionCompra
│   ├── Inventario
│   ├── ProductoForm
│   └── Clientes
│
├── Services
│   ├── productosService
│   ├── ventasService
│   ├── dashboardService
│   ├── authService
│   └── clientesService
│
└── Supabase
    ├── PostgreSQL
    ├── Auth
    ├── Storage
    └── RPC
Responsabilidades

Components

Gestionan la interfaz y el comportamiento visual de cada módulo.

Pages

Componen las vistas principales de la aplicación.

Services

Centralizan la comunicación con Supabase y las operaciones relacionadas con los datos.

Supabase

Gestiona la persistencia, autenticación, autorización, almacenamiento de imágenes, seguridad y funciones de negocio.

Modelo de datos

El sistema utiliza cuatro entidades principales:

COMPRADORES
    │
    │ 1:N
    ▼
VENTAS
    │
    │ 1:N
    ▼
DETALLE_VENTAS
    │
    │ N:1
    ▼
PRODUCTOS
Compradores

Almacena la información básica de los clientes:

id
nombre_completo
email
fecha_creacion
Productos

Almacena:

id
nombre
precio
stock
imagen_url
activo
fecha_creacion
fecha_actualizacion
Ventas

Almacena:

Cliente asociado.
Subtotal.
IVA.
Total.
Fecha de creación.
Detalle de ventas

Registra:

Venta asociada.
Producto vendido.
Cantidad.
Precio unitario.
Subtotal.

Las relaciones mediante claves foráneas permiten mantener la integridad de los datos y conservar el historial de ventas.

Seguridad

La aplicación implementa autenticación, autorización y controles de acceso sobre los recursos administrativos.

Autenticación

El acceso administrativo utiliza Supabase Auth.

Roles administrativos

Los permisos administrativos se controlan mediante la tabla:

public.perfiles

Un usuario obtiene permisos administrativos cuando su registro tiene:

es_admin = true

La ausencia de un perfil administrativo implica acceso denegado.

Row Level Security

Las tablas principales tienen Row Level Security (RLS) habilitado.

El acceso a las operaciones administrativas se encuentra restringido a usuarios autenticados con los permisos correspondientes.

Las funciones utilizadas para consultar información administrativa no están expuestas para ejecución anónima.

Storage

Las imágenes de productos se almacenan en el bucket:

productos

El bucket permite la visualización de las imágenes necesarias para el catálogo público, mientras que las operaciones administrativas de escritura y eliminación están restringidas.

Ventas

El registro de ventas se ejecuta mediante una función PostgreSQL que realiza la operación de forma transaccional.

La función:

Obtiene el producto desde la base de datos.
Bloquea el registro durante la operación.
Verifica el stock disponible.
Obtiene el precio almacenado en la base de datos.
Registra la venta y su detalle.
Actualiza el stock.

Esto evita depender de valores manipulables enviados desde el cliente y mantiene la consistencia entre la venta registrada y el inventario.

Variables de entorno

Crear un archivo .env.local en la raíz del proyecto:

VITE_SUPABASE_URL=TU_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=TU_SUPABASE_PUBLISHABLE_KEY

No se deben almacenar claves privadas, contraseñas u otros secretos en el repositorio.

El archivo .env.local se encuentra excluido mediante .gitignore.

Instalación

Clonar el repositorio:

git clone https://github.com/TheLioN25/coffee-shop-operations-dashboard.git
cd coffee-shop-operations-dashboard

Instalar dependencias:

npm install

Configurar las variables de entorno:

.env.local

Ejecutar el proyecto:

npm run dev

La aplicación estará disponible en la dirección local indicada por Vite.

Build de producción

Para generar la versión de producción:

npm run build

El proyecto debe completar el proceso sin errores y generar la carpeta:

dist/
Base de datos local

El proyecto incluye las migraciones de Supabase dentro de:

supabase/migrations/

Para iniciar el entorno local de Supabase:

npx supabase start

Para consultar el estado:

npx supabase status

Para consultar las migraciones locales:

npx supabase migration list --local

El entorno local utiliza los servicios de Supabase para PostgreSQL, Auth, Storage y Studio.

Estructura del proyecto
coffee-shop-operations-dashboard/
│
├── public/
│
├── src/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   └── services/
│
├── supabase/
│   └── migrations/
│
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
Pruebas realizadas

Durante el desarrollo se validaron los principales flujos del sistema:

Registro de productos.
Edición de productos.
Retiro y reactivación de productos.
Subida y actualización de imágenes.
Consulta del catálogo.
Registro de ventas.
Actualización automática del stock.
Cálculo de subtotal, IVA y total.
Registro y actualización de clientes.
Historial de compras.
Actualización de indicadores del dashboard.
Control de acceso administrativo.
Restricción de acceso para usuarios sin permisos administrativos.
Protección mediante RLS.
Protección de operaciones de Storage.
Ejecución de migraciones.
Build de producción.
Validación del despliegue.
Módulos principales
Catálogo público.
Registro de ventas.
Control de inventario.
Gestión de imágenes.
Autenticación.
Control de roles.
Dashboard.
Gestión de clientes.
Historial de compras.
Seguridad mediante RLS.
Migraciones de base de datos.
Estado del proyecto

Proyecto funcional y preparado para evaluación y despliegue.

La aplicación cuenta con:

Frontend funcional.
Persistencia de datos en PostgreSQL.
Registro de ventas con actualización de inventario.
Gestión administrativa de productos.
Gestión de clientes.
Dashboard de indicadores.
Autenticación y autorización.
Storage para imágenes.
RLS.
Funciones PostgreSQL.
Migraciones versionadas.
Build de producción validado.
Despliegue en producción.
Autor

Elvis Rodríguez Hernández

Proyecto desarrollado como parte de una prueba técnica de desarrollo de software.