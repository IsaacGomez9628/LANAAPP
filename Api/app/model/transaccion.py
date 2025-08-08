from sqlalchemy import Table, Column, Integer, DECIMAL, String, Date, TIMESTAMP, ForeignKey, JSON
from sqlalchemy.sql import func
from app.config.db import meta_data

transacciones = Table("transacciones", meta_data,
    Column("id", Integer, primary_key=True, unique=True),
    Column("usuario_id", Integer, ForeignKey("usuarios.id"), nullable=False),
    Column("categoria_id", Integer, ForeignKey("categorias.id"), nullable=False),
    Column("monto", DECIMAL(10, 2), nullable=False),
    Column("fecha_transaccion", Date, nullable=False),
    Column("descripcion", String(255), nullable=True),
    Column("metadatos", JSON, nullable=True),
    Column("pendiente_sincronizacion", Integer, nullable=False, default=0),
    Column("fecha_creacion", TIMESTAMP, nullable=False, server_default=func.now()),
    Column("fecha_actualizacion", TIMESTAMP, nullable=False, onupdate=func.now(), server_default=func.now())
)
