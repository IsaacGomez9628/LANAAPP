# app/schema/pagos_programados_schema.py
from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from datetime import date, datetime

class PagoProgramadoSchema(BaseModel):
    usuario_id: int
    categoria_id: int
    descripcion: Optional[str] = None
    monto: float = Field(..., gt=0, description="El monto debe ser mayor a 0")
    dia_vencimiento: int = Field(..., ge=1, le=31, description="Día del mes (1-31)")
    fecha_fin: Optional[date] = None
    frecuencia: Literal["diario", "semanal", "mensual", "anual"] = Field(..., description="Frecuencia del pago")
    proxima_fecha_vencimiento: Optional[date] = None
    registrar_automaticamente: Optional[int] = Field(0, ge=0, le=1, description="0 = No, 1 = Sí")
    activo: Optional[int] = Field(1, ge=0, le=1, description="0 = Inactivo, 1 = Activo")
    
    @validator('fecha_fin')
    def validar_fecha_fin(cls, v, values):
        if v and 'proxima_fecha_vencimiento' in values and values['proxima_fecha_vencimiento']:
            if v <= values['proxima_fecha_vencimiento']:
                raise ValueError('fecha_fin debe ser posterior a proxima_fecha_vencimiento')
        return v

class PagoProgramadoSchemaOut(PagoProgramadoSchema):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime