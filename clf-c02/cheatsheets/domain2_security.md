# Domain 2: Security & Compliance Cheatsheet

## 1. Shared Responsibility Model
- **AWS** = Security OF the Cloud (hardware, infrastructure, managed services)
- **Customer** = Security IN the Cloud (data, OS patching on EC2, IAM, Security Groups)
- EC2 → more customer responsibility | RDS → less customer responsibility | S3 → you manage policies & encryption

## 2. IAM (Identity & Access Management)
- **Root User** → full access, never use daily, enable MFA
- **IAM User** → one person/application
- **IAM Group** → collection of users, attach policy once
- **IAM Role** → temporary badge for AWS services (EC2 accessing S3)
- **IAM Policy** → JSON document defining Allow/Deny permissions
- IAM is **global** | New users have **zero permissions** by default
- Always use **least privilege** | Use **Roles** for AWS services, never embed access keys

## 3. Security Services
| Service | Does What | Remember As |
|---------|-----------|-------------|
| **WAF** | Blocks web attacks (SQL injection, XSS) | Door lock 🚪 |
| **Shield Standard** | Free DDoS protection for all customers | Shiel**D** = **D**DoS 🛡️ |
| **Shield Advanced** | Paid DDoS + 24/7 response team | Premium shield 💰 |
| **GuardDuty** | Detects threats using ML (monitors logs) | Security Guard 👮 |
| **Inspector** | Scans EC2 for vulnerabilities & open ports | Home Inspector 🔍 |
| **Macie** | Finds sensitive data (PII, credit cards) in S3 | **M**oney in S**3** 💳 |
| **Security Hub** | Central dashboard for all security alerts | Control room 🖥️ |

### GuardDuty vs Inspector
- **GuardDuty** = "Is someone attacking me RIGHT NOW?" → monitors logs, detects active threats
- **Inspector** = "Do I have weak spots?" → scans EC2, finds vulnerabilities BEFORE attack

## 4. Encryption
- **At-rest** → data stored (S3, EBS, RDS) is encrypted
- **In-transit** → data moving between client & server (HTTPS/TLS/SSL)

| | KMS | CloudHSM |
|---|---|---|
| **Key storage** | Software-based | Dedicated hardware |
| **Who manages keys** | You (AWS helps) | Only you |
| **AWS access** | Yes | No |
| **Cost** | Cheaper | Expensive |
| **Use case** | General encryption | Strict compliance |

## 5. Compliance & AWS Artifact
- **AWS Artifact** = compliance filing cabinet 📁
  - **Artifact Reports** → ISO, SOC, PCI DSS reports
  - **Artifact Agreements** → BAA for HIPAA
- **HIPAA** = healthcare data | **PCI DSS** = credit card data | **GDPR** = European privacy | **ISO 27001** = info security

## 6. Network Security
- **VPC** = your private network in AWS
- **Public Subnet** = has internet access (web servers)
- **Private Subnet** = no internet access (databases)

| | Security Group | NACL |
|---|---|---|
| **Applied to** | EC2 instance | Subnet |
| **Stateful/Stateless** | Stateful | Stateless |
| **Allow/Deny** | Allow only | Allow & Deny |

- **Security Group** = Bodyguard for each EC2 💂 (stateful = remembers conversation)
- **NACL** = Border control for subnet 🛂 (stateless = checks both ways every time)
- To explicitly **DENY** an IP → use **NACL**
