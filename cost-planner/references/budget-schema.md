# Budget Schema Reference

Load this reference when implementing or discussing a concrete runtime/UI interface for cost planning.

## Minimal Schema

```json
{
  "mode": "standard",
  "summary": {
    "time_range_seconds": [240, 480],
    "token_range": [20000, 45000],
    "confidence": "medium",
    "uncertainties": [
      "Repository size is not known yet",
      "Test command duration is unknown"
    ]
  },
  "steps": [
    {
      "id": "inspect",
      "label": "Inspect related files",
      "time_range_seconds": [30, 90],
      "token_range": [3000, 12000],
      "confidence": "medium",
      "cost_drivers": ["rg output", "file reads"],
      "high_cost_gate": false
    },
    {
      "id": "verify",
      "label": "Run targeted tests",
      "time_range_seconds": [60, 300],
      "token_range": [1000, 8000],
      "confidence": "low",
      "cost_drivers": ["test duration", "test logs"],
      "high_cost_gate": true
    }
  ],
  "modes": {
    "quick": {
      "time_range_seconds": [60, 180],
      "token_range": [5000, 15000],
      "tradeoff": "Narrow inspection and minimal verification"
    },
    "standard": {
      "time_range_seconds": [240, 480],
      "token_range": [20000, 45000],
      "tradeoff": "Balanced inspection, edit, and targeted verification"
    },
    "thorough": {
      "time_range_seconds": [600, 1500],
      "token_range": [60000, 120000],
      "tradeoff": "Broader search, stronger verification, and more edge cases"
    }
  }
}
```

## Event Model

Use these event types if adding telemetry:

- `budget.estimated`: emitted after the initial plan.
- `budget.revised`: emitted after new evidence changes the estimate.
- `budget.gate`: emitted before a high-cost action.
- `budget.actuals`: emitted at task completion.

Each event should include:

- `task_id`
- `timestamp`
- `mode`
- `time_range_seconds` or elapsed seconds
- `token_range` or actual tokens if available
- `confidence`
- `reason`

## High-Cost Gate Criteria

Gate or visibly announce actions that are expected to exceed one of:

- More than 5 minutes of wall-clock time.
- More than 30k additional tokens.
- Full repository or whole-application analysis.
- Full test suites, e2e suites, CI waits, deploys, or browser QA across multiple pages.
- Network dependency installation or large artifact generation.

## Actuals Summary

At completion, prefer:

```json
{
  "elapsed_seconds": 372,
  "actual_tokens": null,
  "actual_tokens_available": false,
  "estimate_quality": "within_range",
  "main_delta_reason": "targeted tests were slower than expected"
}
```

If token actuals are unavailable, do not invent them. Report that the runtime did not expose metered usage.
