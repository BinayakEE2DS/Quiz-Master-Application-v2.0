from flask_restful import Api, Resource, reqparse
from .models import User, Role
from flask_security import auth_required, roles_required, roles_accepted, current_user

api = Api()

def roles_list(roles):
    role_list = []
    for role in roles:
        role_list.append(role.name)
    return role_list

class UserRolesResource(Resource):
    @auth_required()
    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404
        return {"roles": roles_list(user.roles)}

# Add the resource to the API
api.add_resource(UserRolesResource, "/user/<int:user_id>/roles")