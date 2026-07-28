import cloudinary, cloudinary.uploader
import os
from dotenv import load_dotenv

cloudinary.config(from_url = os.getenv("CLOUDINARY_URL"))

def upload_image(file):
    result = cloudinary.uploader.upload(file)
    return result["secure_url"]