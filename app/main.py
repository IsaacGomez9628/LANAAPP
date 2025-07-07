from fastapi import FastAPI
# si no se encuentra el modulo router asegurarse de que este dentro de la carpeta app, sino quitar el app
from app.router.router import router
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
app = FastAPI(lifespan=lifespan)
# este include_router agrega las rutas user que esta en la carpeta router en router.py
app.include_router(router)

meta_data.create_all(engine)



@app.get("/")
def root():
    return {"message": "Hola desde Lana App"}

