# app/router/router_transaccion.py

from fastapi import APIRouter, HTTPException, Response
from starlette.status import HTTP_201_CREATED, HTTP_404_NOT_FOUND
from typing import List
from app.config.db import engine
from app.model.transaccion import transacciones
from app.model.categorias import categorias
from app.schema.transaccion_schema import TransaccionSchema, TransaccionSchemaOut

transaccion_router = APIRouter()

@transaccion_router.get("/lanaapp/transactions/", response_model=List[TransaccionSchemaOut], tags=["Transacciones"])
def get_transacciones():
    with engine.connect() as connection:
        result = connection.execute(transacciones.select()).fetchall()
        return result

@transaccion_router.post("/lanaapp/transactions/", status_code=HTTP_201_CREATED, tags=["Transacciones"])
def create_transaccion(data: TransaccionSchema):
    nueva_transaccion = data.model_dump()
    with engine.connect() as connection:
        connection.execute(transacciones.insert().values(nueva_transaccion))
    return {"mensaje": "Transacción creada correctamente"}

@transaccion_router.get("/lanaapp/transactions/{transaction_id}", response_model=TransaccionSchemaOut, tags=["Transacciones"])
def get_transaccion(transaction_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            transacciones.select().where(transacciones.c.id == transaction_id)
        ).first()
        if result is None:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Transacción no encontrada")
        return dict(result._mapping)

@transaccion_router.put("/lanaapp/transactions/{transaction_id}", tags=["Transacciones"])
def update_transaccion(transaction_id: int, data: TransaccionSchema):
    valores = data.model_dump()
    with engine.connect() as connection:
        result = connection.execute(
            transacciones.update()
            .where(transacciones.c.id == transaction_id)
            .values(valores)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Transacción no encontrada")
    return {"mensaje": "Transacción actualizada correctamente"}

@transaccion_router.delete("/lanaapp/transactions/{transaction_id}", tags=["Transacciones"])
def delete_transaccion(transaction_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            transacciones.delete().where(transacciones.c.id == transaction_id)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Transacción no encontrada")
    return {"mensaje": "Transacción eliminada correctamente"}

@transaccion_router.get("/lanaapp/transactions/categories/list", tags=["Transacciones"])
def get_categories():
    with engine.connect() as connection:
        result = connection.execute(categorias.select()).fetchall()
        return result
