import asyncio

AGENT_SCRIPTS = {
    "zoning": [
        (2, "Geocoding address against DC GIS..."),
        (3, "Checking use classification in MU-4 zone..."),
        (3, "Reviewing height and setback compliance..."),
        (2, "Checking outdoor seating public space requirements..."),
        (2, "Verifying historic overlay status..."),
        (1, "Complete"),
    ],
    "building": [
        (3, "Parsing architectural plans..."),
        (4, "Calculating occupant load per IBC Table 1004.5..."),
        (4, "Checking egress capacity and travel distances..."),
        (3, "Verifying construction type classification..."),
        (2, "Reviewing means of egress requirements..."),
        (1, "Complete"),
    ],
    "fire": [
        (3, "Reading fire protection plans..."),
        (4, "Checking fire extinguisher coverage areas..."),
        (4, "Reviewing kitchen hood suppression requirements..."),
        (3, "Verifying exit signage locations..."),
        (2, "Checking sprinkler system requirements..."),
        (1, "Complete"),
    ],
    "ada": [
        (3, "Reading door schedule on Sheet A7..."),
        (5, "Measuring door clear widths against ADA Section 404.2.3..."),
        (4, "Checking accessible parking count..."),
        (4, "Reviewing service counter heights..."),
        (2, "Checking restroom turning radius..."),
        (1, "Complete"),
    ],
}

PROGRESS_STORE: dict = {}


async def simulate_demo_review(app_id: str):
    PROGRESS_STORE[app_id] = {
        "status": "running",
        "started_at": __import__("datetime").datetime.utcnow().isoformat(),
        "agents": {
            dept: {
                "status": "running",
                "checks_complete": 0,
                "checks_total": len(steps),
                "current_action": steps[0][1],
            }
            for dept, steps in AGENT_SCRIPTS.items()
        },
    }

    async def run_agent(dept_id: str, steps: list):
        for i, (delay, message) in enumerate(steps):
            await asyncio.sleep(delay)
            is_last = i == len(steps) - 1
            PROGRESS_STORE[app_id]["agents"][dept_id] = {
                "status": "complete" if is_last else "running",
                "checks_complete": i + 1,
                "checks_total": len(steps),
                "current_action": message,
            }

    await asyncio.gather(*[run_agent(dept, steps) for dept, steps in AGENT_SCRIPTS.items()])
    PROGRESS_STORE[app_id]["status"] = "complete"
