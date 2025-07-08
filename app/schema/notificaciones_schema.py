from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class NotificacionSchema(BaseModel):
    usuario_id: int
    tipo_notificacion_canal: Literal["email", "sms", "push"]
    destino: str
    asunto: Optional[str] = None
    mensaje: Optional[str] = None
    fecha_envio: Optional[datetime] = None
    estado_envio: Literal["pendiente", "enviado", "fallido"]
    leida: Optional[int] = 0
    notificable_type: Optional[str] = None
    notificable_id: Optional[int] = None

class NotificacionSchemaOut(NotificacionSchema):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
