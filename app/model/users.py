from sqlalchemy import Table, Column
from sqlalchemy.sql.sqltypes import Integer, String, TIMESTAMP
# func funciona para decirle a SQLAlchemy que se quiere usar funciones nativas de una base de datos
from sqlalchemy.sql import func
from app.config.db import engine, meta_data

# En la tabla se le ingresa el nombre de la tabla, lo que es meta_data que viene de config
# Despues ya se crean las tablas y columnas que va tener nuestra base de datos
users = Table("usuarios", meta_data, 
                Column("id", Integer, primary_key=True, unique = True),
                Column("nombre_usuario", String(255), nullable = False, unique = True),
                Column("email", String(255), nullable = False, unique = True),
                Column("password_hash", String(255), nullable = False),
                # TODO: Cuando se acaben las pruebas hacer que sea unico el telefono
                Column("telefono", String(100), nullable = False),
                Column("foto_perfil", String(255), nullable = True),
                # server_default = func.now() pone la hora actual al insertar una fila
                Column("fecha_creacion", TIMESTAMP, nullable = False, server_default=func.now()),
                # onupdate=func.now() actualiza con la hora actual cada vez que se pone un update
                Column("fecha_actualizacion", TIMESTAMP, nullable = False, onupdate = func.now(), server_default=func.now()));




