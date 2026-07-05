# Domain 3: Cloud Technology & Services (34%)

## Compute Services

| Service | Use Case |
|---------|----------|
| **EC2** | Virtual servers (full control) |
| **Lambda** | Serverless functions (event-driven, max 15 min) |
| **ECS** | Docker containers on EC2 |
| **Fargate** | Serverless containers (no EC2 management) |
| **Elastic Beanstalk** | PaaS - deploy apps easily (handles infra) |
| **Lightsail** | Simple VPS (small apps, websites) |
| **Batch** | Batch processing jobs |
| **Outposts** | AWS infrastructure on-premises |

### EC2 Instance Types
- **General Purpose (T, M)** - Balanced workloads
- **Compute Optimized (C)** - CPU-intensive (gaming, ML)
- **Memory Optimized (R, X)** - In-memory databases
- **Storage Optimized (I, D)** - High I/O
- **Accelerated Computing (P, G)** - GPU, ML training

## Storage Services

| Service | Type | Use Case |
|---------|------|----------|
| **S3** | Object | Files, backups, static websites |
| **EBS** | Block | EC2 disk (single AZ) |
| **EFS** | File | Shared file system (multi-AZ, Linux) |
| **FSx** | File | Windows file system / Lustre |
| **S3 Glacier** | Archive | Long-term backup (cheap) |
| **Storage Gateway** | Hybrid | On-prem to cloud bridge |
| **Snow Family** | Physical | Migrate large data physically |

### S3 Storage Classes
1. **S3 Standard** - Frequently accessed
2. **S3 Standard-IA** - Infrequent access, rapid retrieval
3. **S3 One Zone-IA** - Infrequent, single AZ (cheaper)
4. **S3 Glacier Instant** - Archive, millisecond retrieval
5. **S3 Glacier Flexible** - Archive, minutes to hours
6. **S3 Glacier Deep Archive** - Cheapest, 12-48 hour retrieval
7. **S3 Intelligent-Tiering** - Auto-moves between tiers

## Database Services

| Service | Type | Use Case |
|---------|------|----------|
| **RDS** | Relational | MySQL, PostgreSQL, Oracle, SQL Server |
| **Aurora** | Relational | AWS-optimized (5x MySQL, 3x PostgreSQL) |
| **DynamoDB** | NoSQL (Key-Value) | Serverless, single-digit ms latency |
| **ElastiCache** | In-Memory | Redis/Memcached caching |
| **Redshift** | Data Warehouse | Analytics, OLAP |
| **Neptune** | Graph | Social networks, recommendations |
| **DocumentDB** | Document | MongoDB compatible |
| **QLDB** | Ledger | Immutable, cryptographic log |
| **Timestream** | Time-series | IoT, metrics |

## Networking

| Service | Purpose |
|---------|---------|
| **VPC** | Virtual private network in AWS |
| **Subnets** | Public (internet) or Private (no internet) |
| **Internet Gateway** | Connects VPC to internet |
| **NAT Gateway** | Private subnet → internet (outbound only) |
| **Route 53** | DNS service (domain registration + routing) |
| **CloudFront** | CDN (caches content at edge locations) |
| **Direct Connect** | Dedicated private connection to AWS |
| **VPN** | Encrypted connection over internet to AWS |
| **Transit Gateway** | Connect multiple VPCs & on-prem |
| **ELB** | Load balancer (ALB=HTTP, NLB=TCP, GLB=3rd party) |
| **API Gateway** | Create & manage APIs |

## Management & Monitoring

| Service | Purpose |
|---------|---------|
| **CloudWatch** | Metrics, logs, alarms |
| **CloudTrail** | API audit log (who did what) |
| **AWS Config** | Resource configuration history & compliance |
| **Systems Manager** | Manage EC2 fleet (patching, run commands) |
| **Trusted Advisor** | Best practice recommendations (5 categories) |
| **Health Dashboard** | Service health & your account events |
| **CloudFormation** | Infrastructure as Code (IaC) - templates |
| **CDK** | IaC using programming languages |

### Trusted Advisor 5 Categories
1. Cost Optimization
2. Performance
3. Security
4. Fault Tolerance
5. Service Limits

## Application Integration
- **SQS** - Message queue (decouple services)
- **SNS** - Pub/sub notifications (email, SMS, push)
- **EventBridge** - Event bus (event-driven architecture)
- **Step Functions** - Orchestrate workflows

## AI/ML Services (Know the names)
- **Rekognition** - Image/video analysis
- **Transcribe** - Speech to text
- **Polly** - Text to speech
- **Translate** - Language translation
- **Lex** - Chatbots (powers Alexa)
- **SageMaker** - Build/train ML models
- **Comprehend** - NLP, sentiment analysis
- **Textract** - Extract text from documents
- **Kendra** - Intelligent search
