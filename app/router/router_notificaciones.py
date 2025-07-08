from fastapi import APIRouter, HTTPException
from starlette.status import HTTP_201_CREATED, HTTP_404_NOT_FOUND
from typing import List
from app.config.db import engine
from app.model.notificaciones import notificaciones
from app.schema.notificaciones_schema import NotificacionSchema, NotificacionSchemaOut

notificaciones_router = APIRouter()

@notificaciones_router.get("/lanaapp/notificaciones", response_model=List[NotificacionSchemaOut], tags=["Notificaciones"])
def obtener_todas():
    with engine.connect() as connection:
        result = connection.execute(notificaciones.select()).fetchall()
        return result

@notificaciones_router.get("/lanaapp/notificaciones/usuario/{usuario_id}", response_model=List[NotificacionSchemaOut], tags=["Notificaciones"])
def obtener_por_usuario(usuario_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            notificaciones.select().where(notificaciones.c.usuario_id == usuario_id)
        ).fetchall()
        return result

@notificaciones_router.post("/lanaapp/notificaciones", status_code=HTTP_201_CREATED, tags=["Notificaciones"])
def crear_notificacion(data: NotificacionSchema):
    valores = data.model_dump()
    with engine.connect() as connection:
        connection.execute(notificaciones.insert().values(valores))
    return {"mensaje": "Notificación creada"}

@notificaciones_router.get("/lanaapp/notificaciones/{notificacion_id}", response_model=NotificacionSchemaOut, tags=["Notificaciones"])
def obtener_por_id(notificacion_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            notificaciones.select().where(notificaciones.c.id == notificacion_id)
        ).first()
        if result is None:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="No encontrada")
        return dict(result._mapping)

@notificaciones_router.put("/lanaapp/notificaciones/{notificacion_id}", tags=["Notificaciones"])
def actualizar_notificacion(notificacion_id: int, data: NotificacionSchema):
    valores = data.model_dump()
    with engine.connect() as connection:
        result = connection.execute(
            notificaciones.update()
            .where(notificaciones.c.id == notificacion_id)
            .values(valores)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="No encontrada")
    return {"mensaje": "Notificación actualizada"}

@notificaciones_router.delete("/lanaapp/notificaciones/{notificacion_id}", tags=["Notificaciones"])
def eliminar_notificacion(notificacion_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            notificaciones.delete().where(notificaciones.c.id == notificacion_id)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="No encontrada")
    return {"mensaje": "Notificación eliminada"}

@notificaciones_router.put("/lanaapp/notificaciones/{notificacion_id}/leida", tags=["Notificaciones"])
def marcar_como_leida(notificacion_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            notificaciones.update()
            .where(notificaciones.c.id == notificacion_id)
            .values(leida=1)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="No encontrada")
    return {"mensaje": "Notificación marcada como leída"}

@notificaciones_router.put("/lanaapp/notificaciones/{notificacion_id}/leida", tags=["Notificaciones"])
def marcar_como_leida(notificacion_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            notificaciones.update()
            .where(notificaciones.c.id == notificacion_id)
            .values(leida=1)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="No encontrada")
    return {"mensaje": "Notificación marcada como leída"}

@notificaciones_router.put("/lanaapp/notificaciones/usuario/{usuario_id}/marcar-leidas", tags=["Notificaciones"])
def marcar_todas_como_leidas(usuario_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            notificaciones.update()
            .where(notificaciones.c.usuario_id == usuario_id)
            .values(leida=1)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="No hay notificaciones para actualizar")
    return {"mensaje": f"Se marcaron {result.rowcount} notificaciones como leídas"}
