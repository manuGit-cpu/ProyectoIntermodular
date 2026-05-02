## Table `extras`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre` | `text` |  Unique |
| `descripcion` | `text` |  Nullable |
| `precio` | `numeric` |  |
| `activo` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `reservas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `usuario_id` | `uuid` |  Nullable |
| `nombre_cliente` | `text` |  Nullable |
| `email_cliente` | `text` |  Nullable |
| `telefono_cliente` | `text` |  Nullable |
| `numero_personas` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `fecha_entrada` | `date` |  Nullable |
| `fecha_salida` | `date` |  Nullable |
| `precio_alojamiento` | `numeric` |  |
| `precio_extras` | `numeric` |  |
| `precio_total` | `numeric` |  |

## Table `reservas_extras`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `reserva_id` | `uuid` |  |
| `extra_id` | `uuid` |  |
| `cantidad` | `int4` |  |
| `precio_unitario` | `numeric` |  |
| `created_at` | `timestamptz` |  |

## Table `temporadas_precios`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre` | `text` |  |
| `precio` | `numeric` |  |
| `activo` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `mes_inicio` | `int4` |  |
| `mes_fin` | `int4` |  |

## Table `usuarios`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre` | `text` |  |
| `email` | `text` |  Unique |
| `telefono` | `text` |  Nullable |
| `rol` | `text` |  |
| `created_at` | `timestamptz` |  |

