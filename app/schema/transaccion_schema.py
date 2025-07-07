from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class TransaccionSchema(BaseModel):
    usuario_id: int
    categoria_id: int
    monto: float
    fecha_transaccion: date
    descripcion: Optional[str] = None
    metadatos: Optional[dict] = None
    pendiente_sincronizacion: Optional[int] = 0

class TransaccionSchemaOut(TransaccionSchema):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
