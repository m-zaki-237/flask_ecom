from marshmallow import Schema, fields, validate

class PaymentCreateSchema(Schema):
    order_id = fields.Int(required= True)
    amount = fields.Int(required= True, validate= validate.Range(min=0))
    paymeny_methods = fields.str(required= True)
    paymeny_status = fields.str(required= True)