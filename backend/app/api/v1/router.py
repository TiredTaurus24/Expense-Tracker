from fastapi import APIRouter
from app.api.v1 import auth, homes

router = APIRouter()

# Include auth routes
router.include_router(auth.router)
# Include homes routes
router.include_router(homes.router)
