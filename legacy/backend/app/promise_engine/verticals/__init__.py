"""Promise Engine Verticals - Promise schemas for different business domains.

Available verticals:
- codec: Commerce/subscription management (coffee roaster subscriptions)
- hb2021: Oregon HB 2021 clean energy law accountability
"""

from app.promise_engine.verticals.codec import CODEC_SCHEMAS
from app.promise_engine.verticals.hb2021 import HB2021_SCHEMAS

ALL_SCHEMAS = {
    **CODEC_SCHEMAS,
    **HB2021_SCHEMAS,
}
