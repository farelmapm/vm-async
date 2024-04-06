from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from vm.router import router as vm_router

app = FastAPI()

app.include_router(vm_router, prefix="/api/vm")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/")
async def main():
    return {"message": "Hello World"}