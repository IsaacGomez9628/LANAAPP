from fastapi import APIRouter, HTTPException
from starlette.status import HTTP_201_CREATED, HTTP_404_NOT_FOUND
from app.config.db import engine
from app.model.categorias import categorias
from app.schema.categoria_schema import CategoriaSchema, CategoriaSchemaOut
from typing import List

categoria_router = APIRouter()

@categoria_router.post("/lanaapp/categorias", status_code=HTTP_201_CREATED, tags=["Categorías"])
def crear_categoria(data: CategoriaSchema):
    nueva_categoria = data.model_dump()
    with engine.connect() as connection:
        with connection.begin():
            connection.execute(categorias.insert().values(nueva_categoria))
    return {"mensaje": "Categoría creada correctamente"}

@categoria_router.get("/lanaapp/categorias", response_model=List[CategoriaSchemaOut], tags=["Categorías"])
def obtener_categorias():
    with engine.connect() as connection:
        result = connection.execute(categorias.select()).fetchall()
        return [dict(row._mapping) for row in result]

@categoria_router.get("/lanaapp/categorias/{categoria_id}", response_model=CategoriaSchemaOut, tags=["Categorías"])
def obtener_categoria(categoria_id: int):
    with engine.connect() as connection:
        result = connection.execute(categorias.select().where(categorias.c.id == categoria_id)).first()
        if result is None:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
        return dict(result._mapping)

@categoria_router.put("/lanaapp/categorias/{categoria_id}", tags=["Categorías"])
def actualizar_categoria(categoria_id: int, data: CategoriaSchema):
    actualizada = data.model_dump()
    with engine.connect() as connection:
        with connection.begin():
            result = connection.execute(
                categorias.update()
                .where(categorias.c.id == categoria_id)
                .values(actualizada)
            )
            if result.rowcount == 0:
                raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    return {"mensaje": "Categoría actualizada correctamente"}

@categoria_router.delete("/lanaapp/categorias/{categoria_id}", tags=["Categorías"])
def eliminar_categoria(categoria_id: int):
    with engine.connect() as connection:
        with connection.begin():
            result = connection.execute(categorias.delete().where(categorias.c.id == categoria_id))
            if result.rowcount == 0:
                raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    return {"mensaje": "Categoría eliminada correctamente"}
