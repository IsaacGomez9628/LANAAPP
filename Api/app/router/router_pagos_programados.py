# app/router/router_pagos_programados.py
from fastapi import APIRouter, HTTPException
from starlette.status import HTTP_201_CREATED, HTTP_404_NOT_FOUND
from typing import List, Literal
from app.config.db import engine
from app.model.pagosProgramados import pagos_programados
from app.schema.pagos_programados_schema import PagoProgramadoSchema, PagoProgramadoSchemaOut
from datetime import date

pagos_router = APIRouter()

@pagos_router.get("/lanaapp/pagos-fijos", response_model=List[PagoProgramadoSchemaOut], tags=["Pagos Fijos"])
def obtener_pagos_programados():
    """Obtener todos los pagos programados"""
    with engine.connect() as connection:
        result = connection.execute(pagos_programados.select()).fetchall()
        return [dict(row._mapping) for row in result]

@pagos_router.post("/lanaapp/pagos-fijos", status_code=HTTP_201_CREATED, tags=["Pagos Fijos"])
def crear_pago_programado(data: PagoProgramadoSchema):
    """Crear un nuevo pago programado"""
    nuevo_pago = data.model_dump()
    
    # Validación adicional
    if data.dia_vencimiento < 1 or data.dia_vencimiento > 31:
        raise HTTPException(status_code=400, detail="El día de vencimiento debe estar entre 1 y 31")
    
    if data.monto <= 0:
        raise HTTPException(status_code=400, detail="El monto debe ser mayor a 0")
    
    try:
        with engine.connect() as connection:
            with connection.begin():
                connection.execute(pagos_programados.insert().values(nuevo_pago))
        return {"mensaje": "Pago programado creado correctamente"}
    except Exception as e:
        if "Data truncated for column 'frecuencia'" in str(e):
            raise HTTPException(
                status_code=400, 
                detail="Frecuencia debe ser: 'diario', 'semanal', 'mensual' o 'anual'"
            )
        raise HTTPException(status_code=500, detail=f"Error al crear el pago programado: {str(e)}")

# RUTAS ESPECÍFICAS PRIMERO (antes de las rutas con parámetros dinámicos)
@pagos_router.get("/lanaapp/pagos-fijos/upcoming", response_model=List[PagoProgramadoSchemaOut], tags=["Pagos Fijos"])
def obtener_pagos_proximos():
    """Obtener pagos programados próximos a vencer"""
    hoy = date.today()
    with engine.connect() as connection:
        # Remover filtro por activo para debug - mostrar todos los pagos próximos
        result = connection.execute(
            pagos_programados.select().where(
                pagos_programados.c.proxima_fecha_vencimiento >= hoy
            ).order_by(pagos_programados.c.proxima_fecha_vencimiento.asc())
        ).fetchall()
        return [dict(row._mapping) for row in result]

@pagos_router.get("/lanaapp/pagos-fijos/usuario/{usuario_id}", response_model=List[PagoProgramadoSchemaOut], tags=["Pagos Fijos"])
def obtener_pagos_por_usuario(usuario_id: int):
    """Obtener todos los pagos programados de un usuario específico"""
    with engine.connect() as connection:
        result = connection.execute(
            pagos_programados.select().where(pagos_programados.c.usuario_id == usuario_id)
        ).fetchall()
        return [dict(row._mapping) for row in result]

@pagos_router.get("/lanaapp/pagos-fijos/frecuencia/{frecuencia}", response_model=List[PagoProgramadoSchemaOut], tags=["Pagos Fijos"])
def obtener_pagos_por_frecuencia(frecuencia: Literal["diario", "semanal", "mensual", "anual"]):
    """Obtener pagos programados por frecuencia (diario, semanal, mensual, anual)"""
    with engine.connect() as connection:
        # Remover filtro por activo para debug - mostrar todos los pagos de esa frecuencia
        result = connection.execute(
            pagos_programados.select().where(
                pagos_programados.c.frecuencia == frecuencia
            )
        ).fetchall()
        return [dict(row._mapping) for row in result]

# RUTAS CON PARÁMETROS DINÁMICOS AL FINAL
@pagos_router.get("/lanaapp/pagos-fijos/{pago_id}", response_model=PagoProgramadoSchemaOut, tags=["Pagos Fijos"])
def obtener_pago_programado(pago_id: int):
    """Obtener un pago programado específico por ID"""
    with engine.connect() as connection:
        result = connection.execute(
            pagos_programados.select().where(pagos_programados.c.id == pago_id)
        ).first()
        if result is None:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Pago programado no encontrado")
        return dict(result._mapping)

@pagos_router.put("/lanaapp/pagos-fijos/{pago_id}", tags=["Pagos Fijos"])
def actualizar_pago_programado(pago_id: int, data: PagoProgramadoSchema):
    """Actualizar un pago programado existente"""
    valores = data.model_dump()
    
    # Validación adicional
    if data.dia_vencimiento < 1 or data.dia_vencimiento > 31:
        raise HTTPException(status_code=400, detail="El día de vencimiento debe estar entre 1 y 31")
    
    if data.monto <= 0:
        raise HTTPException(status_code=400, detail="El monto debe ser mayor a 0")
    
    try:
        with engine.connect() as connection:
            with connection.begin():
                result = connection.execute(
                    pagos_programados.update()
                    .where(pagos_programados.c.id == pago_id)
                    .values(valores)
                )
                if result.rowcount == 0:
                    raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Pago programado no encontrado")
        return {"mensaje": "Pago programado actualizado correctamente"}
    except HTTPException:
        raise  # Re-lanzar HTTPExceptions
    except Exception as e:
        if "Data truncated for column 'frecuencia'" in str(e):
            raise HTTPException(
                status_code=400, 
                detail="Frecuencia debe ser: 'diario', 'semanal', 'mensual' o 'anual'"
            )
        raise HTTPException(status_code=500, detail=f"Error al actualizar el pago programado: {str(e)}")

@pagos_router.delete("/lanaapp/pagos-fijos/{pago_id}", tags=["Pagos Fijos"])
def eliminar_pago_programado(pago_id: int):
    """Eliminar un pago programado"""
    with engine.connect() as connection:
        with connection.begin():
            result = connection.execute(
                pagos_programados.delete().where(pagos_programados.c.id == pago_id)
            )
            if result.rowcount == 0:
                raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Pago programado no encontrado")
    return {"mensaje": "Pago programado eliminado correctamente"}

@pagos_router.patch("/lanaapp/pagos-fijos/{pago_id}/toggle-status", tags=["Pagos Fijos"])
def cambiar_estado_pago(pago_id: int):
    """Activar/Desactivar un pago programado"""
    with engine.connect() as connection:
        with connection.begin():
            # Primero obtener el estado actual
            result = connection.execute(
                pagos_programados.select().where(pagos_programados.c.id == pago_id)
            ).first()
            
            if result is None:
                raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Pago programado no encontrado")
            
            # Cambiar el estado
            nuevo_estado = 0 if result.activo == 1 else 1
            connection.execute(
                pagos_programados.update()
                .where(pagos_programados.c.id == pago_id)
                .values(activo=nuevo_estado)
            )
            
            estado_texto = "activado" if nuevo_estado == 1 else "desactivado"
            return {"mensaje": f"Pago programado {estado_texto} correctamente"}