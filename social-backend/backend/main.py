print(">>> backend.main LOADED <<<")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, posts, users, performance, wellness, coaching, injury, matches
from fastapi.security import HTTPBearer
from fastapi.openapi.utils import get_openapi


app = FastAPI(title="Football Social Platform API")
origins = [
    "http://localhost:3000",        # if testing on web
    "http://127.0.0.1:3000",        # if testing on web
    "exp://192.168.1.9:8081",      # your Expo frontend
    "*",                            # optional: allow all (for dev)
]



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # frontend can connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(performance.router)
app.include_router(wellness.router)
app.include_router(coaching.router)
app.include_router(injury.router)
app.include_router(matches.router)


@app.get("/")
def home():
    return {"message": "API running successfully!"}

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Football Social Backend",
        version="1.0.0",
        description="API for Football Social App",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    # Apply BearerAuth globally to all routes
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

