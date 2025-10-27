# Trim Ordering Automation - API Specification

## Overview

This document describes the RESTful API endpoints for the Trim Ordering Automation system.

**Base URL**: `https://api.example.com/v1`

**Authentication**: API Key passed in `X-API-Key` header

**Content-Type**: `application/json`

---

## Endpoints

### Health Check

#### GET /health

Check system health status.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "up",
    "redis": "up",
    "message_queue": "up"
  }
}
```

---

### Workflow Management

#### POST /workflows/trigger

Trigger a new trim ordering workflow.

**Request Body**:
```json
{
  "po_id": "PO-2024-001",
  "workflow_type": "standard",
  "priority": "normal",
  "options": {
    "skip_validation": false,
    "manual_review_required": false
  }
}
```

**Response**:
```json
{
  "workflow_id": "wf-abc123",
  "status": "started",
  "po_id": "PO-2024-001",
  "estimated_completion": "2024-01-15T11:00:00Z"
}
```

**Status Codes**:
- `200 OK`: Workflow started successfully
- `400 Bad Request`: Invalid request body
- `409 Conflict`: Workflow already exists for this PO
- `500 Internal Server Error`: System error

---

#### GET /workflows/{workflow_id}

Get workflow status and details.

**Response**:
```json
{
  "workflow_id": "wf-abc123",
  "po_id": "PO-2024-001",
  "status": "processing",
  "current_step": "tech_pack_analysis",
  "progress": 65,
  "started_at": "2024-01-15T10:30:00Z",
  "estimated_completion": "2024-01-15T11:00:00Z",
  "steps": [
    {
      "name": "data_collection",
      "status": "completed",
      "completed_at": "2024-01-15T10:31:00Z"
    },
    {
      "name": "data_processing",
      "status": "completed",
      "completed_at": "2024-01-15T10:32:00Z"
    },
    {
      "name": "tech_pack_analysis",
      "status": "in_progress",
      "started_at": "2024-01-15T10:33:00Z"
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Workflow found
- `404 Not Found`: Workflow not found

---

#### GET /workflows

List all workflows with optional filters.

**Query Parameters**:
- `status` (optional): Filter by status (pending, processing, completed, failed)
- `po_id` (optional): Filter by PO ID
- `date_from` (optional): Filter by start date (ISO 8601)
- `date_to` (optional): Filter by end date (ISO 8601)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 50)

**Response**:
```json
{
  "total": 150,
  "page": 1,
  "limit": 50,
  "workflows": [
    {
      "workflow_id": "wf-abc123",
      "po_id": "PO-2024-001",
      "status": "completed",
      "started_at": "2024-01-15T10:30:00Z",
      "completed_at": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

#### DELETE /workflows/{workflow_id}

Cancel a running workflow.

**Response**:
```json
{
  "workflow_id": "wf-abc123",
  "status": "cancelled",
  "cancelled_at": "2024-01-15T10:35:00Z"
}
```

---

### Data Collection

#### POST /data/collect

Manually trigger data collection for a PO.

**Request Body**:
```json
{
  "po_id": "PO-2024-001",
  "sources": ["ng_system", "tech_packs", "po_files"]
}
```

**Response**:
```json
{
  "collection_id": "col-xyz789",
  "status": "started",
  "po_id": "PO-2024-001",
  "sources": ["ng_system", "tech_packs", "po_files"]
}
```

---

#### GET /data/collect/{collection_id}

Get collection status and results.

**Response**:
```json
{
  "collection_id": "col-xyz789",
  "status": "completed",
  "po_id": "PO-2024-001",
  "results": {
    "ng_system": {
      "status": "success",
      "records_found": 25,
      "collected_at": "2024-01-15T10:30:00Z"
    },
    "tech_packs": {
      "status": "success",
      "files_downloaded": 5,
      "collected_at": "2024-01-15T10:31:00Z"
    },
    "po_files": {
      "status": "success",
      "files_processed": 3,
      "collected_at": "2024-01-15T10:32:00Z"
    }
  }
}
```

---

### Processing Status

#### GET /process/{po_id}/status

Get processing status for a specific PO.

**Response**:
```json
{
  "po_id": "PO-2024-001",
  "status": "processing",
  "stage": "tech_pack_analysis",
  "progress": {
    "total_steps": 7,
    "completed_steps": 4,
    "percentage": 57
  },
  "data_summary": {
    "styles_processed": 10,
    "total_components": 45,
    "components_with_errors": 2
  }
}
```

---

#### GET /process/{po_id}/components

Get all components extracted for a PO.

**Response**:
```json
{
  "po_id": "PO-2024-001",
  "total_components": 45,
  "components": [
    {
      "id": "comp-001",
      "style_number": "ST-2024-ABC",
      "component_type": "main_label",
      "material": "cotton",
      "color": "black",
      "quantity": 1000,
      "supplier": "Label Co.",
      "status": "valid",
      "extracted_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

---

### Tech Pack Operations

#### POST /techpacks/analyze

Trigger tech pack analysis.

**Request Body**:
```json
{
  "po_id": "PO-2024-001",
  "style_numbers": ["ST-2024-ABC", "ST-2024-DEF"],
  "options": {
    "use_ocr": true,
    "extract_logos": true,
    "extract_colors": true
  }
}
```

**Response**:
```json
{
  "analysis_id": "analyze-123",
  "status": "started",
  "style_numbers": ["ST-2024-ABC", "ST-2024-DEF"]
}
```

---

#### GET /techpacks/analyze/{analysis_id}

Get analysis results.

**Response**:
```json
{
  "analysis_id": "analyze-123",
  "status": "completed",
  "styles": [
    {
      "style_number": "ST-2024-ABC",
      "materials": ["cotton", "polyester"],
      "logos": [{"type": "embroidered", "color": "black"}],
      "colors": ["black", "white"],
      "main_label": {
        "type": "woven",
        "color": "black",
        "text": "BRAND NAME"
      },
      "care_labels": [
        {
          "code": "CARE001",
          "supplier": "Care Label Inc.",
          "type": "sewn-in"
        }
      ],
      "hangtags": [
        {
          "code": "HTAG001",
          "supplier": "Tag Supplier Co.",
          "type": "string"
        }
      ]
    }
  ]
}
```

---

### Validation

#### POST /validate

Validate trim data.

**Request Body**:
```json
{
  "po_id": "PO-2024-001",
  "validation_type": "full",
  "rules": ["check_fees", "check_buy_file", "validate_suppliers"]
}
```

**Response**:
```json
{
  "validation_id": "val-456",
  "status": "completed",
  "po_id": "PO-2024-001",
  "results": {
    "fees_check": {
      "status": "passed",
      "fees_found": 0
    },
    "buy_file_check": {
      "status": "passed",
      "buy_file_applicable": false
    },
    "supplier_validation": {
      "status": "passed",
      "suppliers_validated": 5
    }
  },
  "errors": [],
  "warnings": [
    {
      "field": "quantity",
      "message": "Large quantity detected - please verify"
    }
  ]
}
```

---

### Allowance Calculation

#### POST /allowances/calculate

Calculate allowances for components.

**Request Body**:
```json
{
  "po_id": "PO-2024-001",
  "components": [
    {
      "style_number": "ST-2024-ABC",
      "component_type": "main_label",
      "base_quantity": 1000,
      "material": "cotton"
    }
  ]
}
```

**Response**:
```json
{
  "calculation_id": "calc-789",
  "po_id": "PO-2024-001",
  "allowances": [
    {
      "component_type": "main_label",
      "base_quantity": 1000,
      "allowance_factor": 1.05,
      "final_quantity": 1050,
      "reason": "Standard 5% waste allowance"
    }
  ],
  "calculation_rules": {
    "waste_allowance": "5%",
    "season_factor": "none",
    "historical_adjustment": "none"
  }
}
```

---

### Pivot Integration

#### POST /pbot/generate

Generate Pivot entries.

**Request Body**:
```json
{
  "po_id": "PO-2024-001",
  "style_numbers": ["ST-2024-ABC"],
  "auto_submit": false
}
```

**Response**:
```json
{
  "generation_id": "pbot-gen-123",
  "status": "completed",
  "po_id": "PO-2024-001",
  "entries": [
    {
      "entry_id": "pbot-entry-001",
      "style_number": "ST-2024-ABC",
      "supplier": "Label Co.",
      "components": ["main_label", "care_label"],
      "total_quantity": 1050,
      "status": "ready",
      "submitted": false
    }
  ]
}
```

---

#### POST /pbot/submit

Submit Pivot entries to Pivot system.

**Request Body**:
```json
{
  "po_id": "PO-2024-001",
  "entry_ids": ["pbot-entry-001"]
}
```

**Response**:
```json
{
  "submission_id": "submit-abc",
  "status": "completed",
  "entries": [
    {
      "entry_id": "pbot-entry-001",
      "submission_status": "success",
      "pbot_order_id": "Pivot-2024-001",
      "submitted_at": "2024-01-15T11:00:00Z"
    }
  ],
  "failures": []
}
```

---

#### GET /pbot/{order_id}

Get Pivot order details.

**Response**:
```json
{
  "pbot_order_id": "Pivot-2024-001",
  "entry_id": "pbot-entry-001",
  "status": "processing",
  "details": {
    "supplier": "Label Co.",
    "style_number": "ST-2024-ABC",
    "quantity": 1050,
    "expected_delivery": "2024-02-01"
  },
  "timeline": [
    {
      "event": "created",
      "timestamp": "2024-01-15T11:00:00Z"
    },
    {
      "event": "confirmed",
      "timestamp": "2024-01-15T11:05:00Z"
    }
  ]
}
```

---

### Reports

#### GET /reports/summary

Get summary report.

**Query Parameters**:
- `start_date` (required): Start date (ISO 8601)
- `end_date` (required): End date (ISO 8601)

**Response**:
```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "summary": {
    "total_pos_processed": 150,
    "total_components": 6750,
    "total_pbot_entries": 320,
    "automation_rate": 95.5,
    "error_rate": 1.2
  },
  "by_status": {
    "completed": 142,
    "failed": 5,
    "pending": 3
  },
  "top_suppliers": [
    {
      "supplier": "Label Co.",
      "orders": 45
    }
  ]
}
```

---

#### GET /reports/errors

Get error report.

**Query Parameters**:
- `start_date` (optional): Start date
- `end_date` (optional): End date
- `severity` (optional): Filter by severity (critical, error, warning)

**Response**:
```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "total_errors": 25,
  "errors": [
    {
      "error_id": "err-001",
      "timestamp": "2024-01-15T10:30:00Z",
      "severity": "error",
      "po_id": "PO-2024-001",
      "workflow_id": "wf-abc123",
      "error_type": "tech_pack_parsing_failed",
      "message": "Unable to extract logo information",
      "details": {
        "tech_pack_path": "/techpacks/ST-2024-ABC.pdf",
        "page_number": 5
      }
    }
  ]
}
```

---

### Manual Override

#### POST /manual/override

Create manual override for a component.

**Request Body**:
```json
{
  "po_id": "PO-2024-001",
  "component_id": "comp-001",
  "override_data": {
    "quantity": 1200,
    "supplier": "Custom Supplier Co."
  },
  "reason": "Customer requested custom supplier",
  "approved_by": "user@example.com"
}
```

**Response**:
```json
{
  "override_id": "ovr-123",
  "status": "created",
  "component_id": "comp-001",
  "changes": {
    "quantity": 1200,
    "supplier": "Custom Supplier Co."
  },
  "approved_by": "user@example.com"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "specific field name if applicable",
      "value": "invalid value if applicable"
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Request body is invalid |
| `UNAUTHORIZED` | 401 | Authentication failed |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `VALIDATION_ERROR` | 422 | Data validation failed |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | External service unavailable |

---

## Rate Limiting

- **Rate Limit**: 1000 requests per hour per API key
- **Headers**: Rate limit information is included in response headers
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current period
  - `X-RateLimit-Reset`: Timestamp when limit resets

---

## Webhooks

Subscribe to workflow events via webhooks.

### Webhook Payload Format

```json
{
  "event_type": "workflow.completed",
  "timestamp": "2024-01-15T11:00:00Z",
  "data": {
    "workflow_id": "wf-abc123",
    "po_id": "PO-2024-001",
    "status": "completed"
  }
}
```

### Available Events

- `workflow.started`
- `workflow.completed`
- `workflow.failed`
- `pbot.submitted`
- `validation.failed`
- `error.critical`

---

## SDK Examples

### Python

```python
from trim_automation import Client

client = Client(api_key="your-api-key")

# Trigger workflow
workflow = client.workflows.trigger(
    po_id="PO-2024-001",
    workflow_type="standard"
)

# Check status
status = client.workflows.get(workflow.workflow_id)

# Get components
components = client.process.get_components("PO-2024-001")
```

---

## Authentication

### API Key Authentication

Include your API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" \
     https://api.example.com/v1/health
```

### OAuth 2.0 (Future)

OAuth 2.0 support is planned for future releases.

---

## Versioning

API version is specified in the URL path: `/v1/...`

Breaking changes will result in a new version (e.g., `/v2/...`).

---

## Pagination

List endpoints support pagination with `page` and `limit` parameters.

**Example**:
```
GET /workflows?page=2&limit=20
```

Response includes pagination metadata:
```json
{
  "total": 150,
  "page": 2,
  "limit": 20,
  "total_pages": 8,
  "data": [...]
}
```

