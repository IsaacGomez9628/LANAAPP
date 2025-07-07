from sqlalchemy import Table, Column, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.config.db import meta_data

preferencias_notificacion = Table("preferenciasnotificacionusuario", meta_data,
    Column("usuario_id", Integer, ForeignKey("usuarios.id"), primary_key=True),

    Column("notificar_exceso_presupuesto_email", Integer, default=1),
    Column("notificar_exceso_presupuesto_sms", Integer, default=0),
    Column("notificar_exceso_presupuesto_push", Integer, default=1),

    Column("notificar_pago_fijo_vencimiento_email", Integer, default=1),
    Column("notificar_pago_fijo_vencimiento_sms", Integer, default=0),
    Column("notificar_pago_fijo_vencimiento_push", Integer, default=1),

    Column("notificar_falta_presupuesto_pago_fijo_email", Integer, default=1),
    Column("notificar_falta_presupuesto_pago_fijo_push", Integer, default=1),

    Column("dias_anticipacion_pago_fijo", Integer, default=3),

    Column("fecha_actualizacion", TIMESTAMP, nullable=False, onupdate=func.now(), server_default=func.now())
)
