# Data Model

## product_categories
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| name | text | e.g. "Everyday Support Wear" |
| description | text | Short blurb |
| match_keywords | text[] | Keywords from answers that map here |
| budget_min | numeric | Lower budget bound |
| budget_max | numeric | Upper budget bound |
| created_at | timestamptz | default now() |

## assessments
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | nullable (for future owner-scoping) |
| customer_name | text | Required |
| whatsapp_number | text | Required, SG format |
| comfort_concern | text | Free text — main concern |
| when_affected | text | e.g. "all day", "mornings", "after work" |
| preferred_category_id | uuid | FK → product_categories (nullable) |
| budget_range | text | e.g. "$50-$100" |
| suggested_category_id | uuid | FK → product_categories (AI/rule output) |
| suggestion_source | text | "rule" or "ai" |
| suggestion_confidence | numeric | 0–1 |
| review_status | text | default 'unreviewed' |
| preferred_next_step | text | "whatsapp" or "fitting" |
| fitting_preferred_time | text | nullable |
| created_at | timestamptz | default now() |

### AI Fields (assessments)
- `suggested_category_id` → **value**
- `suggestion_source` → **source** ("rule" / "ai")
- `suggestion_confidence` → **confidence** (0–1)
- `review_status` → default 'unreviewed'

### Relationships
- `assessments.preferred_category_id` → `product_categories.id`
- `assessments.suggested_category_id` → `product_categories.id`

### RLS / Permissions
- v1 (demo): permissive read/write on both tables (no login required)
- Lock-down sprint: replace with `auth.uid() = user_id` owner policies; admin reads via service role only