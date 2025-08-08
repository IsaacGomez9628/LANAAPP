# app/router/router_presupuesto.py

from fastapi import APIRouter, HTTPException
from starlette.status import HTTP_201_CREATED, HTTP_404_NOT_FOUND
from typing import List
from app.config.db import engine
from app.model.presupuestos import presupuestos
from app.schema.presupuesto_schema import PresupuestoSchema, PresupuestoSchemaOut

presupuesto_router = APIRouter()

@presupuesto_router.get("/lanaapp/presupuesto", response_model=List[PresupuestoSchemaOut], tags=["Presupuesto"])
def obtener_presupuestos():
    with engine.connect() as connection:
        result = connection.execute(presupuestos.select()).fetchall()
        return result

@presupuesto_router.post("/lanaapp/presupuesto", status_code=HTTP_201_CREATED, tags=["Presupuesto"])
def crear_presupuesto(data: PresupuestoSchema):
    nuevo_presupuesto = data.model_dump()
    with engine.connect() as connection:
        connection.execute(presupuestos.insert().values(nuevo_presupuesto))
    return {"mensaje": "Presupuesto creado correctamente"}

@presupuesto_router.put("/lanaapp/presupuesto/{presupuesto_id}", tags=["Presupuesto"])
def actualizar_presupuesto(presupuesto_id: int, data: PresupuestoSchema):
    valores = data.model_dump()
    with engine.connect() as connection:
        result = connection.execute(
            presupuestos.update()
            .where(presupuestos.c.id == presupuesto_id)
            .values(valores)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Presupuesto no encontrado")
    return {"mensaje": "Presupuesto actualizado correctamente"}

@presupuesto_router.delete("/lanaapp/presupuesto/{presupuesto_id}", tags=["Presupuesto"])
def eliminar_presupuesto(presupuesto_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            presupuestos.delete().where(presupuestos.c.id == presupuesto_id)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Presupuesto no encontrado")
    return {"mensaje": "Presupuesto eliminado correctamente"}
