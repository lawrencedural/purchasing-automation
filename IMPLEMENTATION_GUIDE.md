# Trim Ordering Automation - Implementation Guide

## Quick Start

This guide provides step-by-step instructions for implementing the automated trim ordering system.

---

## Prerequisites

- Python 3.11+ installed
- PostgreSQL 12+ or compatible database
- Redis 6+ for caching
- Docker and Docker Compose (for containerized deployment)
- NG system access credentials
- Tech pack repository access
- Pivot system API credentials

---

## Project Structure

```
purchasing-automation/
├── src/
│   ├── api/                  # API Gateway and routes
│   │   ├── __init__.py
│   │   ├── gateway.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── health.py
│   │       ├── workflow.py
│   │       └── status.py
│   │
│   ├── services/             # Microservices
│   │   ├── __init__.py
│   │   ├── data_collection/
│   │   │   ├── __init__.py
│   │   │   ├── ng_connector.py
│   │   │   ├── file_downloader.py
│   │   │   └── tech_pack_fetcher.py
│   │   │
│   │   ├── data_processing/
│   │   │   ├── __init__.py
│   │   │   ├── cleaner.py
│   │   │   ├── normalizer.py
│   │   │   └── validator.py
│   │   │
│   │   ├── extraction/
│   │   │   ├── __init__.py
│   │   │   ├── component_extractor.py
│   │   │   └── style_parser.py
│   │   │
│   │   ├── tech_pack_analyzer/
│   │   │   ├── __init__.py
│   │   │   ├── pdf_parser.py
│   │   │   ├── ocr_service.py
│   │   │   ├── material_extractor.py
│   │   │   └── label_extractor.py
│   │   │
│   │   ├── validation/
│   │   │   ├── __init__.py
│   │   │   ├── fee_checker.py
│   │   │   ├── buyer_file_validator.py
│   │   │   └── data_validator.py
│   │   │
│   │   ├── allowance_calculator/
│   │   │   ├── __init__.py
│   │   │   ├── calculator.py
│   │   │   └── rules_engine.py
│   │   │
│   │   └── pbot_generator/
│   │       ├── __init__.py
│   │       ├── entry_builder.py
│   │       └── pbot_client.py
│   │
│   ├── orchestration/        # Workflow orchestration
│   │   ├── __init__.py
│   │   ├── dag.py
│   │   ├── tasks/
│   │   │   ├── __init__.py
│   │   │   ├── collect.py
│   │   │   ├── process.py
│   │   │   ├── extract.py
│   │   │   ├── analyze.py
│   │   │   ├── validate.py
│   │   │   ├── calculate.py
│   │   │   └── generate.py
│   │   └── triggers.py
│   │
│   ├── models/              # Database models
│   │   ├── __init__.py
│   │   ├── po.py
│   │   ├── trim_component.py
│   │   ├── tech_pack.py
│   │   └── pbot_entry.py
│   │
│   ├── storage/             # Data storage layer
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── object_storage.py
│   │   └── cache.py
│   │
│   ├── config/              # Configuration
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   └── constants.py
│   │
│   └── utils/               # Utilities
│       ├── __init__.py
│       ├── logger.py
│       ├── exceptions.py
│       └── helpers.py
│
├── tests/                   # Unit and integration tests
│   ├── __init__.py
│   ├── test_data_collection.py
│   ├── test_data_processing.py
│   ├── test_extraction.py
│   └── conftest.py
│
├── workflows/              # Airflow DAGs
│   └── trim_ordering_dag.py
│
├── docker-compose.yml      # Local development setup
├── Dockerfile
├── requirements.txt
├── .env.example
├── pytest.ini
└── README.md
```

---

## Step-by-Step Implementation

### Step 1: Environment Setup

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Initialize database**
   ```bash
   alembic upgrade head
   ```

### Step 2: Database Setup

Create the necessary database schema:

```sql
-- Example schema for trim components
CREATE TABLE trim_components (
    id SERIAL PRIMARY KEY,
    po_id VARCHAR(255) NOT NULL,
    style_number VARCHAR(100),
    component_type VARCHAR(100),
    material VARCHAR(200),
    color VARCHAR(50),
    quantity INTEGER,
    supplier VARCHAR(200),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tech_pack_data (
    id SERIAL PRIMARY KEY,
    style_number VARCHAR(100) UNIQUE NOT NULL,
    pdf_path TEXT,
    main_label_data JSONB,
    care_labels JSONB,
    hangtags JSONB,
    logos JSONB,
    extracted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pbot_entries (
    id SERIAL PRIMARY KEY,
    entry_id VARCHAR(255) UNIQUE NOT NULL,
    po_id VARCHAR(255),
    trim_summary JSONB,
    allowances JSONB,
    status VARCHAR(50),
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workflow_runs (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(255) UNIQUE NOT NULL,
    po_id VARCHAR(255),
    status VARCHAR(50),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    error_message TEXT
);

CREATE INDEX idx_po_id ON trim_components(po_id);
CREATE INDEX idx_style_number ON trim_components(style_number);
CREATE INDEX idx_workflow_status ON workflow_runs(status);
```

