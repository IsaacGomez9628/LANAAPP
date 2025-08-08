from sqlalchemy import Table, Column, Integer, String, Text, Enum, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.config.db import meta_data

notificaciones = Table("notificaciones", meta_data,
    Column("id", Integer, primary_key=True, unique=True),
    Column("usuario_id", Integer, ForeignKey("usuarios.id"), nullable=False),
    Column("tipo_notificacion_canal", Enum("email", "sms", "push"), nullable=False),
    Column("destino", String(255), nullable=False),
    Column("asunto", String(255), nullable=True),
    Column("mensaje", Text, nullable=True),
    Column("fecha_envio", TIMESTAMP, nullable=True),
    Column("estado_envio", Enum("pendiente", "enviado", "fallido"), nullable=False),
    Column("leida", Integer, nullable=False, default=0),
    Column("notificable_type", String(50), nullable=True),
    Column("notificable_id", Integer, nullable=True),
    Column("fecha_creacion", TIMESTAMP, nullable=False, server_default=func.now()),
    Column("fecha_actualizacion", TIMESTAMP, nullable=False, onupdate=func.now(), server_default=func.now())
)
