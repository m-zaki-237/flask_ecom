from marshmallow import Schema, fields, validate

class ProductCreateSchema(Schema):
    product_name = fields.str(required = True, validate = validate(min=1, max=150))
    price = fields.Float(required = True, validate = validate.Range(min=0))
    stock = fields.Int(required = True, validate = validate.Range(min=0))
    category_id = fields.Int(required = True)
    image_url = fields.Str(required = True)