### Step 3: Implement Core Services

#### 3.1 Data Collection Service

```python
# src/services/data_collection/ng_connector.py
import psycopg2
from typing import List, Dict
from src.utils.logger import get_logger

logger = get_logger(__name__)

class NGConnector:
    def __init__(self, db_config: dict):
        self.db_config = db_config
        
    def fetch_po_delivery_schedule(self, po_id: str) -> List[Dict]:
        """Fetch PO line delivery schedule from NG system"""
        try:
            connection = psycopg2.connect(**self.db_config)
            cursor = connection.cursor()
            
            query = """
                SELECT po_id, line_number, style_number, 
                       delivery_date, quantity, buyer_style
                FROM po_delivery_schedule
                WHERE po_id = %s
            """
            
            cursor.execute(query, (po_id,))
            results = cursor.fetchall()
            
            return [
                {
                    'po_id': row[0],
                    'line_number': row[1],
                    'style_number': row[2],
                    'delivery_date': row[3],
                    'quantity': row[4],
                    'buyer_style': row[5]
                }
                for row in results
            ]
        except Exception as e:
            logger.error(f"Error fetching PO schedule: {str(e)}")
            raise
        finally:
            cursor.close()
            connection.close()
```

#### 3.2 Data Processing Service

```python
# src/services/data_processing/cleaner.py
import pandas as pd
from typing import List, Dict
from src.utils.logger import get_logger

logger = get_logger(__name__)

class DataCleaner:
    @staticmethod
    def clean_and_filter(raw_data: List[Dict], criteria: dict) -> pd.DataFrame:
        """Clean and filter raw data based on criteria"""
        try:
            df = pd.DataFrame(raw_data)
            
            # Filter based on criteria
            if 'date_range' in criteria:
                df = df[df['delivery_date'].between(
                    criteria['date_range'][0],
                    criteria['date_range'][1]
                )]
            
            # Remove duplicates
            df = df.drop_duplicates(subset=['po_id', 'style_number'])
            
            # Normalize style numbers
            df['style_number'] = df['style_number'].str.strip().str.upper()
            
            logger.info(f"Cleaned data: {len(df)} records")
            return df
            
        except Exception as e:
            logger.error(f"Error cleaning data: {str(e)}")
            raise
```

#### 3.3 Tech Pack Analyzer

```python
# src/services/tech_pack_analyzer/pdf_parser.py
import pdfplumber
from typing import Dict
from src.utils.logger import get_logger

logger = get_logger(__name__)

class TechPackParser:
    def parse(self, pdf_path: str) -> Dict:
        """Parse tech pack PDF to extract information"""
        try:
            result = {
                'materials': [],
                'logos': [],
                'colors': [],
                'main_label': {},
                'care_labels': [],
                'hangtags': []
            }
            
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    
                    # Extract materials
                    materials = self._extract_materials(text)
                    result['materials'].extend(materials)
                    
                    # Extract labels
                    labels = self._extract_labels(text)
                    result['care_labels'].extend(labels)
                    
            logger.info(f"Parsed tech pack: {pdf_path}")
            return result
            
        except Exception as e:
            logger.error(f"Error parsing tech pack: {str(e)}")
            raise
    
    def _extract_materials(self, text: str) -> List[str]:
        """Extract material information from text"""
        # Implement material extraction logic
        # Can use regex or NLP models
        pass
    
    def _extract_labels(self, text: str) -> List[Dict]:
        """Extract label information from text"""
        # Implement label extraction logic
        pass
```

#### 3.4 Pivot Generator

```python
# src/services/pbot_generator/entry_builder.py
from typing import List, Dict
from src.utils.logger import get_logger

logger = get_logger(__name__)

class PBotEntryBuilder:
    def __init__(self, pbot_client):
        self.client = pbot_client
        
    def build_entry(self, trim_summary: Dict, allowances: Dict) -> Dict:
        """Build Pivot entry from trim summary and allowances"""
        try:
            entry = {
                'supplier': trim_summary.get('supplier'),
                'style_number': trim_summary.get('style_number'),
                'color': trim_summary.get('color'),
                'components': [],
                'quantities': {},
                'allowances': allowances
            }
            
            # Add each component
            for component in trim_summary.get('components', []):
                entry['components'].append({
                    'type': component['type'],
                    'material': component['material'],
                    'code': component.get('code'),
                    'supplier': component.get('supplier')
                })
                
                # Apply allowances to quantities
                base_quantity = component['quantity']
                allowance_factor = allowances.get(component['type'], 1.0)
                adjusted_quantity = int(base_quantity * allowance_factor)
                entry['quantities'][component['type']] = adjusted_quantity
            
            logger.info(f"Built Pivot entry for {trim_summary.get('style_number')}")
            return entry
            
        except Exception as e:
            logger.error(f"Error building Pivot entry: {str(e)}")
            raise
```

### Step 4: Orchestration with Airflow

