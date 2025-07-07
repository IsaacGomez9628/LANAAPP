from sqlalchemy import Table, Column, Integer, DECIMAL, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.config.db import meta_data

presupuestos = Table("presupuestos", meta_data,
    Column("id", Integer, primary_key=True, unique=True),
    Column("usuario_id", Integer, ForeignKey("usuarios.id"), nullable=False),
    Column("categoria_id", Integer, ForeignKey("categorias.id"), nullable=False),
    Column("monto_presupuestado", DECIMAL(10,2), nullable=False),
    Column("mes", Integer, nullable=False),
    Column("anio", Integer, nullable=False),
    Column("fecha_creacion", TIMESTAMP, nullable=False, server_default=func.now()),
    Column("fecha_actualizacion", TIMESTAMP, nullable=False, onupdate=func.now(), server_default=func.now())
)
