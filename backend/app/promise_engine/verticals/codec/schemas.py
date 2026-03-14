"""CODEC Promise Schemas - Definitions for commerce-related promises.

These schemas enable automatic verification of configuration validity,
timeline commitments, and payment integrity for subscription platforms.

First schema: Grind-Roast Compatibility
- Validates that grind size matches roast level
- Prevents customer frustration from incompatible configurations
- Generates training data: "espresso roast requires fine grind"
"""

from app.promise_engine.core.models import PromiseSchema


# ============================================================
# GRIND-ROAST COMPATIBILITY
# ============================================================

GRIND_ROAST_COMPATIBILITY = PromiseSchema(
    id="codec.grind_roast_compatibility",
    version=1,
    vertical="codec",
    name="Grind-Roast Compatibility",
    description=(
        "Platform promises that grind size options are appropriate for roast level. "
        "Prevents invalid configurations that lead to poor brew quality and customer dissatisfaction."
    ),
    commitment_type="configuration_validity",
    stakes="low",
    schema_json={
        "type": "object",
        "properties": {
            "roast": {
                "type": "string",
                "enum": ["espresso", "light", "medium", "dark", "french"]
            },
            "grind": {
                "type": "string",
                "enum": [
                    "whole_bean", "extra-fine", "fine", "medium-fine",
                    "medium", "medium-coarse", "coarse", "french_press",
                ]
            }
        },
        "required": ["roast", "grind"]
    },
    verification_type="automatic",
    verification_rules={
        "rules": [
            {
                "if": {"roast": "espresso"},
                "then": {
                    "grind": {
                        "enum": ["whole_bean", "extra-fine", "fine"],
                        "reason": "Espresso requires fine grind for proper extraction under pressure"
                    }
                }
            },
            {
                "if": {"roast": "light"},
                "then": {
                    "grind": {
                        "enum": ["whole_bean", "fine", "medium-fine", "medium"],
                        "reason": "Light roasts need finer grind to extract delicate flavors"
                    }
                }
            },
            {
                "if": {"roast": "medium"},
                "then": {
                    "grind": {
                        "enum": ["whole_bean", "fine", "medium-fine", "medium", "medium-coarse"],
                        "reason": "Medium roasts are versatile and work with most grind sizes"
                    }
                }
            },
            {
                "if": {"roast": "dark"},
                "then": {
                    "grind": {
                        "enum": ["whole_bean", "medium", "medium-coarse", "coarse"],
                        "reason": "Dark roasts are more soluble and prefer coarser grinds"
                    }
                }
            },
            {
                "if": {"roast": "french"},
                "then": {
                    "grind": {
                        "enum": ["whole_bean", "coarse", "french_press"],
                        "reason": "French roast is very dark and requires coarse grind to avoid bitterness"
                    }
                }
            }
        ]
    },
    training_eligible=True,
    domain_tags=["coffee", "configuration", "quality_control"]
)


# ============================================================
# REGISTRY
# ============================================================

CODEC_SCHEMAS = {
    "codec.grind_roast_compatibility": GRIND_ROAST_COMPATIBILITY,
}
