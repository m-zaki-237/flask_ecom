from marshmallow import Schema, fields, validate

class UserRegisterSchema(Schema):
    first_name = fields.str(required = True, validate = validate.Length(min=1, max=50))
    last_name = fields.str(required = True, validate = validate.Length(min=1, max=50))
    email = fields.Email(required = True)
    password = fields.str(required = True, validate = validate.Length(min=8))
    role_id = fields.Int(required = True)