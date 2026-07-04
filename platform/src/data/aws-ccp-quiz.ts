// AWS Certified Cloud Practitioner (CLF-C02) practice questions.
// Grouped by the four exam domains, roughly matching the real exam weighting:
//   Cloud Concepts 24% · Security & Compliance 30% · Technology 34% · Billing 12%.
// `answer` is the 0-based index into `options`. Single-answer only.
// Explanations say *why* so the quiz teaches, not just tests.

export type QuizDomain =
  | 'Cloud Concepts'
  | 'Security & Compliance'
  | 'Cloud Technology & Services'
  | 'Billing, Pricing & Support';

export interface QuizQuestion {
  id: number;
  domain: QuizDomain;
  question: string;
  options: string[];
  /** 0-based index of the correct option. */
  answer: number;
  explanation: string;
}

export const AWS_CCP_QUIZ: QuizQuestion[] = [
  // ============ Cloud Concepts ============
  {
    id: 1,
    domain: 'Cloud Concepts',
    question:
      'Which pillar of the AWS Well-Architected Framework focuses on a system’s ability to recover from failures and dynamically meet demand?',
    options: ['Operational Excellence', 'Reliability', 'Cost Optimization', 'Performance Efficiency'],
    answer: 1,
    explanation:
      'Reliability covers recovering from disruptions and scaling to meet demand. The six pillars are Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability.',
  },
  {
    id: 2,
    domain: 'Cloud Concepts',
    question: 'Which of the following is NOT a pillar of the AWS Well-Architected Framework?',
    options: ['Security', 'Elasticity', 'Cost Optimization', 'Sustainability'],
    answer: 1,
    explanation:
      'Elasticity is a cloud characteristic, not a pillar. The six pillars are Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability.',
  },
  {
    id: 3,
    domain: 'Cloud Concepts',
    question: 'What is a primary financial benefit of moving to the AWS Cloud?',
    options: [
      'Eliminating all operational costs',
      'Trading capital expense (CapEx) for variable expense (OpEx)',
      'Guaranteeing a fixed monthly bill regardless of usage',
      'Removing the need for any staff',
    ],
    answer: 1,
    explanation:
      'Instead of large up-front data-center investments (CapEx), you pay only for what you consume (variable OpEx), and pay less as you scale thanks to economies of scale.',
  },
  {
    id: 4,
    domain: 'Cloud Concepts',
    question:
      'A workload’s traffic spikes every evening and drops overnight. Which cloud characteristic lets AWS automatically add and remove capacity to match this?',
    options: ['High availability', 'Elasticity', 'Fault tolerance', 'Colocation'],
    answer: 1,
    explanation:
      'Elasticity is the ability to acquire resources as you need them and release them when you don’t, scaling in and out automatically with demand.',
  },
  {
    id: 5,
    domain: 'Cloud Concepts',
    question:
      'Which component of AWS global infrastructure is a physically separate, isolated location made up of one or more data centers within a Region?',
    options: ['Edge location', 'Availability Zone', 'Region', 'Local Zone'],
    answer: 1,
    explanation:
      'A Region contains multiple Availability Zones (AZs). Each AZ is one or more discrete data centers with independent power and networking, enabling highly available designs across AZs.',
  },
  {
    id: 6,
    domain: 'Cloud Concepts',
    question:
      'Which EC2 purchasing option offers the largest discount (up to 90%) and is best for fault-tolerant, flexible, or interruptible workloads?',
    options: ['On-Demand Instances', 'Reserved Instances', 'Spot Instances', 'Dedicated Hosts'],
    answer: 2,
    explanation:
      'Spot Instances use spare EC2 capacity at steep discounts but can be reclaimed with a two-minute warning, so they suit batch jobs, CI, and other interruption-tolerant work.',
  },
  {
    id: 7,
    domain: 'Cloud Concepts',
    question:
      'A company wants to run some workloads in its own data center while connecting them to resources in AWS. Which deployment model is this?',
    options: ['All-in cloud', 'Hybrid', 'On-premises (private) only', 'Multi-cloud'],
    answer: 1,
    explanation:
      'A hybrid deployment integrates on-premises infrastructure with cloud resources, often connected via VPN or AWS Direct Connect.',
  },
  {
    id: 8,
    domain: 'Cloud Concepts',
    question: 'Which benefit of cloud computing lets a company deploy its application to customers around the world in minutes?',
    options: ['Economies of scale', 'Go global in minutes', 'Trade CapEx for OpEx', 'Stop guessing capacity'],
    answer: 1,
    explanation:
      '“Go global in minutes” means deploying to multiple AWS Regions worldwide with a few clicks, putting applications closer to users for lower latency.',
  },
  {
    id: 9,
    domain: 'Cloud Concepts',
    question: 'Because AWS aggregates usage from hundreds of thousands of customers, it can lower prices over time. This is an example of what?',
    options: ['Elasticity', 'Economies of scale', 'Loose coupling', 'Fault tolerance'],
    answer: 1,
    explanation:
      'Economies of scale: AWS’s massive aggregated demand drives down its per-unit costs, and those savings are passed on as lower pricing.',
  },
  {
    id: 10,
    domain: 'Cloud Concepts',
    question: 'What does the cloud benefit “stop guessing capacity” allow a business to do?',
    options: [
      'Commit to a fixed amount of hardware for three years',
      'Scale resources up or down as demand changes, avoiding over- or under-provisioning',
      'Guarantee that costs never change',
      'Remove the need for monitoring',
    ],
    answer: 1,
    explanation:
      'Rather than buying for peak (waste) or too little (poor performance), you scale on demand and pay for what you actually use.',
  },
  {
    id: 11,
    domain: 'Cloud Concepts',
    question: 'Which practice most improves the high availability of an application running on Amazon EC2?',
    options: [
      'Running a single large instance',
      'Deploying instances across multiple Availability Zones behind a load balancer',
      'Turning off monitoring to reduce load',
      'Storing all data on the instance’s local disk',
    ],
    answer: 1,
    explanation:
      'Spreading instances across multiple AZs (and using a load balancer + Auto Scaling) means the failure of one AZ doesn’t take the application down.',
  },
  {
    id: 12,
    domain: 'Cloud Concepts',
    question:
      'A healthcare company must store patient data within a specific country to satisfy local law. Which factor should most influence its AWS Region choice?',
    options: ['Pricing', 'Latency', 'Compliance and data governance', 'Number of Availability Zones'],
    answer: 2,
    explanation:
      'When laws require data to reside in a particular jurisdiction, compliance/data-residency requirements drive Region selection. Latency, price, and service availability are secondary factors.',
  },
  {
    id: 13,
    domain: 'Cloud Concepts',
    question: 'Adding more, smaller instances to handle increased load (rather than resizing to a bigger instance) is known as what?',
    options: ['Vertical scaling', 'Horizontal scaling', 'Right-sizing', 'Consolidation'],
    answer: 1,
    explanation:
      'Horizontal scaling (scaling out) adds more instances; vertical scaling (scaling up) increases the size of a single instance. The cloud makes horizontal scaling easy via Auto Scaling.',
  },
  {
    id: 14,
    domain: 'Cloud Concepts',
    question: 'Which cloud benefit refers to being able to experiment and provision resources in minutes instead of weeks?',
    options: ['Agility', 'Durability', 'Consolidation', 'Redundancy'],
    answer: 0,
    explanation:
      'Agility is the speed with which you can spin resources up and down, letting teams experiment cheaply and bring ideas to market faster.',
  },
  {
    id: 15,
    domain: 'Cloud Concepts',
    question: 'What is the main purpose of comparing Total Cost of Ownership (TCO) between on-premises and AWS?',
    options: [
      'To measure network latency',
      'To capture the full cost — hardware, power, staff, and maintenance — not just the sticker price',
      'To choose an Availability Zone',
      'To set IAM permissions',
    ],
    answer: 1,
    explanation:
      'TCO accounts for all direct and indirect costs (hardware, facilities, power, cooling, admin labor) so the comparison reflects true cost, not just visible line items.',
  },
  {
    id: 16,
    domain: 'Cloud Concepts',
    question: 'Designing application components so that a failure in one does not cascade to others is best described as what?',
    options: ['Tight coupling', 'Loose coupling', 'Vertical scaling', 'Monolithic design'],
    answer: 1,
    explanation:
      'Loose coupling (often via queues like Amazon SQS or load balancers) isolates components so they can fail and scale independently, improving resilience.',
  },

  // ============ Security & Compliance ============
  {
    id: 17,
    domain: 'Security & Compliance',
    question: 'Under the AWS Shared Responsibility Model, who is responsible for patching the guest operating system on an Amazon EC2 instance?',
    options: ['AWS', 'The customer', 'Shared equally', 'The AWS Marketplace vendor'],
    answer: 1,
    explanation:
      'AWS secures the cloud (hardware, hypervisor, facilities). The customer is responsible for security *in* the cloud — the guest OS, patches, applications, and data on EC2.',
  },
  {
    id: 18,
    domain: 'Security & Compliance',
    question: 'Under the Shared Responsibility Model, which of these is always AWS’s responsibility?',
    options: [
      'Physical security of the data centers',
      'Configuring security groups',
      'Managing IAM user permissions',
      'Encrypting application data',
    ],
    answer: 0,
    explanation:
      'AWS is responsible for security *of* the cloud — including physical facilities, hardware, and the global infrastructure. Customers configure security groups, IAM, and data encryption.',
  },
  {
    id: 19,
    domain: 'Security & Compliance',
    question: 'Which AWS service is used to create users and groups and control their permissions to AWS resources?',
    options: ['Amazon Cognito', 'AWS IAM', 'AWS WAF', 'Amazon GuardDuty'],
    answer: 1,
    explanation:
      'AWS Identity and Access Management (IAM) manages users, groups, roles, and fine-grained permission policies for AWS services and resources.',
  },
  {
    id: 20,
    domain: 'Security & Compliance',
    question: 'Which is a security best practice for the AWS account root user?',
    options: [
      'Use the root user for all daily administrative tasks',
      'Share the root credentials with the whole team',
      'Enable MFA on the root user and avoid using it for everyday tasks',
      'Delete the root user after creating IAM users',
    ],
    answer: 2,
    explanation:
      'Protect the root user with MFA, lock away its credentials, and do day-to-day work with least-privilege IAM users or roles. The root user cannot be deleted.',
  },
  {
    id: 21,
    domain: 'Security & Compliance',
    question: 'Which service continuously monitors AWS accounts and workloads for malicious activity using machine learning and threat intelligence?',
    options: ['Amazon Inspector', 'Amazon GuardDuty', 'AWS Trusted Advisor', 'AWS Config'],
    answer: 1,
    explanation:
      'Amazon GuardDuty analyzes logs (CloudTrail, VPC Flow Logs, DNS) to detect unexpected, potentially malicious behavior. Inspector scans for software vulnerabilities.',
  },
  {
    id: 22,
    domain: 'Security & Compliance',
    question: 'Which service provides on-demand access to AWS compliance reports such as SOC and PCI DSS?',
    options: ['AWS Artifact', 'AWS CloudTrail', 'AWS Shield', 'Amazon Macie'],
    answer: 0,
    explanation:
      'AWS Artifact is a self-service portal for on-demand access to AWS security and compliance documentation, including SOC reports and PCI DSS attestations.',
  },
  {
    id: 23,
    domain: 'Security & Compliance',
    question: 'Which service protects web applications from common exploits like SQL injection and cross-site scripting?',
    options: ['AWS Shield', 'AWS WAF', 'AWS KMS', 'Amazon GuardDuty'],
    answer: 1,
    explanation:
      'AWS WAF (Web Application Firewall) filters malicious web requests with rules. AWS Shield defends specifically against DDoS attacks.',
  },
  {
    id: 24,
    domain: 'Security & Compliance',
    question: 'Which AWS service helps defend applications against Distributed Denial of Service (DDoS) attacks, with a Standard tier enabled automatically at no extra cost?',
    options: ['AWS Shield', 'AWS WAF', 'Amazon Inspector', 'AWS Config'],
    answer: 0,
    explanation:
      'AWS Shield Standard provides automatic, free DDoS protection for all AWS customers. Shield Advanced adds enhanced protections and support for a fee.',
  },
  {
    id: 25,
    domain: 'Security & Compliance',
    question: 'Which service lets you create and control the encryption keys used to encrypt your data across AWS services?',
    options: ['AWS KMS', 'AWS IAM', 'Amazon Macie', 'AWS Config'],
    answer: 0,
    explanation:
      'AWS Key Management Service (KMS) creates and manages cryptographic keys and integrates with services like S3, EBS, and RDS to encrypt data.',
  },
  {
    id: 26,
    domain: 'Security & Compliance',
    question: 'Which service uses machine learning to discover and protect sensitive data such as personally identifiable information (PII) stored in Amazon S3?',
    options: ['Amazon Macie', 'Amazon GuardDuty', 'AWS Shield', 'Amazon Inspector'],
    answer: 0,
    explanation:
      'Amazon Macie automatically discovers, classifies, and helps protect sensitive data (like PII) in S3 using machine learning.',
  },
  {
    id: 27,
    domain: 'Security & Compliance',
    question: 'Which service performs automated security assessments to find software vulnerabilities and unintended network exposure in workloads?',
    options: ['Amazon Inspector', 'AWS Artifact', 'Amazon Macie', 'AWS Trusted Advisor'],
    answer: 0,
    explanation:
      'Amazon Inspector continuously scans EC2 instances, container images, and Lambda functions for known vulnerabilities (CVEs) and network reachability issues.',
  },
  {
    id: 28,
    domain: 'Security & Compliance',
    question: 'An application on EC2 needs to read from an S3 bucket. What is the AWS-recommended way to grant this access?',
    options: [
      'Hard-code an IAM user’s access keys in the application',
      'Attach an IAM role to the EC2 instance',
      'Use the root user’s credentials',
      'Make the S3 bucket public',
    ],
    answer: 1,
    explanation:
      'Attaching an IAM role provides temporary, automatically rotated credentials to the instance — no long-lived keys to embed or leak.',
  },
  {
    id: 29,
    domain: 'Security & Compliance',
    question: 'What does the principle of “least privilege” mean when assigning IAM permissions?',
    options: [
      'Give every user administrator access for convenience',
      'Grant only the permissions required to perform a task, and no more',
      'Disable MFA to simplify logins',
      'Use one shared account for the whole team',
    ],
    answer: 1,
    explanation:
      'Least privilege limits each identity to exactly the permissions it needs, reducing the blast radius if credentials are compromised.',
  },
  {
    id: 30,
    domain: 'Security & Compliance',
    question: 'What does multi-factor authentication (MFA) add to an AWS sign-in?',
    options: [
      'A second form of verification in addition to the password',
      'Automatic encryption of all S3 buckets',
      'A discount on the monthly bill',
      'Faster network performance',
    ],
    answer: 0,
    explanation:
      'MFA requires a second factor (such as a code from a device) on top of the password, so a stolen password alone isn’t enough to sign in.',
  },
  {
    id: 31,
    domain: 'Security & Compliance',
    question: 'Which statement about security groups and network ACLs in a VPC is correct?',
    options: [
      'Security groups are stateless; network ACLs are stateful',
      'Security groups are stateful; network ACLs are stateless',
      'Both are stateless',
      'Both operate only at the subnet level',
    ],
    answer: 1,
    explanation:
      'Security groups are stateful (return traffic is automatically allowed) and act at the instance level. Network ACLs are stateless and act at the subnet level.',
  },
  {
    id: 32,
    domain: 'Security & Compliance',
    question: 'Which service records API calls made in your account — capturing who did what, when, and from where — for auditing and governance?',
    options: ['Amazon CloudWatch', 'AWS CloudTrail', 'AWS Config', 'Amazon Inspector'],
    answer: 1,
    explanation:
      'AWS CloudTrail logs account activity and API calls for audit and compliance. CloudWatch focuses on performance metrics and logs; Config tracks resource configuration state.',
  },
  {
    id: 33,
    domain: 'Security & Compliance',
    question: 'Which service continuously assesses, audits, and evaluates the configurations of your AWS resources against desired rules?',
    options: ['AWS Config', 'AWS CloudTrail', 'Amazon GuardDuty', 'AWS Artifact'],
    answer: 0,
    explanation:
      'AWS Config records resource configurations and evaluates them against rules, alerting you when a resource drifts out of compliance.',
  },
  {
    id: 34,
    domain: 'Security & Compliance',
    question: 'Which service helps you securely store, retrieve, and automatically rotate secrets such as database credentials and API keys?',
    options: ['AWS Secrets Manager', 'AWS Artifact', 'Amazon Macie', 'AWS Config'],
    answer: 0,
    explanation:
      'AWS Secrets Manager stores and centrally manages secrets and can rotate them automatically, so credentials aren’t hard-coded in application source.',
  },
  {
    id: 35,
    domain: 'Security & Compliance',
    question: 'In AWS Organizations, what is the purpose of a Service Control Policy (SCP)?',
    options: [
      'To grant new permissions to IAM users directly',
      'To set permission guardrails that define the maximum available permissions for member accounts',
      'To store compliance reports',
      'To monitor for malicious activity',
    ],
    answer: 1,
    explanation:
      'SCPs act as guardrails — they set the maximum permissions accounts can have but do not by themselves grant permissions. Actual access still requires IAM policies.',
  },

  // ============ Cloud Technology & Services ============
  {
    id: 36,
    domain: 'Cloud Technology & Services',
    question: 'Which AWS service provides resizable virtual servers (compute capacity) in the cloud?',
    options: ['Amazon S3', 'Amazon EC2', 'Amazon RDS', 'Amazon VPC'],
    answer: 1,
    explanation:
      'Amazon Elastic Compute Cloud (EC2) provides resizable virtual machines. S3 is storage, RDS is databases, and VPC is networking.',
  },
  {
    id: 37,
    domain: 'Cloud Technology & Services',
    question: 'Which AWS service is a fully managed relational database service?',
    options: ['Amazon DynamoDB', 'Amazon RDS', 'Amazon S3', 'Amazon Redshift'],
    answer: 1,
    explanation:
      'Amazon RDS manages relational databases (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora). DynamoDB is NoSQL, Redshift is a data warehouse, S3 is object storage.',
  },
  {
    id: 38,
    domain: 'Cloud Technology & Services',
    question: 'Which service lets you run code without provisioning or managing servers, paying only for the compute time consumed?',
    options: ['Amazon EC2', 'AWS Lambda', 'AWS Batch', 'Amazon Lightsail'],
    answer: 1,
    explanation:
      'AWS Lambda is serverless compute: you upload code, it runs in response to events, and you pay per request and execution duration — no servers to manage.',
  },
  {
    id: 39,
    domain: 'Cloud Technology & Services',
    question: 'A team needs a managed NoSQL key-value database with single-digit millisecond latency at any scale. Which service fits best?',
    options: ['Amazon RDS', 'Amazon DynamoDB', 'Amazon Aurora', 'Amazon Neptune'],
    answer: 1,
    explanation:
      'Amazon DynamoDB is a fully managed, serverless NoSQL key-value and document database delivering consistent single-digit millisecond performance at virtually any scale.',
  },
  {
    id: 40,
    domain: 'Cloud Technology & Services',
    question: 'Which service is object storage designed for 99.999999999% (eleven nines) durability?',
    options: ['Amazon EBS', 'Amazon S3', 'Amazon EFS', 'Amazon FSx'],
    answer: 1,
    explanation:
      'Amazon Simple Storage Service (S3) stores objects with eleven nines of durability. EBS and EFS are block and file storage respectively.',
  },
  {
    id: 41,
    domain: 'Cloud Technology & Services',
    question: 'Which service provides persistent block storage volumes that attach to a single EC2 instance, like a virtual hard drive?',
    options: ['Amazon S3', 'Amazon EBS', 'Amazon EFS', 'AWS Storage Gateway'],
    answer: 1,
    explanation:
      'Amazon Elastic Block Store (EBS) provides block-level volumes attached to one EC2 instance at a time. EFS is a shared file system; S3 is object storage.',
  },
  {
    id: 42,
    domain: 'Cloud Technology & Services',
    question: 'Which service provides a shared file system that can be mounted concurrently by many Linux EC2 instances?',
    options: ['Amazon EFS', 'Amazon EBS', 'Amazon S3 Glacier', 'AWS Snowball'],
    answer: 0,
    explanation:
      'Amazon Elastic File System (EFS) is an elastic, shared NFS file system that many EC2 instances can mount at the same time.',
  },
  {
    id: 43,
    domain: 'Cloud Technology & Services',
    question: 'Which service is a content delivery network (CDN) that caches content at edge locations to reduce latency for users worldwide?',
    options: ['Amazon Route 53', 'Amazon CloudFront', 'AWS Direct Connect', 'Amazon VPC'],
    answer: 1,
    explanation:
      'Amazon CloudFront caches content at global edge locations, serving users from the nearest point of presence to lower latency. Route 53 is DNS.',
  },
  {
    id: 44,
    domain: 'Cloud Technology & Services',
    question: 'Which service lets you provision a logically isolated section of the AWS Cloud with your own IP ranges, subnets, and route tables?',
    options: ['Amazon VPC', 'AWS Direct Connect', 'Amazon CloudFront', 'AWS Transit Gateway'],
    answer: 0,
    explanation:
      'Amazon Virtual Private Cloud (VPC) is an isolated virtual network where you define IP ranges, subnets, route tables, and gateways.',
  },
  {
    id: 45,
    domain: 'Cloud Technology & Services',
    question: 'Which fully managed service decouples application components by passing messages through a queue?',
    options: ['Amazon SNS', 'Amazon SQS', 'AWS Step Functions', 'Amazon Kinesis'],
    answer: 1,
    explanation:
      'Amazon Simple Queue Service (SQS) is a managed message queue that decouples producers from consumers so components can fail and scale independently. SNS is pub/sub.',
  },
  {
    id: 46,
    domain: 'Cloud Technology & Services',
    question: 'Which service is a publish/subscribe messaging service used to send notifications to many subscribers (email, SMS, SQS, Lambda) at once?',
    options: ['Amazon SQS', 'Amazon SNS', 'Amazon MQ', 'AWS Batch'],
    answer: 1,
    explanation:
      'Amazon Simple Notification Service (SNS) is a pub/sub service that fans out messages to multiple subscribing endpoints. SQS is a point-to-point queue.',
  },
  {
    id: 47,
    domain: 'Cloud Technology & Services',
    question: 'Which service provides infrastructure as code, letting you model and provision AWS resources from templates?',
    options: ['AWS CloudFormation', 'AWS CloudTrail', 'Amazon CloudWatch', 'AWS Config'],
    answer: 0,
    explanation:
      'AWS CloudFormation provisions resources repeatably from JSON/YAML templates. CloudTrail logs API activity, CloudWatch monitors, and Config tracks configuration.',
  },
  {
    id: 48,
    domain: 'Cloud Technology & Services',
    question: 'Which service should you use to physically transfer petabytes of data into AWS when transferring over the network would be too slow?',
    options: ['AWS Snowball', 'AWS DataSync', 'Amazon S3 Transfer Acceleration', 'AWS Storage Gateway'],
    answer: 0,
    explanation:
      'AWS Snowball is a rugged physical appliance you load with data and ship to AWS — ideal for very large migrations where internet transfer would take too long.',
  },
  {
    id: 49,
    domain: 'Cloud Technology & Services',
    question: 'Which service automatically adjusts the number of EC2 instances to match application demand?',
    options: ['Elastic Load Balancing', 'Amazon EC2 Auto Scaling', 'AWS CloudFormation', 'Amazon Route 53'],
    answer: 1,
    explanation:
      'EC2 Auto Scaling adds instances when demand rises and removes them when it falls, keeping performance and cost balanced. Load balancing distributes the traffic.',
  },
  {
    id: 50,
    domain: 'Cloud Technology & Services',
    question: 'Which service distributes incoming application traffic across multiple targets, such as EC2 instances in several Availability Zones?',
    options: ['Amazon Route 53', 'Elastic Load Balancing', 'Amazon CloudFront', 'AWS Global Accelerator'],
    answer: 1,
    explanation:
      'Elastic Load Balancing (ELB) spreads traffic across healthy targets across AZs, improving availability and fault tolerance.',
  },
  {
    id: 51,
    domain: 'Cloud Technology & Services',
    question: 'Which service provides scalable Domain Name System (DNS) and domain registration?',
    options: ['Amazon CloudFront', 'Amazon Route 53', 'Amazon VPC', 'AWS Direct Connect'],
    answer: 1,
    explanation:
      'Amazon Route 53 is a highly available DNS service that also handles domain registration and health-check-based routing.',
  },
  {
    id: 52,
    domain: 'Cloud Technology & Services',
    question: 'Which service is a fully managed, petabyte-scale data warehouse for running analytics with SQL?',
    options: ['Amazon Redshift', 'Amazon DynamoDB', 'Amazon RDS', 'Amazon ElastiCache'],
    answer: 0,
    explanation:
      'Amazon Redshift is a managed data warehouse optimized for large-scale analytical (OLAP) queries. RDS/DynamoDB target transactional workloads.',
  },
  {
    id: 53,
    domain: 'Cloud Technology & Services',
    question: 'Which service lets you run containers without provisioning or managing the underlying servers?',
    options: ['Amazon EC2', 'AWS Fargate', 'Amazon Lightsail', 'AWS Batch'],
    answer: 1,
    explanation:
      'AWS Fargate is a serverless compute engine for containers (with Amazon ECS or EKS) — you run containers without managing EC2 instances.',
  },
  {
    id: 54,
    domain: 'Cloud Technology & Services',
    question: 'A developer wants to deploy a web app and let AWS handle capacity provisioning, load balancing, and scaling automatically. Which service fits best?',
    options: ['AWS Elastic Beanstalk', 'Amazon EC2', 'AWS CloudFormation', 'Amazon VPC'],
    answer: 0,
    explanation:
      'AWS Elastic Beanstalk is a platform-as-a-service: you upload code and it handles provisioning, load balancing, scaling, and health monitoring for you.',
  },
  {
    id: 55,
    domain: 'Cloud Technology & Services',
    question: 'Which service collects metrics, logs, and alarms to monitor the operational health of AWS resources and applications?',
    options: ['AWS CloudTrail', 'Amazon CloudWatch', 'AWS Config', 'AWS Trusted Advisor'],
    answer: 1,
    explanation:
      'Amazon CloudWatch collects metrics and logs and triggers alarms/actions. CloudTrail records API activity; Config tracks resource configuration.',
  },
  {
    id: 56,
    domain: 'Cloud Technology & Services',
    question: 'Which serverless service lets you query data directly in Amazon S3 using standard SQL, with no infrastructure to manage?',
    options: ['Amazon Athena', 'Amazon Redshift', 'Amazon EMR', 'Amazon RDS'],
    answer: 0,
    explanation:
      'Amazon Athena runs standard SQL queries directly against data in S3 and charges per data scanned — fully serverless.',
  },
  {
    id: 57,
    domain: 'Cloud Technology & Services',
    question: 'Which of these is a programmatic way to interact with AWS services from a terminal using commands and scripts?',
    options: ['AWS Management Console', 'AWS Command Line Interface (CLI)', 'AWS Artifact', 'Amazon CloudWatch'],
    answer: 1,
    explanation:
      'The AWS CLI lets you control services from a terminal and automate with scripts. The Console is the web GUI; SDKs embed AWS calls in application code.',
  },
  {
    id: 58,
    domain: 'Cloud Technology & Services',
    question: 'Which service provides a dedicated, private network connection from an on-premises data center to AWS?',
    options: ['AWS Direct Connect', 'Amazon CloudFront', 'AWS VPN CloudHub', 'Amazon Route 53'],
    answer: 0,
    explanation:
      'AWS Direct Connect establishes a dedicated physical connection between your data center and AWS for consistent, private, higher-bandwidth networking.',
  },
  {
    id: 59,
    domain: 'Cloud Technology & Services',
    question: 'Which Amazon S3 storage class is designed for low-cost, long-term data archiving where retrieval times of minutes to hours are acceptable?',
    options: ['S3 Standard', 'S3 Glacier', 'S3 Intelligent-Tiering', 'S3 Standard-IA'],
    answer: 1,
    explanation:
      'The S3 Glacier storage classes offer the lowest storage cost for archival data that is rarely accessed and can tolerate longer retrieval times.',
  },
  {
    id: 60,
    domain: 'Cloud Technology & Services',
    question: 'Which fully managed service is used to build, train, and deploy machine learning models at scale?',
    options: ['Amazon SageMaker', 'Amazon Rekognition', 'Amazon Comprehend', 'AWS Glue'],
    answer: 0,
    explanation:
      'Amazon SageMaker is the end-to-end ML platform for building, training, and deploying models. Rekognition and Comprehend are pre-built AI services for images and text.',
  },

  // ============ Billing, Pricing & Support ============
  {
    id: 61,
    domain: 'Billing, Pricing & Support',
    question: 'Which tool lets you visualize, understand, and manage your AWS costs and usage over time?',
    options: ['AWS Budgets', 'AWS Cost Explorer', 'AWS Pricing Calculator', 'AWS Trusted Advisor'],
    answer: 1,
    explanation:
      'AWS Cost Explorer provides graphs and reports of historical spend plus forecasts. Budgets sets thresholds/alerts; the Pricing Calculator estimates costs before you build.',
  },
  {
    id: 62,
    domain: 'Billing, Pricing & Support',
    question: 'Which service lets you set a custom cost or usage threshold and get alerted when spending is forecast to exceed it?',
    options: ['AWS Cost Explorer', 'AWS Budgets', 'AWS Cost and Usage Report', 'Amazon CloudWatch'],
    answer: 1,
    explanation:
      'AWS Budgets lets you define budgets for cost or usage and receive alerts (email/SNS) when actual or forecasted spend crosses your threshold.',
  },
  {
    id: 63,
    domain: 'Billing, Pricing & Support',
    question: 'Which AWS Support plan is the lowest tier that includes a designated Technical Account Manager (TAM)?',
    options: ['Basic', 'Developer', 'Business', 'Enterprise'],
    answer: 3,
    explanation:
      'A designated TAM comes with the Enterprise Support plan. Enterprise On-Ramp provides a pool of TAMs; Business and below do not include a designated TAM.',
  },
  {
    id: 64,
    domain: 'Billing, Pricing & Support',
    question: 'What is a primary benefit of consolidated billing in AWS Organizations?',
    options: [
      'Each account is billed completely separately with no sharing',
      'Combined usage can reach volume pricing tiers across accounts, with a single bill',
      'It automatically deletes unused resources',
      'It provides free 24/7 phone support to all accounts',
    ],
    answer: 1,
    explanation:
      'Consolidated billing aggregates usage across member accounts so combined volume can reach lower pricing tiers, and you get one bill while still seeing per-account activity.',
  },
  {
    id: 65,
    domain: 'Billing, Pricing & Support',
    question:
      'A company runs a steady, predictable EC2 workload 24/7 and wants the lowest cost with a 1- or 3-year commitment. Which option is most appropriate?',
    options: ['On-Demand Instances', 'Spot Instances', 'Savings Plans or Reserved Instances', 'Dedicated Hosts on demand'],
    answer: 2,
    explanation:
      'For steady, predictable usage, committing to a 1- or 3-year term via Savings Plans or Reserved Instances yields large discounts (up to ~72%) versus On-Demand.',
  },
  {
    id: 66,
    domain: 'Billing, Pricing & Support',
    question:
      'Which service inspects your environment and gives real-time recommendations across cost optimization, performance, security, fault tolerance, and service limits?',
    options: ['AWS Trusted Advisor', 'Amazon Inspector', 'AWS Config', 'AWS Health Dashboard'],
    answer: 0,
    explanation:
      'AWS Trusted Advisor evaluates your account against best-practice checks in five categories and recommends actions. Full checks require Business or Enterprise Support.',
  },
  {
    id: 67,
    domain: 'Billing, Pricing & Support',
    question: 'Which tool helps you estimate the cost of an AWS architecture before you build it?',
    options: ['AWS Pricing Calculator', 'AWS Cost Explorer', 'AWS Budgets', 'AWS Cost and Usage Report'],
    answer: 0,
    explanation:
      'The AWS Pricing Calculator models the cost of a proposed architecture up front. Cost Explorer and the CUR report on spend that has already occurred.',
  },
  {
    id: 68,
    domain: 'Billing, Pricing & Support',
    question: 'Which statement about the AWS Free Tier is correct?',
    options: [
      'Everything on AWS is free for the first year',
      'It includes always-free offers, 12-month free offers, and short-term trials',
      'It is only available to enterprise customers',
      'It requires purchasing a support plan',
    ],
    answer: 1,
    explanation:
      'The Free Tier has three types: always-free (e.g. Lambda’s monthly free requests), 12-months-free (e.g. limited EC2/S3 for new accounts), and short-term free trials.',
  },
  {
    id: 69,
    domain: 'Billing, Pricing & Support',
    question: 'Which AWS Support plan provides 24/7 access to Cloud Support Engineers by phone, email, and chat, plus full Trusted Advisor checks — at the lowest price that includes those?',
    options: ['Basic', 'Developer', 'Business', 'Enterprise'],
    answer: 2,
    explanation:
      'Business Support adds 24/7 phone/email/chat access to engineers and the full set of Trusted Advisor checks. Developer offers only business-hours email to Support Associates.',
  },
  {
    id: 70,
    domain: 'Billing, Pricing & Support',
    question: 'Which pricing principle is true for data transfer with AWS?',
    options: [
      'Inbound data transfer into AWS from the internet is generally free',
      'All data transfer, inbound and outbound, is always free',
      'Inbound data transfer is always charged at a premium',
      'Data transfer within a single Availability Zone is always billed',
    ],
    answer: 0,
    explanation:
      'Data transfer *into* AWS from the internet is typically free; you generally pay for data transferred *out* to the internet and some cross-Region/cross-AZ traffic.',
  },
  {
    id: 71,
    domain: 'Billing, Pricing & Support',
    question: 'A company wants to break down its AWS bill by project and department. Which feature best enables this?',
    options: ['Cost allocation tags', 'Security groups', 'IAM roles', 'Availability Zones'],
    answer: 0,
    explanation:
      'Cost allocation tags label resources (e.g. by project or department) so costs can be grouped and analyzed by those tags in Cost Explorer and billing reports.',
  },
  {
    id: 72,
    domain: 'Billing, Pricing & Support',
    question: 'Which resource is a digital catalog where customers can find, buy, and deploy third-party software that runs on AWS?',
    options: ['AWS Marketplace', 'AWS Artifact', 'AWS Config', 'AWS Trusted Advisor'],
    answer: 0,
    explanation:
      'AWS Marketplace is a curated catalog for discovering, purchasing, and deploying third-party software and services, often billed through your AWS account.',
  },
];

export const AWS_CCP_DOMAINS: QuizDomain[] = [
  'Cloud Concepts',
  'Security & Compliance',
  'Cloud Technology & Services',
  'Billing, Pricing & Support',
];
