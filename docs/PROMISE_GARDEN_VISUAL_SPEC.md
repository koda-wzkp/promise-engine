# Promise Garden Visual Spec — Goals as Factory Trees

*March 2026 — Promise Factory extension*

When a user creates a goal (a `PersonalGoal` / `PromiseFactory`), it renders as the dominant plant in its domain cluster. Factory trees are visually distinct from regular plants.

## Size

Always rendered at the maximum height for the `long` duration tier, regardless of the domain's other plants. A goal is the tallest thing in its area.

## Trunk

1.5× the normal trunk width. Thicker base suggests permanence and structural importance.

## Canopy

Density and color are computed from `computeFactoryProgress()`, not from direct check-ins. As children are verified, the canopy fills in. As children fail, the canopy thins.

## Fruit / Pods

Each child promise is represented as a small fruit or seed pod visible on the tree's branches. The number of pods = the number of children. Pod color encodes child status:

- **Verified child** → ripe fruit in the domain's accent color (red for health, etc.)
- **Degraded child** → amber/unripe
- **Declared child** → small green bud
- **Violated child** → grey, slightly drooping

This means a user can glance at a goal tree and count the ripe fruit to see their progress. Five pods, three ripe, one amber, one grey = "I'm keeping 3 of 5 sub-promises, one is slipping, one I broke."

## Root Connections

Factory-to-child roots are thicker (3px vs 2px) and radiate outward in a star pattern from the factory's root ball. Root color reflects the child's health, not the factory's. When a child degrades, its root to the factory pulses amber — the upward cascade made visible as stress traveling toward the parent tree.

## Child Plant Placement

Children cluster around the base of the factory tree, within its canopy shadow. Auto-placement positions them in an arc around the trunk, ordered by creation date. Children that are ground cover (low-stakes, short-duration) fill the space immediately around the trunk. Children that are shrubs stand slightly further out.

## Interaction

Tapping a factory tree opens a detail card that shows:

- The goal body
- Computed progress (from children)
- Computed status
- List of child promises with individual status badges
- "Add a sub-promise" button (quick-add a new child)
- Completion condition display: "3 of 5 kept. Goal needs 4 of 5."

## Civic Dashboard: Factory Trees in Network Views

In the procedural Canvas renderers (Watershed, Canopy, Strata), promise factories render as larger versions of the standard node form:

- **Watershed:** Factory nodes are larger pools with visible tributaries (one per child) flowing into them. The pool's water clarity is the aggregate of children's channel capacities.
- **Canopy:** Factory nodes are the tallest trees with visible fruit pods on branches. Children cluster as smaller trees at the base.
- **Strata:** Factory nodes are wider mineral blocks spanning more of the domain band. Children are smaller blocks connected by thicker fault lines.

In all views, factory-to-child edges are rendered 1.5× thicker than standard dependency edges and use a distinct root/tributary visual style rather than the standard edge style.
