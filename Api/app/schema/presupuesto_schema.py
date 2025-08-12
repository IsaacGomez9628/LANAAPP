# app/schema/presupuesto_schema.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PresupuestoSchema(BaseModel):
    usuario_id: int
    categoria_id: int
    monto_presupuestado: float
    mes: int
    anio: int  # Asegúrate de que sea 'anio' sin tilde

class PresupuestoSchemaOut(PresupuestoSchema):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime