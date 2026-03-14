"""
Percolation Analysis of Promise Networks

Tests whether promise networks exhibit phase transitions (sudden fragmentation)
when promises are removed in order of failure severity.

Two networks analyzed:

1. Oregon HB 2021 — 20 promises, ~12 dependency edges
2. Anakin Cascade — 13 promises, ~10 dependency edges

Method: Iteratively remove promises (worst status first), compute the size of
the largest connected component at each step. If there's an inflection point,
that's the percolation threshold — the point where the network structurally
fragments rather than just degrades.

References:

- Barabási & Albert (1999). Emergence of scaling in random networks. Science.
- Albert, Jeong & Barabási (2000). Error and attack tolerance of complex networks. Nature.
- Stauffer & Aharony (1994). Introduction to Percolation Theory. CRC Press.
- Pastor-Satorras & Vespignani (2001). Epidemic spreading in scale-free networks. PRL.
"""

import json
from collections import deque

# ─── HB 2021 PROMISE NETWORK ───

# 20 promises, dependency edges inferred from legislative logic
# Source: promise-pipeline whitepaper v4, lib/data/hb2021.ts

hb2021_promises = [
    {"id": "P001", "body": "PGE: Reduce emissions 80% by 2030", "status": "degraded", "domain": "Emissions", "depends_on": ["P002", "P006"]},
    {"id": "P002", "body": "PGE: File clean energy plan with PUC", "status": "verified", "domain": "Planning", "depends_on": ["P016"]},
    {"id": "P003", "body": "PacifiCorp: File clean energy plan with PUC", "status": "violated", "domain": "Planning", "depends_on": ["P016"]},
    {"id": "P004", "body": "PacifiCorp: Reduce emissions 80% by 2030", "status": "violated", "domain": "Emissions", "depends_on": ["P003", "P006"]},
    {"id": "P005", "body": "All utilities: 100% clean electricity by 2040", "status": "declared", "domain": "Emissions", "depends_on": ["P001", "P004"]},
    {"id": "P006", "body": "DEQ: Verify emissions against baselines", "status": "verified", "domain": "Verification", "depends_on": []},
    {"id": "P007", "body": "PUC: Review and approve clean energy plans", "status": "degraded", "domain": "Planning", "depends_on": []},
    {"id": "P008", "body": "PUC: Enforce compliance with plan targets", "status": "degraded", "domain": "Verification", "depends_on": ["P007"]},
    {"id": "P009", "body": "Utilities: Report progress annually", "status": "verified", "domain": "Verification", "depends_on": []},
    {"id": "P010", "body": "Environmental justice community benefits", "status": "unverifiable", "domain": "Equity", "depends_on": ["P001"]},
    {"id": "P011", "body": "Energy burden protections for low-income", "status": "unverifiable", "domain": "Equity", "depends_on": ["P001"]},
    {"id": "P012", "body": "Community benefit agreements", "status": "unverifiable", "domain": "Equity", "depends_on": ["P001", "P004"]},
    {"id": "P013", "body": "Small utility exemptions and compliance paths", "status": "declared", "domain": "Planning", "depends_on": []},
    {"id": "P014", "body": "Cost cap: Rate increases limited to 6%", "status": "verified", "domain": "Affordability", "depends_on": []},
    {"id": "P015", "body": "Low-income bill assistance programs", "status": "degraded", "domain": "Affordability", "depends_on": ["P014"]},
    {"id": "P016", "body": "Tribal consultation in planning process", "status": "unverifiable", "domain": "Tribal", "depends_on": []},
    {"id": "P017", "body": "Tribal energy sovereignty provisions", "status": "unverifiable", "domain": "Tribal", "depends_on": ["P016"]},
    {"id": "P018", "body": "Clean energy workforce development", "status": "declared", "domain": "Workforce", "depends_on": ["P002", "P003"]},
    {"id": "P019", "body": "Labor standards for clean energy projects", "status": "declared", "domain": "Workforce", "depends_on": ["P018"]},
    {"id": "P020", "body": "Community workforce agreements", "status": "unverifiable", "domain": "Workforce", "depends_on": ["P018", "P019"]},
]

# ─── ANAKIN CASCADE PROMISE NETWORK ───

