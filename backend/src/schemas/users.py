from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True
