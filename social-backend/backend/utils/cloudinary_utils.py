import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="daqo9moti",
    api_key="493968941358932",
    api_secret="Ez9bquYnS3n2Zu4t3Hxi4PFVGQA"
)

async def upload_image_to_cloudinary(file):
    contents = await file.read()          # you read file async
    result = cloudinary.uploader.upload(contents)
    return result.get("secure_url")
