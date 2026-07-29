from marshmallow import Schema, fields, validate

class ProductCreateSchema(Schema):
    product_name = fields.Str(required = True, validate = validate.Length(min=1, max=150))
    description = fields.Str(required = False, allow_none = True)
    price = fields.Float(required = True, validate = validate.Range(min=0))
    stock = fields.Int(required = True, validate = validate.Range(min=0))
    category_id = fields.Int(required = True)