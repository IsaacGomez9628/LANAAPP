from sqlalchemy import Table, Column, Integer, String, DECIMAL, Date, Enum, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.config.db import meta_data

pagos_programados = Table("pagosprogramados", meta_data,
    Column("id", Integer, primary_key=True, unique=True),
    Column("usuario_id", Integer, ForeignKey("usuarios.id"), nullable=False),
    Column("categoria_id", Integer, ForeignKey("categorias.id"), nullable=False),
    Column("descripcion", String(255), nullable=True),
    Column("monto", DECIMAL(10, 2), nullable=False),
    Column("dia_vencimiento", Integer, nullable=False),
    Column("fecha_fin", Date, nullable=True),
    Column("frecuencia", Enum("diario", "semanal", "mensual", "anual"), nullable=False),
    Column("proxima_fecha_vencimiento", Date, nullable=True),
    Column("registrar_automaticamente", Integer, nullable=False, default=0),
    Column("activo", Integer, nullable=False, default=1),
    Column("fecha_creacion", TIMESTAMP, nullable=False, server_default=func.now()),
    Column("fecha_actualizacion", TIMESTAMP, nullable=False, onupdate=func.now(), server_default=func.now())
)
