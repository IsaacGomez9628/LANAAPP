from fastapi import APIRouter, HTTPException, Response
from starlette.status import HTTP_201_CREATED, HTTP_404_NOT_FOUND
from typing import List
from app.schema.user_schema import UserSchema, UserSchemaOut
from app.config.db import engine
from app.model.users import users
from werkzeug.security import generate_password_hash, check_password_hash

user_router = APIRouter()

@user_router.post("/lanaapp/user", status_code=HTTP_201_CREATED, tags=["Usuarios"])
def create_user(data_user: UserSchema):
    print("Datos recibidos", data_user.model_dump())
    # nuestros usuarios creados se van a convertir en un diccionario para que los pueda leer data_user
    # un diccionario tiene un clave, valor
    new_user = data_user.model_dump()
    # en el generate password hash se reciben dos parametros
    new_user["password_hash"] = generate_password_hash(data_user.password, "pbkdf2:sha256:30", 30)

    del new_user["password"]
    try: 
        with engine.connect() as connection:
            with connection.begin():
                connection.execute(users.insert().values(new_user))
                print("Se agrego el usuario correctamente")
    except Exception as e:
        print("No se agrego el usuario correctamente")
    print("Usuarios insertados con datos", new_user)
    return Response(status_code=HTTP_201_CREATED)


@user_router.get("/lanaapp/user/{user_id}", response_model = UserSchemaOut, tags=["Usuarios"])
def obtener_solo_un_usuario(user_id: int):
    try: 
        with engine.connect() as connection:
        # c en la parte de where se refiere a la columna
            result = connection.execute(users.select().where(users.c.id == user_id)).first()
            
            if result is None:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            user_data = dict(result._mapping)
            return user_data
            
    except Exception as e:
        print ("No se encontro el usuario", e)
        raise HTTPException(status_code=500, detail=str(e))
    
@user_router.get("/lanaapp/user", response_model=List[UserSchema], tags=["Usuarios"])
def obtener_usuarios():
    with engine.connect() as connection:
        result = connection.execute(users.select()).fetchall()
        return result

@user_router.put("/lanaapp/user/{user_id}", tags=["Usuarios"])
def update_user(user_id: int, data: UserSchema):
    updated_data = data.model_dump()
    updated_data["password_hash"] = generate_password_hash(data.password, "pbkdf2:sha256:30", 30)
    del updated_data["password"]
    with engine.connect() as connection:
        result = connection.execute(
            users.update()
            .where(users.c.id == user_id)
            .values(updated_data)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return {"mensaje": "Usuario actualizado correctamente"}

@user_router.delete("/lanaapp/user/{user_id}", tags=["Usuarios"])
def delete_user(user_id: int):
    with engine.connect() as connection:
        result = connection.execute(users.delete().where(users.c.id == user_id))
        if result.rowcount == 0:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return {"mensaje": "Usuario eliminado correctamente"}
