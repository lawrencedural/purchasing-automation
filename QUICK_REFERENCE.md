# Trim Ordering Automation - Quick Reference Guide

## 📊 System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Web Portal  │  │  Mobile App  │  │  API Clients │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │  (Auth & Route) │
                    └────────┬────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                   ORCHESTRATION LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Workflow Orchestrator (Airflow)                  │  │
│  │  • Schedule & coordinate workflows                      │  │
│  │  • Error handling & retries                            │  │
│  │  • Monitor execution                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                    CORE SERVICES LAYER                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │   Data    │ │  Process   │ │  Extract   │ │  Analyze   │  │
│  │ Collection│ │   Service  │ │  Service   │ │   Service  │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                 │
│  │ Validate  │ │ Calculate  │ │  Generate  │                 │
│  │  Service  │ │ Allowances │ │  Pivot     │                 │
│  └────────────┘ └────────────┘ └────────────┘                 │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │PostgreSQL│  │  Redis   │  │RabbitMQ  │  │ S3/Blob  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                     EXTERNAL SYSTEMS                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ NG System│  │ Tech Packs│ │ Pivot API │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Workflow Steps

### Complete Automated Flow

```
Step 1: Initial Checks
├─ Check for fees or cuts
└─ Evaluate "buy-file" option
    ↓
Step 2: Data Collection
├─ Connect to NG system
├─ Download PO line delivery schedule
├─ Fetch style information
└─ Download tech pack files
    ↓
Step 3: Data Processing
├─ Filter relevant data
├─ Normalize format
├─ Remove duplicates
└─ Extract buyer style numbers
    ↓
Step 4: Component Extraction
├─ Identify trim components
├─ Parse style numbers
├─ Extract supplier information
└─ Categorize by type
    ↓
Step 5: Tech Pack Analysis
├─ Parse PDF using OCR
├─ Extract materials
├─ Identify logos and colors
├─ Extract main label details
├─ Find care labels (codes & suppliers)
└─ Find hangtags (codes & suppliers)
    ↓
Step 6: Validation
├─ Validate all extracted data
├─ Check for missing information
├─ Verify supplier credentials
└─ Flag errors for review
    ↓
Step 7: Allowance Calculation
├─ Apply business rules
├─ Calculate waste factors
├─ Consider historical data
└─ Generate final quantities
    ↓
Step 8: Pivot Generation
├─ Build entry structure
├─ Format according to spec
├─ Submit to Pivot system
└─ Track submission status
```

---

## 🎯 Key Services & Responsibilities

| Service | Primary Responsibility | Technology |
|---------|----------------------|------------|
| **Data Collection** | Fetch from NG & tech packs | PostgreSQL, psycopg2 |
| **Data Processing** | Clean & normalize | Pandas |
| **Extraction** | Extract components | Regex, NLP |
| **Tech Pack Analyzer** | Parse PDFs & extract info | OCR, ML |
| **Validation** | Validate data quality | Business Rules |
| **Allowance Calculator** | Calculate allowances | ML, Business Logic |
| **Pivot Generator** | Create & submit entries | HTTP Client |
| **Orchestrator** | Coordinate all services | Airflow |

---

## 💻 Technology Stack Summary

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL 15+
- **Cache**: Redis
- **Queue**: RabbitMQ
- **Orchestration**: Apache Airflow

### ML & AI
- **OCR**: Tesseract, AWS Textract
- **NLP**: spaCy
- **ML**: scikit-learn, PyTorch

### Infrastructure
- **Containers**: Docker
- **Orchestration**: Kubernetes
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

### Cloud (Option)
- **AWS**: S3, RDS, SageMaker
- **Azure**: Blob Storage, SQL Database
- **GCP**: Cloud Storage, BigQuery

---

## 📈 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Automation Rate | 95%+ | To be measured |
| Processing Time | < 2 hours | To be measured |
| Error Rate | < 2% | To be measured |
| Data Accuracy | 98%+ | To be measured |
| Throughput | 500+ orders/day | To be measured |

---

