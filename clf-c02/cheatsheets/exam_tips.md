# Exam Tips & Tricks

## Exam Strategy
1. **Read the FULL question** - AWS loves tricky wording
2. **Eliminate wrong answers first** - Usually 2 are obviously wrong
3. **Look for keywords** in the question:
   - "Cost-effective" → Think Spot, Reserved, S3 tiers
   - "Serverless" → Lambda, Fargate, DynamoDB, S3
   - "Decouple" → SQS, SNS, EventBridge
   - "Audit" → CloudTrail
   - "Monitor" → CloudWatch
   - "Compliance" → AWS Config, Artifact
   - "Encrypt" → KMS, CloudHSM
   - "DDoS" → Shield
   - "SQL injection" → WAF
   - "Sensitive data in S3" → Macie
   - "Threat detection" → GuardDuty
   - "Migrate" → 6 R's, Snow Family, DMS
   - "Hybrid" → Storage Gateway, Outposts, Direct Connect

## Common Traps
- **CloudWatch vs CloudTrail** → Watch=metrics/alarms, Trail=API audit
- **Security Groups vs NACLs** → SG=stateful/instance, NACL=stateless/subnet
- **Shield Standard vs Advanced** → Standard=free/auto, Advanced=$3000/mo
- **KMS vs CloudHSM** → KMS=AWS manages HW, CloudHSM=you manage all
- **EBS vs EFS** → EBS=single EC2/AZ, EFS=shared/multi-AZ
- **RDS vs DynamoDB** → RDS=relational/SQL, DynamoDB=NoSQL/serverless
- **Direct Connect vs VPN** → DC=private/dedicated, VPN=encrypted/internet

## "Which service" Quick Reference
- Need a **chatbot**? → Lex
- Need **speech to text**? → Transcribe
- Need **text to speech**? → Polly
- Need **image analysis**? → Rekognition
- Need **document text extraction**? → Textract
- Need **ML model building**? → SageMaker
- Need **infrastructure as code**? → CloudFormation
- Need **deploy code easily**? → Elastic Beanstalk
- Need **DNS**? → Route 53
- Need **CDN**? → CloudFront
- Need **message queue**? → SQS
- Need **notifications**? → SNS
- Need **serverless compute**? → Lambda
- Need **data warehouse**? → Redshift
- Need **caching**? → ElastiCache
- Need **graph database**? → Neptune

## Time Management
- 90 minutes / 65 questions = ~1.4 min per question
- Flag difficult questions and come back
- Don't spend more than 2 minutes on any single question
- You'll likely finish with 15-20 minutes to spare
