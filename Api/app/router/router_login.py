# app/router/router_login.py
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import jwt
from pydantic import BaseModel
from werkzeug.security import check_password_hash

from app.config.db import engine
from app.model.users import users
from sqlalchemy.sql import select

# Configuración
login_router = APIRouter()
security = HTTPBearer()

SECRET_KEY = "tu_clave_secreta_muy_segura_cambia_esto"  # ¡CAMBIA ESTO POR UNA CLAVE SEGURA!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 horas

# Modelos Pydantic para Login
class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    nombre_usuario: str
    email: str
    telefono: Optional[str] = None
    foto_perfil: Optional[str] = None
    fecha_creacion: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Función para crear token JWT
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Función para verificar token
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Función para obtener usuario por email
def get_user_by_email(email: str):
    try:
        with engine.connect() as connection:
            result = connection.execute(
                users.select().where(users.c.email == email)
            ).first()
            return result
    except Exception as e:
        print(f"Error obteniendo usuario por email: {e}")
        return None

# Función para obtener usuario por ID
def get_user_by_id(user_id: int):
    try:
        with engine.connect() as connection:
            result = connection.execute(
                users.select().where(users.c.id == user_id)
            ).first()
            return result
    except Exception as e:
        print(f"Error obteniendo usuario por ID: {e}")
        return None

# Función para obtener el usuario actual basado en el token
def get_current_user(email: str = Depends(verify_token)):
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    return user

@login_router.post("/login", response_model=Token, tags=["Autenticación"])
async def login(user_data: UserLogin):
    """
    Endpoint para iniciar sesión
    """
    # Buscar usuario por email
    user = get_user_by_email(user_data.email.lower().strip())
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Verificar contraseña usando werkzeug (igual que en tu registro)
    if not check_password_hash(user.password_hash, user_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Crear token de acceso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, 
        expires_delta=access_token_expires
    )
    
    # Crear respuesta con datos del usuario
    user_response = UserResponse(
        id=user.id,
        nombre_usuario=user.nombre_usuario,
        email=user.email,
        telefono=user.telefono,
        foto_perfil=user.foto_perfil,
        fecha_creacion=str(user.fecha_creacion) if user.fecha_creacion else None
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@login_router.get("/verify-token", response_model=UserResponse, tags=["Autenticación"])
async def verify_user_token(current_user = Depends(get_current_user)):
    """
    Endpoint para verificar si el token JWT es válido y obtener datos del usuario
    """
    return UserResponse(
        id=current_user.id,
        nombre_usuario=current_user.nombre_usuario,
        email=current_user.email,
        telefono=current_user.telefono,
        foto_perfil=current_user.foto_perfil,
        fecha_creacion=str(current_user.fecha_creacion) if current_user.fecha_creacion else None
    )

@login_router.get("/usuario-actual", response_model=UserResponse, tags=["Autenticación"])
async def get_current_user_info(current_user = Depends(get_current_user)):
    """
    Endpoint para obtener información del usuario actual (equivalente a profile)
    Usa el mismo formato que tu endpoint existente /lanaapp/user/{user_id}
    """
    return UserResponse(
        id=current_user.id,
        nombre_usuario=current_user.nombre_usuario,
        email=current_user.email,
        telefono=current_user.telefono,
        foto_perfil=current_user.foto_perfil,
        fecha_creacion=str(current_user.fecha_creacion) if current_user.fecha_creacion else None
    )

@login_router.post("/logout", tags=["Autenticación"])
async def logout():
    """
    Logout - En JWT stateless no necesitas hacer nada en el servidor.
    El cliente debe eliminar el token de su almacenamiento local.
    """
    return {"message": "Logout exitoso"}

# Función helper para usar en otros routers que necesiten autenticación
def get_current_user_id(current_user = Depends(get_current_user)) -> int:
    """
    Helper para obtener solo el ID del usuario actual
    Útil para otros endpoints que necesiten el ID del usuario autenticado
    """
    return current_user.id