# 13 promises, dependency edges from case study analysis

anakin_promises = [
    {"id": "SW-001", "body": "I will train the boy", "status": "violated", "domain": "Training", "depends_on": []},
    {"id": "SW-002", "body": "I will train him, as I promised", "status": "degraded", "domain": "Training", "depends_on": ["SW-001"]},
    {"id": "SW-003", "body": "Jedi Code — No Attachments", "status": "violated", "domain": "Conduct", "depends_on": []},
    {"id": "SW-004", "body": "I don't like sand", "status": "declared", "domain": "Romance", "depends_on": []},
    {"id": "SW-005", "body": "Secret Marriage on Naboo", "status": "verified", "domain": "Romance", "depends_on": []},
    {"id": "SW-006", "body": "We will watch your career with great interest", "status": "verified", "domain": "Mentorship", "depends_on": []},
    {"id": "SW-007", "body": "I will not let that happen again", "status": "violated", "domain": "Protection", "depends_on": []},
    {"id": "SW-008", "body": "I can save her", "status": "unverifiable", "domain": "Protection", "depends_on": ["SW-007"]},
    {"id": "SW-009", "body": "Oath to the Jedi Order", "status": "violated", "domain": "Loyalty", "depends_on": ["SW-002", "SW-003"]},
    {"id": "SW-010", "body": "Order 66", "status": "verified", "domain": "Military", "depends_on": ["SW-008", "SW-009"]},
    {"id": "SW-011", "body": "I have the high ground", "status": "verified", "domain": "Safety", "depends_on": ["SW-009"]},
    {"id": "SW-012", "body": "The Chosen One will bring balance", "status": "violated", "domain": "Destiny", "depends_on": ["SW-001", "SW-002"]},
    {"id": "SW-013", "body": "Hello there", "status": "verified", "domain": "Conduct", "depends_on": []},
]

# ─── ANALYSIS FUNCTIONS ───

def build_undirected_adjacency(promises):
    """Build undirected adjacency list from depends_on edges.
    We use undirected because percolation measures connectivity,
    not directionality of dependency."""
    ids = {p["id"] for p in promises}
    adj = {p["id"]: set() for p in promises}
    for p in promises:
        for dep_id in p["depends_on"]:
            if dep_id in ids:
                adj[p["id"]].add(dep_id)
                adj[dep_id].add(p["id"])
    return adj


def largest_connected_component(adj, active_nodes):
    """BFS to find the largest connected component among active nodes."""
    if not active_nodes:
        return 0
    visited = set()
    max_size = 0
    for start in active_nodes:
        if start in visited:
            continue
        queue = deque([start])
        visited.add(start)
        component_size = 0
        while queue:
            node = queue.popleft()
            component_size += 1
            for neighbor in adj.get(node, set()):
                if neighbor in active_nodes and neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        max_size = max(max_size, component_size)
    return max_size


def count_components(adj, active_nodes):
    """Count total number of connected components among active nodes."""
    if not active_nodes:
        return 0
    visited = set()
    count = 0
    for start in active_nodes:
        if start in visited:
            continue
        count += 1
        queue = deque([start])
        visited.add(start)
        while queue:
            node = queue.popleft()
            for neighbor in adj.get(node, set()):
                if neighbor in active_nodes and neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
    return count


def removal_order(promises, mode="worst_first"):
    """
    Determine order of promise removal.
    - worst_first: violated → unverifiable → degraded → declared → verified
    - targeted: by reverse dependent count (most-depended-on first, like targeted attack)
    - random: shuffled (for comparison baseline)
    """
    status_priority = {
        "violated": 0,
        "unverifiable": 1,
        "degraded": 2,
        "declared": 3,
        "verified": 4,
    }

    if mode == "worst_first":
        return sorted(promises, key=lambda p: status_priority.get(p["status"], 5))
    elif mode == "targeted":
        dep_count = {p["id"]: 0 for p in promises}
        for p in promises:
            for dep_id in p["depends_on"]:
                if dep_id in dep_count:
                    dep_count[dep_id] += 1
        return sorted(promises, key=lambda p: -dep_count[p["id"]])
    elif mode == "random":
        import random
        shuffled = list(promises)
        random.seed(42)  # reproducible
        random.shuffle(shuffled)
        return shuffled
    else:
        return promises


