from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.coverage_explainer import get_coverage_explanation

router = APIRouter()


class CoverageRequest(BaseModel):
    insurance_status: str
    age_range: Optional[str] = None
    case_id: Optional[str] = None


@router.post("/coverage/explain")
async def explain_coverage(req: CoverageRequest):
    return get_coverage_explanation(
        insurance_status=req.insurance_status,
        age_range=req.age_range or "",
    )
