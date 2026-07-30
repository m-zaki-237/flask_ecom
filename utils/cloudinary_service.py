from __future__ import absolute_import
import cloudinary
import cloudinary.uploader
import os

cloudinary.config(from_url=os.getenv("CLOUDINARY_URL"))

def upload_image(file):
    result = cloudinary.uploader.upload(file)
    return result["secure_url"]