## 🔐 Security Checklist

- [ ] API authentication (API keys)
- [ ] Database encryption at rest
- [ ] TLS for all connections
- [ ] Secrets management (Vault)
- [ ] Role-based access control
- [ ] Audit logging
- [ ] Input validation
- [ ] Rate limiting
- [ ] SQL injection prevention

---

## 🚨 Error Handling Strategy

### Retry Logic
```
Attempt 1: Immediate retry
Attempt 2: Wait 5 seconds
Attempt 3: Wait 25 seconds
Attempt 4: Wait 125 seconds
After 4 attempts: Move to DLQ
```

### Error Categories

| Severity | Response | Action |
|----------|----------|--------|
| **Critical** | Stop workflow | Alert, manual intervention |
| **Error** | Retry 3 times | Log, notify |
| **Warning** | Continue | Log only |
| **Info** | Continue | No action |

---

## 📋 API Endpoints Quick Reference

### Core Endpoints

```
POST   /workflows/trigger          # Start workflow
GET    /workflows/{id}             # Get status
GET    /workflows                  # List all
DELETE /workflows/{id}             # Cancel

POST   /data/collect               # Manually collect
GET    /data/collect/{id}          # Collection status

POST   /techpacks/analyze          # Analyze tech packs
GET    /techpacks/analyze/{id}     # Analysis results

POST   /validate                   # Validate data
GET    /validate/{id}              # Validation results

POST   /allowances/calculate        # Calculate allowances

POST   /pbot/generate              # Generate entries
POST   /pbot/submit                # Submit to Pivot
GET    /pbot/{order_id}            # Order status
```

### Status Codes
- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Auth failed
- `404 Not Found`: Resource not found
- `409 Conflict`: Already exists
- `500 Internal Error`: Server error

---

## 🏃 Quick Commands

### Docker
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f api

# Restart service
docker-compose restart api

# Execute command in container
docker-compose exec api bash
```

### Database
```bash
# Connect to database
psql -h localhost -U postgres -d trim_automation

# Run migrations
alembic upgrade head

# Create migration
alembic revision --autogenerate -m "description"
```

### Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
pytest

# Format code
black src/

# Lint
flake8 src/
```

---

## 📊 Monitoring URLs (Local Development)

- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health
- **Airflow**: http://localhost:8080
- **RabbitMQ**: http://localhost:15672
- **Grafana**: http://localhost:3000
- **Kibana**: http://localhost:5601
- **Prometheus**: http://localhost:9090

**Default Credentials**:
- Airflow: admin/admin
- RabbitMQ: guest/guest
- Grafana: admin/admin

---

## 🔧 Configuration Priority

1. Environment variables (.env)
2. Command line arguments
3. Configuration files
4. Default values

---

## 🎓 Learning Resources

### Key Concepts
- **Microservices**: Independent, deployable services
- **Message Queues**: Async communication
- **Workflow Orchestration**: Complex task coordination
- **OCR**: Text extraction from images
- **ML Pipeline**: Model training & inference

### Recommended Reading
- FastAPI Documentation
- Airflow Best Practices
- Microservices Patterns
- Python Type Hints
- Distributed Systems Design

---

## 🐛 Common Issues & Solutions

### Issue: Database Connection Failed
**Solution**: Check credentials, network, firewall

### Issue: Airflow DAG Not Running
**Solution**: Check scheduler logs, verify DAG definition

### Issue: Tech Pack OCR Failing
**Solution**: Check Tesseract installation, improve image quality

### Issue: API Not Responding
**Solution**: Check logs, restart service, verify resources

---

## 📞 Getting Help

1. **Documentation**: Check this repo's docs
2. **Logs**: `logs/app.log`
3. **Monitoring**: Grafana dashboards
4. **Support**: Contact DevOps team
5. **Escalation**: Development team lead

---

## ✅ Pre-Production Checklist

- [ ] All tests passing
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Rollback plan ready
- [ ] Team trained
- [ ] Stakeholders notified

---

**Version**: 1.0  
**Last Updated**: January 2024

