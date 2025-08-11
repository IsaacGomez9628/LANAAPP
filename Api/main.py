from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.router.router import router
from app.config.db import engine, meta_data
from app.model import (
    users, transaccion, tokensJWTInvalido, presupuestos,
    prefereciasNotificacionesUsuarios, pagosProgramados,
    notificaciones, categorias
)
from sqlalchemy.exc import OperationalError
from sqlalchemy import text


# Lifespan para verificar conexión a la base de datos
async def lifespan(app: FastAPI):
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("Se pudo conectar a la base de datos")
    except OperationalError as e:
        print("Error en la base de datos", e)
    yield


# Instancia de FastAPI con metadatos
app = FastAPI(
    title="Lana App API",
    description="API para gestión de gastos personales",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS para permitir solicitudes externas (React Native, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambiar en producción a dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir router principal (que internamente incluye login_router)
app.include_router(router)

# Crear todas las tablas si no existen
meta_data.create_all(engine)


# Endpoint raíz
@app.get("/")
def root():
    return {
        "message": "Hola desde Lana App",
        "endpoints": {
            "usuarios": "/lanaapp/user",
            "autenticacion": "/login",
            "documentacion": "/docs"
        }
    }
