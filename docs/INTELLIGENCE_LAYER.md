# Intelligence Layer

## Messy Inputs
- `comfort_concern`: free-text, varies wildly ("back pain", "uncomfortable at work", "posture", "sore shoulders")
- `budget_range`: inconsistent formats ("under 100", "$50-100", "100 to 200")
- `when_affected`: varied phrasing

## Auto-Structure Schema (stored on assessment row)
```json
{
  "parsed_concern": "posture",
  "parsed_timing": "all_day",
  "parsed_budget_min": 50,
  "parsed_budget_max": 100,
  "suggested_category_id": "uuid-here",
  "suggestion_source": "rule",
  "suggestion_confidence": 0.85,
  "review_status": "unreviewed"
}
```

## Events to Track
- assessment_started, assessment_completed, suggestion_shown, whatsapp_clicked, fitting_requested

## Scoring Rules (v1 — rule-based)
Each answer adds points to categories:
- comfort_concern contains keyword in `match_keywords` → +3 points
- `when_affected` matches category timing hint → +1 point
- budget within category range → +2 points
- preferred_category matches → +2 bonus

Highest score wins. Confidence = `top_score / max_possible_score`. If tie or top score < 3, confidence = 0.4 and mark for review.

## What Gets Ranked
- Product categories ranked by match score for each assessment
- Assessments ranked by lead quality for the distributor (later)

## v1 vs Later
- **v1:** Rule-based scoring only, deterministic, no API calls
- **Later:** LLM parses free-text concerns into structured tags; LLM generates personalised recommendation copy; lead-scoring model ranks assessments for follow-up priority