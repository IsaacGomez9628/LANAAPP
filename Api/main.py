from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# si no se encuentra el modulo router asegurarse de que este dentro de la carpeta app, sino quitar el app
from app.router.router import router  # ¡ESTO SE TE OLVIDÓ!
from app.config.db import engine, meta_data
from app.model import users, transaccion, tokensJWTInvalido, presupuestos, prefereciasNotificacionesUsuarios, pagosProgramados, notificaciones, categorias
from sqlalchemy.exc import OperationalError
from sqlalchemy import text
from contextlib import asynccontextmanager


async def lifespan(app: FastAPI):
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("Se pudo conectar a la base de datos")
    except OperationalError as e:
        print("Error en la base de datos", e)
    # esto hace que corra la app
    yield

# Instancia de FastApi
app = FastAPI(
    title="Lana App API",
    description="API para gestión de gastos personales",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS para React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción cambia por URLs específicas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(router)  # Tu router existente (que YA incluye el login_router)

meta_data.create_all(engine)

@app.get("/")
def root():
    return {
        "message": "Hola desde Lana App",
        "endpoints": {
            "usuarios": "/lanaapp/user",
            "autenticacion": "/login",  # Los endpoints de login estarán aquí
            "documentacion": "/docs"
        }
    }