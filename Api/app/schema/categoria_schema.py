from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CategoriaSchema(BaseModel):
    nombre_categoria: str
    tipo: str = Field(..., pattern="^(ingreso|gasto)$")

class CategoriaSchemaOut(CategoriaSchema):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
