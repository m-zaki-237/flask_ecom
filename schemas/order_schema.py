from marshmallow import Schema, fields, validate

class OrderCreateSchema(Schema):
    user_id = fields.Int(required= True)
    items = fields.List(fields.Dict(), required= True, validate= validate.Length(min=1))