def run_percolation(promises, mode="worst_first"):
    """
    Iteratively remove promises and track network metrics at each step.
    Returns list of dicts with metrics at each removal step.
    """
    adj = build_undirected_adjacency(promises)
    total = len(promises)
    ordered = removal_order(promises, mode)
    active = {p["id"] for p in promises}

    results = []

    # Initial state (nothing removed)
    lcc = largest_connected_component(adj, active)
    nc = count_components(adj, active)
    results.append({
        "step": 0,
        "removed": None,
        "removed_status": None,
        "removed_domain": None,
        "active_count": len(active),
        "active_fraction": len(active) / total,
        "lcc_size": lcc,
        "lcc_fraction": lcc / total,
        "num_components": nc,
    })

    for i, promise in enumerate(ordered):
        active.discard(promise["id"])
        lcc = largest_connected_component(adj, active)
        nc = count_components(adj, active)
        results.append({
            "step": i + 1,
            "removed": promise["id"],
            "removed_status": promise["status"],
            "removed_domain": promise["domain"],
            "active_count": len(active),
            "active_fraction": len(active) / total,
            "lcc_size": lcc,
            "lcc_fraction": lcc / total,
            "num_components": nc,
        })

    return results


def find_inflection(results):
    """
    Find the step with the largest single-step drop in LCC fraction.
    This is the approximate percolation threshold.
    """
    max_drop = 0
    inflection_step = None
    for i in range(1, len(results)):
        drop = results[i-1]["lcc_fraction"] - results[i]["lcc_fraction"]
        if drop > max_drop:
            max_drop = drop
            inflection_step = results[i]
    return inflection_step, max_drop


def print_results(name, results, mode):
    """Print formatted analysis results."""
    print(f"\n{'='*70}")
    print(f"  PERCOLATION ANALYSIS: {name}")
    print(f"  Removal mode: {mode}")
    print(f"{'='*70}\n")

    print(f"  {'Step':<6} {'Removed':<12} {'Status':<14} {'Domain':<16} {'Active':<8} {'LCC':<6} {'LCC%':<8} {'Components'}")
    print(f"  {'-'*6} {'-'*12} {'-'*14} {'-'*16} {'-'*8} {'-'*6} {'-'*8} {'-'*10}")

    for r in results:
        removed = r["removed"] or "(none)"
        status = r["removed_status"] or "-"
        domain = r["removed_domain"] or "-"
        print(f"  {r['step']:<6} {removed:<12} {status:<14} {domain:<16} {r['active_count']:<8} {r['lcc_size']:<6} {r['lcc_fraction']:<8.1%} {r['num_components']}")

    inflection, drop = find_inflection(results)
    if inflection:
        total = results[0]["active_count"]
        print(f"\n  INFLECTION POINT:")
        print(f"  Largest single-step LCC drop: {drop:.1%} at step {inflection['step']}")
        print(f"  Promise removed: {inflection['removed']} ({inflection['removed_status']}, {inflection['removed_domain']})")
        print(f"  Network at {inflection['active_fraction']:.0%} capacity ({inflection['active_count']}/{total} promises remaining)")
        print(f"  LCC dropped to {inflection['lcc_fraction']:.0%} of original network")
        print(f"  Components: {inflection['num_components']}")
    print()


def compute_network_stats(promises):
    """Compute basic network statistics."""
    adj = build_undirected_adjacency(promises)
    total = len(promises)
    total_edges = sum(len(v) for v in adj.values()) // 2  # undirected

    degrees = {pid: len(neighbors) for pid, neighbors in adj.items()}
    max_degree_node = max(degrees, key=degrees.get)
    max_degree = degrees[max_degree_node]
    avg_degree = sum(degrees.values()) / total
    isolated = sum(1 for d in degrees.values() if d == 0)

    status_counts = {}
    for p in promises:
        status_counts[p["status"]] = status_counts.get(p["status"], 0) + 1

    weights = {"verified": 100, "declared": 60, "degraded": 30, "violated": 0, "unverifiable": 20}
    health = sum(weights[p["status"]] for p in promises) / total

    return {
        "total_nodes": total,
        "total_edges": total_edges,
        "avg_degree": avg_degree,
        "max_degree": max_degree,
        "max_degree_node": max_degree_node,
        "isolated_nodes": isolated,
        "status_counts": status_counts,
        "health_score": health,
        "degrees": degrees,
    }


