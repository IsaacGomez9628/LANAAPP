from fastapi import APIRouter, HTTPException
from starlette.status import HTTP_201_CREATED, HTTP_404_NOT_FOUND
from typing import List
from app.config.db import engine
from app.model.pagosProgramados import pagos_programados
from app.schema.pagos_programados_schema import PagoProgramadoSchema, PagoProgramadoSchemaOut
from datetime import date

pagos_router = APIRouter()

@pagos_router.get("/lanaapp/pagos-fijos", response_model=List[PagoProgramadoSchemaOut], tags=["Pagos Fijos"])
def obtener_pagos_programados():
    with engine.connect() as connection:
        result = connection.execute(pagos_programados.select()).fetchall()
        return result

@pagos_router.post("/lanaapp/pagos-fijos", status_code=HTTP_201_CREATED, tags=["Pagos Fijos"])
def crear_pago_programado(data: PagoProgramadoSchema):
    nuevo_pago = data.model_dump()
    with engine.connect() as connection:
        connection.execute(pagos_programados.insert().values(nuevo_pago))
    return {"mensaje": "Pago fijo creado correctamente"}

@pagos_router.put("/lanaapp/pagos-fijos/{pago_id}", tags=["Pagos Fijos"])
def actualizar_pago_programado(pago_id: int, data: PagoProgramadoSchema):
    valores = data.model_dump()
    with engine.connect() as connection:
        result = connection.execute(
            pagos_programados.update()
            .where(pagos_programados.c.id == pago_id)
            .values(valores)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Pago no encontrado")
    return {"mensaje": "Pago fijo actualizado correctamente"}

@pagos_router.delete("/lanaapp/pagos-fijos/{pago_id}", tags=["Pagos Fijos"])
def eliminar_pago_programado(pago_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            pagos_programados.delete().where(pagos_programados.c.id == pago_id)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Pago no encontrado")
    return {"mensaje": "Pago fijo eliminado correctamente"}

@pagos_router.get("/lanaapp/pagos-fijos/upcoming", response_model=List[PagoProgramadoSchemaOut], tags=["Pagos Fijos"])
def obtener_pagos_proximos():
    hoy = date.today()
    with engine.connect() as connection:
        result = connection.execute(
            pagos_programados.select().where(
                pagos_programados.c.proximo_pago >= hoy
            ).order_by(pagos_programados.c.proximo_pago.asc())
        ).fetchall()
        return result
