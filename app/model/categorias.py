from sqlalchemy import Table, Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func
from app.config.db import meta_data

categorias = Table("categorias", meta_data,
    Column("id", Integer, primary_key=True, unique=True),
    Column("nombre_categoria", String(255), nullable=False),
    Column("tipo", String(50), nullable=False),  # Debes validar que solo acepte ciertos valores en lógica de negocio
    Column("fecha_creacion", TIMESTAMP, nullable=False, server_default=func.now()),
    Column("fecha_actualizacion", TIMESTAMP, nullable=False, onupdate=func.now(), server_default=func.now())
)