def print_network_stats(name, promises):
    """Print network statistics."""
    stats = compute_network_stats(promises)
    print(f"\n  NETWORK STATISTICS: {name}")
    print(f"  {'-'*40}")
    print(f"  Nodes: {stats['total_nodes']}")
    print(f"  Edges: {stats['total_edges']}")
    print(f"  Avg degree: {stats['avg_degree']:.2f}")
    print(f"  Max degree: {stats['max_degree']} ({stats['max_degree_node']})")
    print(f"  Isolated nodes: {stats['isolated_nodes']}")
    print(f"  Health score: {stats['health_score']:.1f}/100")
    print(f"  Status breakdown: {stats['status_counts']}")

    print(f"\n  Degree distribution:")
    for pid, deg in sorted(stats["degrees"].items(), key=lambda x: -x[1]):
        p = next(p for p in promises if p["id"] == pid)
        bar = "█" * deg
        print(f"    {pid:<8} {deg:<3} {bar:<20} ({p['status']}, {p['domain']})")


# ─── RUN ANALYSIS ───

if __name__ == "__main__":
    print("\n" + "█" * 70)
    print("  PERCOLATION ANALYSIS OF PROMISE NETWORKS")
    print("  Testing for phase transitions in commitment infrastructure")
    print("█" * 70)

    # Network stats
    print_network_stats("Oregon HB 2021", hb2021_promises)
    print_network_stats("Anakin Cascade", anakin_promises)

    # HB 2021 — three removal modes
    for mode in ["worst_first", "targeted", "random"]:
        results = run_percolation(hb2021_promises, mode)
        print_results("Oregon HB 2021", results, mode)

    # Anakin — three removal modes
    for mode in ["worst_first", "targeted", "random"]:
        results = run_percolation(anakin_promises, mode)
        print_results("Anakin Cascade", results, mode)

    # ─── COMPARATIVE SUMMARY ───
    print("\n" + "=" * 70)
    print("  COMPARATIVE SUMMARY")
    print("=" * 70)

    for name, promises in [("HB 2021", hb2021_promises), ("Anakin", anakin_promises)]:
        print(f"\n  {name}:")
        for mode in ["worst_first", "targeted", "random"]:
            results = run_percolation(promises, mode)
            inflection, drop = find_inflection(results)
            if inflection:
                print(f"    {mode:<14} — inflection at step {inflection['step']}, "
                      f"LCC drop {drop:.1%}, "
                      f"network at {inflection['active_fraction']:.0%} capacity")

    # ─── KEY FINDING ───
    print(f"\n{'='*70}")
    print("  KEY QUESTION: Do these networks exhibit phase transitions,")
    print("  or do they degrade gradually?")
    print(f"{'='*70}")

    hb_results = run_percolation(hb2021_promises, "worst_first")
    ak_results = run_percolation(anakin_promises, "worst_first")

    hb_inf, hb_drop = find_inflection(hb_results)
    ak_inf, ak_drop = find_inflection(ak_results)

    print(f"\n  HB 2021: Largest LCC drop = {hb_drop:.1%} at step {hb_inf['step']}")
    print(f"           (removing {hb_inf['removed']}: {hb_inf['removed_domain']})")
    print(f"  Anakin:  Largest LCC drop = {ak_drop:.1%} at step {ak_inf['step']}")
    print(f"           (removing {ak_inf['removed']}: {ak_inf['removed_domain']})")

    if hb_drop > 0.15 or ak_drop > 0.15:
        print(f"\n  FINDING: At least one network shows a >15% single-step LCC drop.")
        print(f"  This suggests a phase transition — not gradual degradation.")
        print(f"  The percolation concept applies.")
    else:
        print(f"\n  FINDING: Neither network shows a dramatic phase transition.")
        print(f"  On graphs this small ({len(hb2021_promises)}-{len(anakin_promises)} nodes),")
        print(f"  degradation is more gradual. The percolation concept may be more")
        print(f"  useful on larger networks (50+ promises) from the annotation pipeline.")

    print()
