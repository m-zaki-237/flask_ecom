from marshmallow import Schema, fields, validate

class PaymentCreateSchema(Schema):
    order_id = fields.Int(required=True)
    amount = fields.Float(required=True, validate=validate.Range(min=0))
    payment_method = fields.Str(required=True)
    payment_status = fields.Str(required=True)