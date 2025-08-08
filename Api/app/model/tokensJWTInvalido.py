from sqlalchemy import Table, Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func
from app.config.db import meta_data

tokens_invalidos = Table("tokensjwtinvalidados", meta_data,
    Column("id", Integer, primary_key=True, unique=True),
    Column("token_jwt", String(255), nullable=False),
    Column("fecha_expiracion_original", TIMESTAMP, nullable=False),
    Column("fecha_invalidacion", TIMESTAMP, nullable=False, server_default=func.now())
)
