# Practice Exam 2 — Score Card

## Score: 40/50 (80%)

| Q | Correct Answer | Your Answer | Result |
|---|---------------|-------------|--------|
| Q1  | A | A | ✅ |
| Q2  | D | D | ✅ |
| Q3  | C | C | ✅ |
| Q4  | A | A | ✅ |
| Q5  | A | A | ✅ |
| Q6  | A | A | ✅ |
| Q7  | A,B | A,B | ✅ |
| Q8  | D | D | ✅ |
| Q9  | C | C | ✅ |
| Q10 | A | A | ✅ |
| Q11 | C | B | ❌ |
| Q12 | C | C | ✅ |
| Q13 | A | A | ✅ |
| Q14 | B,C | C,E | ❌ |
| Q15 | D | D | ✅ |
| Q16 | B,E | D,E | ❌ |
| Q17 | D,E | D,E | ✅ |
| Q18 | C | C | ✅ |
| Q19 | C | B | ❌ |
| Q20 | A | A,B | ❌ |
| Q21 | C | C | ✅ |
| Q22 | B | B | ✅ |
| Q23 | C | C | ✅ |
| Q24 | D,E | D,E | ✅ |
| Q25 | A | A | ✅ |
| Q26 | B | B | ✅ |
| Q27 | D | D | ✅ |
| Q28 | A | B | ❌ |
| Q29 | C,E | C,E | ✅ |
| Q30 | C | C | ✅ |
| Q31 | C | D | ❌ |
| Q32 | D | D | ✅ |
| Q33 | B,C | B,D | ❌ |
| Q34 | D,E | D,E | ✅ |
| Q35 | C | C | ✅ |
| Q36 | C | C | ✅ |
| Q37 | A,E | A,E | ✅ |
| Q38 | A | A | ✅ |
| Q39 | D | B | ❌ |
| Q40 | B | B | ✅ |
| Q41 | B,C | B,C | ✅ |
| Q42 | A | A | ✅ |
| Q43 | A | A | ✅ |
| Q44 | C | C | ✅ |
| Q45 | B,E | B,E | ✅ |
| Q46 | A,C | B,C | ❌ |
| Q47 | C | C | ✅ |
| Q48 | A | A | ✅ |
| Q49 | B | B | ✅ |
| Q50 | B | B | ✅ |

## Mistakes to Review

| Q | Your Answer | Correct | Explanation |
|---|-------------|---------|-------------|
| Q11 | B | C | Best practice = automate wherever possible, not lock in reservations for testing |
| Q14 | C,E | B,C | "Design for failure" = AZs + ELB. Vertical scaling doesn't help with failure |
| Q16 | D,E | B,E | Customer on S3 = protect data in transit + patch EC2 apps. EC2 host config = AWS |
| Q19 | B | C | Access Keys = programmatic access. Key pairs = SSH to EC2. Different things! |
| Q20 | A,B | A | ElastiCache = in-memory caching only. Single answer question |
| Q28 | B | A | EMR = process large datasets (Hadoop/Spark). MQ = message broker |
| Q31 | D | C | Console = username + password. CLI/SDK = Access Keys |
| Q33 | B,D | B,C | Cloud advantages = no SPOFs + distributed infrastructure |
| Q39 | B | D | CloudTrail = compliance audit trail. CloudEndure = migration tool |
| Q46 | B,C | A,C | RDS customer = schema design + settings. Backups = AWS handles automatically |
