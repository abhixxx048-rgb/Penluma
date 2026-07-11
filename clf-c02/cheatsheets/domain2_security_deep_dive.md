# Domain 2: Security - Deep Dive Training

## Encryption Services

### KMS (Key Management Service)
- AWS manages the hardware that stores your keys
- YOU control who can use the keys (via IAM policies)
- Used to encrypt: EBS, S3, RDS, Redshift, etc.
- Automatic key rotation (once per year)
- Integrated with most AWS services
- **Exam keyword:** "encryption keys, managed" → KMS

### CloudHSM (Hardware Security Module)
- YOU manage everything - keys, hardware access, users
- Dedicated hardware (single-tenant)
- FIPS 140-2 Level 3 certified (highest security)
- AWS CANNOT access your keys
- More expensive, more control
- **Exam keyword:** "full control of keys, FIPS 140-2 Level 3, dedicated" → CloudHSM

### KMS vs CloudHSM

| Feature | KMS | CloudHSM |
|---------|-----|----------|
| Who manages hardware? | AWS | AWS |
| Who manages keys? | Shared (AWS + you) | YOU only |
| Multi-tenant? | Yes | No (dedicated) |
| FIPS 140-2 Level | Level 2 | Level 3 |
| Cost | Cheaper | Expensive |
| AWS can access keys? | Technically yes | No, never |

---

## Security Detection Services

### Amazon GuardDuty
- Intelligent threat detection (ML-based)
- Analyzes: CloudTrail logs, VPC Flow Logs, DNS logs
- Detects: compromised instances, unauthorized access, crypto mining
- One-click enable, no software to install
- **Exam keyword:** "threat detection, ML, analyzes logs" → GuardDuty

### Amazon Inspector
- Vulnerability scanning for EC2, containers, Lambda
- Checks against CVE database
- Prioritized findings with severity
- **Exam keyword:** "vulnerability assessment, scan for security issues" → Inspector

### Amazon Macie
- Discovers & protects sensitive data in S3
- Finds: PII, credit cards, passport numbers
- Alerts if sensitive data is publicly accessible
- **Exam keyword:** "sensitive data in S3, PII" → Macie

### Amazon Detective
- Investigate security findings (root cause analysis)
- Used AFTER GuardDuty finds a threat
- Visualizes relationships between resources/users/events
- **Exam keyword:** "investigate, root cause, analyze findings" → Detective

### How they work together:
```
GuardDuty → DETECTS threat
Inspector → SCANS for vulnerabilities
Macie → FINDS sensitive data exposure
Detective → INVESTIGATES root cause
```

---

## Secrets Management

### Secrets Manager vs Parameter Store

| Feature | Secrets Manager | Parameter Store |
|---------|----------------|-----------------|
| Purpose | Store secrets (DB passwords, API keys) | Store config values & secrets |
| Auto-rotation | ✅ Yes (built-in) | ❌ No |
| Cost | $0.40/secret/month | Free tier available |
| Best for | DB credentials needing rotation | App config, feature flags |

- **Exam keyword:** "rotate secrets automatically" → Secrets Manager
- **Exam keyword:** "store config parameters, cheaper" → Parameter Store

---

## Amazon Cognito
- User sign-up, sign-in, access control for apps
- Social login (Google, Facebook, Apple)
- Enterprise login (SAML, Active Directory)
- Serverless, scales automatically
- **Exam keyword:** "add authentication to app, social login" → Cognito

---

## VPC Security Features

### VPC Flow Logs
- Captures IP traffic info in/out of VPC
- For monitoring & troubleshooting connectivity
- Stored in CloudWatch Logs or S3
- **Exam keyword:** "monitor network traffic in VPC" → Flow Logs

### AWS PrivateLink
- Access AWS services privately (no internet)
- Traffic stays within AWS network
- **Exam keyword:** "access services privately, no internet" → PrivateLink

---

## ACM (AWS Certificate Manager)
- Free SSL/TLS certificates for HTTPS
- Auto-renews certificates
- Integrates with ELB, CloudFront, API Gateway
- **Exam keyword:** "SSL certificate, HTTPS" → ACM

---

## AWS Security Hub
- Central dashboard for ALL security findings
- Aggregates alerts from GuardDuty, Inspector, Macie, Firewall Manager
- Checks against security best practices
- **Exam keyword:** "central security dashboard, aggregate findings" → Security Hub

---

## Complete Security Services Cheat Table

| Service | One-liner |
|---------|-----------|
| IAM | Who can access what |
| KMS | Encryption key management |
| CloudHSM | Full control encryption (FIPS Level 3) |
| WAF | Block SQL injection, XSS (Layer 7) |
| Shield | DDoS protection (Layer 3/4) |
| GuardDuty | Threat detection (ML) |
| Inspector | Vulnerability scanning |
| Macie | Find sensitive data in S3 |
| Detective | Investigate security incidents |
| Secrets Manager | Store & rotate secrets |
| Cognito | App user authentication |
| ACM | SSL/TLS certificates |
| Security Hub | Central security dashboard |
| Artifact | Compliance reports |
| Config | Resource compliance tracking |
| CloudTrail | API audit log |
| VPC Flow Logs | Network traffic monitoring |
| PrivateLink | Private access to services |
