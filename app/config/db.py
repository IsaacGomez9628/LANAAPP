# Con esto se crea una conexion a una base de datos
from sqlalchemy import create_engine, MetaData

# datos que ocupa engine para poder estar enlazado con la base de datos
# primero va la base de datos que estamos ocupando, despues el usuario, contraseña@localhost:3306 (puerto de sql) y el nombre de la base de datos
engine = create_engine("mysql+pymysql://root:root@localhost:3306/lanaapp2")

#esto mantiene abierta nuestra conexion a la base de datos
# conn = engine.connect()

#MetaData se usa como contenedor central donde se guarda la informacion de todas la tablas y esquemas para la base de datos
meta_data = MetaData()