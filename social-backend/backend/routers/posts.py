from fastapi import APIRouter, Depends, UploadFile, File, Form
from datetime import datetime
from bson import ObjectId
from ..db import posts, users
from ..utils.auth_utils import get_current_user
from ..utils.cloudinary_utils import upload_image_to_cloudinary

router = APIRouter(prefix="/posts", tags=["Posts"])


# ---------------- HELPER ----------------
def attach_owner(post):
    owner = None

    owner_id = post.get("owner_id")
    if owner_id:
        try:
            owner = users.find_one(
                {"_id": ObjectId(owner_id)},
                {"password": 0}
            )
        except:
            owner = None

    post["_id"] = str(post["_id"])

    post["owner"] = {
        "id": str(owner["_id"]) if owner else None,
        "username": owner.get("username") if owner else "unknown",
        "full_name": owner.get("full_name") if owner else "",
        "profile_pic": owner.get("profile_pic") if owner else None,
    }

    return post


# ---------------- CREATE POST ----------------
@router.post("/create")
async def create_post(
    content: str = Form(...),
    image: UploadFile = File(None),
    current_user: dict = Depends(get_current_user),
):
    image_url = None
    if image:
        image_url = await upload_image_to_cloudinary(image)

    post = {
        "content": content,
        "image_url": image_url,
        "owner_id": str(current_user["_id"]),
        "likes": [],
        "comments": [],
        "created_at": datetime.utcnow(),
    }

    result = posts.insert_one(post)
    return {"status": "success", "post_id": str(result.inserted_id)}


# ---------------- USER FEED ----------------
@router.get("/feed")
def get_feed():
    all_posts = list(posts.find().sort("created_at", -1))

    feed = []

    for post in all_posts:
        post["_id"] = str(post["_id"])

        owner = None
        owner_id = post.get("owner_id")  # ✅ SAFE

        if owner_id:
            try:
                owner = users.find_one(
                    {"_id": ObjectId(owner_id)},
                    {"password": 0}
                )
            except Exception as e:
                print("Owner lookup failed:", e)

        post["owner"] = {
            "id": str(owner["_id"]),
            "username": owner.get("username"),
            "full_name": owner.get("full_name"),
            "profile_pic": owner.get("profile_pic"),
        } if owner else {
            "id": None,
            "username": "User",
            "full_name": "User",
            "profile_pic": None,
        }

        feed.append(post)

    return {
        "status": "success",
        "posts": feed
    }



# ---------------- MY POSTS (Current User) ----------------
@router.get("/my-posts")
def get_my_posts(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    user_posts = list(
        posts.find({"owner_id": user_id}).sort("created_at", -1)
    )

    posts_with_owner = [attach_owner(p) for p in user_posts]
    return {"status": "success", "posts": posts_with_owner}


# ---------------- SINGLE POST ----------------
@router.get("/post/{post_id}")
def get_single_post(post_id: str):
    post = posts.find_one({"_id": ObjectId(post_id)})

    if not post:
        return {"status": "error", "message": "Post not found"}

    return {"status": "success", "post": attach_owner(post)}


# ---------------- DELETE POST ----------------
@router.delete("/post/{post_id}")
def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        print(f"DELETE POST ENDPOINT HIT - post_id: {post_id}, user_id: {current_user['_id']}")
        post = posts.find_one({"_id": ObjectId(post_id)})
        print(f"Found post: {post is not None}")
        if not post:
            print("Post not found!")
            return {"status": "error", "message": "Post not found"}
        
        # Check if user is the owner
        print(f"Checking ownership: post owner={post.get('owner_id')}, current user={str(current_user['_id'])}")
        if str(post.get("owner_id")) != str(current_user["_id"]):
            print("User is not the owner!")
            return {"status": "error", "message": "Unauthorized"}
        
        result = posts.delete_one({"_id": ObjectId(post_id)})
        print(f"Delete result: {result.deleted_count} documents deleted")
        return {"status": "success", "message": "Post deleted"}
    except Exception as e:
        print(f"DELETE ERROR: {str(e)}")
        return {"status": "error", "message": str(e)}


# ---------------- UPDATE POST ----------------
@router.put("/post/{post_id}")
async def update_post(
    post_id: str,
    content: str = Form(...),
    image: UploadFile = File(None),
    current_user: dict = Depends(get_current_user),
):
    try:
        post = posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            return {"status": "error", "message": "Post not found"}
        
        # Check if user is the owner
        if str(post.get("owner_id")) != str(current_user["_id"]):
            return {"status": "error", "message": "Unauthorized"}
        
        update_data = {"content": content}
        
        if image:
            image_url = await upload_image_to_cloudinary(image)
            update_data["image_url"] = image_url
        
        posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": update_data},
        )
        
        return {"status": "success", "message": "Post updated"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ---------------- USER POSTS ----------------
@router.get("/user/{user_id}")
def get_user_posts(user_id: str):
    user_posts = list(
        posts.find({"owner_id": user_id}).sort("created_at", -1)
    )

    posts_with_owner = [attach_owner(p) for p in user_posts]
    return {"status": "success", "posts": posts_with_owner}


# ---------------- LIKE POST ----------------
@router.post("/like/{post_id}")
def like_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = str(current_user["_id"])

    post = posts.find_one({"_id": ObjectId(post_id)})
    if not post:
        return {"status": "error", "message": "Post not found"}

    if user_id in post.get("likes", []):
        return {"status": "error", "message": "Already liked"}

    posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$push": {"likes": user_id}},
    )

    return {"status": "success", "message": "Post liked"}


# ---------------- UNLIKE POST ----------------
@router.post("/unlike/{post_id}")
def unlike_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = str(current_user["_id"])

    posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$pull": {"likes": user_id}},
    )

    return {"status": "success", "message": "Post unliked"}


# ---------------- ADD COMMENT ----------------
@router.post("/comment/{post_id}")
def add_comment(
    post_id: str,
    comment: str = Form(...),
    current_user: dict = Depends(get_current_user),
):
    post = posts.find_one({"_id": ObjectId(post_id)})
    if not post:
        return {"status": "error", "message": "Post not found"}

    new_comment = {
        "user_id": str(current_user["_id"]),
        "comment": comment,
        "timestamp": datetime.utcnow(),
    }

    posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$push": {"comments": new_comment}},
    )

    return {"status": "success", "comment": new_comment}
