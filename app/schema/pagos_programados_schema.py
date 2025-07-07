from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class PagoProgramadoSchema(BaseModel):
    usuario_id: int
    categoria_id: int
    nombre: str
    monto: float
    fecha_inicio: date
    frecuencia: str  # Ej: 'semanal', 'mensual', etc.
    proximo_pago: date
    descripcion: Optional[str] = None
    activo: Optional[bool] = True

class PagoProgramadoSchemaOut(PagoProgramadoSchema):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