```python
# workflows/trim_ordering_dag.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
from src.orchestration.tasks import (
    collect_task, process_task, extract_task,
    analyze_task, validate_task, calculate_task, generate_task
)

default_args = {
    'owner': 'trim-automation',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 3,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'trim_ordering_automation',
    default_args=default_args,
    description='Automated Trim Ordering Workflow',
    schedule_interval='@daily',
    catchup=False
)

# Define tasks
collect = PythonOperator(
    task_id='collect_data',
    python_callable=collect_task,
    dag=dag
)

validate_initial = PythonOperator(
    task_id='validate_initial_checks',
    python_callable=validate_task,
    dag=dag
)

process = PythonOperator(
    task_id='process_data',
    python_callable=process_task,
    dag=dag
)

extract = PythonOperator(
    task_id='extract_components',
    python_callable=extract_task,
    dag=dag
)

analyze = PythonOperator(
    task_id='analyze_tech_packs',
    python_callable=analyze_task,
    dag=dag
)

validate_complete = PythonOperator(
    task_id='validate_complete',
    python_callable=validate_task,
    dag=dag
)

calculate = PythonOperator(
    task_id='calculate_allowances',
    python_callable=calculate_task,
    dag=dag
)

generate = PythonOperator(
    task_id='generate_pbot',
    python_callable=generate_task,
    dag=dag
)

# Define task dependencies
collect >> validate_initial >> process >> extract >> analyze >> \
validate_complete >> calculate >> generate
```

### Step 5: Configuration

```python
# src/config/settings.py
from pydantic import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    db_host: str
    db_port: int = 5432
    db_name: str
    db_user: str
    db_password: str
    
    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    
    # NG System
    ng_db_host: str
    ng_db_port: int = 5432
    ng_db_name: str
    ng_db_user: str
    ng_db_password: str
    
    # Tech Pack Storage
    tech_pack_storage_path: str
    tech_pack_storage_type: str = "local"  # local, s3, azure
    
    # Pivot API
    pbot_api_url: str
    pbot_api_key: str
    
    # Logging
    log_level: str = "INFO"
    log_file_path: str = "logs/app.log"
    
    # AWS/Azure (if using cloud storage)
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

### Step 6: Testing

Create test files:

```python
# tests/test_data_collection.py
import pytest
from src.services.data_collection.ng_connector import NGConnector

class TestNGConnector:
    def test_fetch_po_delivery_schedule(self):
        connector = NGConnector(db_config=mock_config)
        result = connector.fetch_po_delivery_schedule("PO123")
        assert len(result) > 0
        assert result[0]['po_id'] == "PO123"
```

Run tests:
```bash
pytest tests/
```

### Step 7: Deployment

#### Docker Setup

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/
COPY workflows/ ./workflows/

# Set Python path
ENV PYTHONPATH=/app

CMD ["python", "-m", "src.api.gateway"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DB_HOST=postgres
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  airflow:
    image: apache/airflow:2.7.0
    environment:
      - AIRFLOW__CORE__EXECUTOR=LocalExecutor
    volumes:
      - ./workflows:/opt/airflow/dags
    depends_on:
      - postgres

volumes:
  postgres_data:
```

#### Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trim-automation-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: trim-automation-api
  template:
    metadata:
      labels:
        app: trim-automation-api
    spec:
      containers:
      - name: api
        image: trim-automation:latest
        ports:
        - containerPort: 8000
        env:
        - name: DB_HOST
          value: postgres-service
```

### Step 8: Monitoring & Alerts

Set up monitoring with Prometheus and Grafana:

1. Install Prometheus client in Python app
2. Configure metrics collection
3. Set up Grafana dashboards
4. Configure alerts in alertmanager

---

## Common Issues & Solutions

### Issue 1: Database Connection Errors
**Solution**: Check network connectivity, credentials, and firewall rules

### Issue 2: Tech Pack Parsing Failures
**Solution**: Implement fallback to manual review, improve OCR accuracy

### Issue 3: Pivot API Rate Limiting
**Solution**: Implement request queuing and retry logic with exponential backoff

### Issue 4: Memory Issues with Large Files
**Solution**: Implement streaming processing and chunking

---

## Performance Optimization

1. **Caching**: Cache frequently accessed data in Redis
2. **Async Processing**: Use async/await for I/O operations
3. **Batch Processing**: Process multiple items in parallel
4. **Database Indexing**: Create appropriate indexes
5. **Connection Pooling**: Use connection pooling for database

---

## Security Best Practices

1. **Secrets Management**: Use environment variables or secret managers
2. **Encryption**: Encrypt sensitive data at rest and in transit
3. **Access Control**: Implement RBAC for all services
4. **Input Validation**: Validate all inputs
5. **SQL Injection Prevention**: Use parameterized queries

---

## Maintenance

### Regular Tasks
- Monitor system health daily
- Review logs weekly
- Update dependencies monthly
- Performance testing quarterly
- Security audits annually

### Backup Strategy
- Database backups: Daily with 30-day retention
- Configuration backups: Weekly
- Code backups: Version control (Git)

---

## Support

For issues or questions:
- Check logs in `logs/app.log`
- Review monitoring dashboards
- Contact DevOps team
- Escalate to development team if needed

