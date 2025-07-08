# app/router/router.py

from fastapi import APIRouter
from app.router.router_user import user_router
from app.router.router_transaccion import transaccion_router
from app.router.router_presupuesto import presupuesto_router
from app.router.router_pagos_programados import pagos_router
from app.router.router_notificaciones import notificaciones_router
from app.router.router_categoria import categoria_router

router = APIRouter()

router.include_router(user_router)
router.include_router(transaccion_router)
router.include_router(presupuesto_router)
router.include_router(pagos_router)
router.include_router(notificaciones_router)
router.include_router(categoria_router)
