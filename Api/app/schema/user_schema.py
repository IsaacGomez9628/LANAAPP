from pydantic import BaseModel, EmailStr
# con este optional se puede hacer optional algun valor
from typing import Optional
from datetime import datetime

# Estructuracion de los datos de como queremos que se creen los usarios
class UserSchema(BaseModel):
    nombre_usuario: str
    email: EmailStr
    password: str
    telefono: str
    # fecha_creacion: Optional[datetime]
    # fecha_actualizacion: Optional[datetime]

class UserSchemaOut(BaseModel):
    id: int
    nombre_usuario: str
    email: EmailStr
    telefono: str
    foto_perfil: Optional[str] = None
    fecha_creacion: datetime
    fecha_actualizacion: datetime






    