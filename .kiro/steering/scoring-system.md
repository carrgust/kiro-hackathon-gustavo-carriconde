# Scoring System

## Overview
Multi-stage scoring system with quality gates. Each stage must pass its threshold before unlocking the next.

## Stage Progression
| Stage | Threshold | Min Count | Unlocks |
|-------|-----------|-----------|---------|
| Hypothesis Validation | 80% | 5 items | Problem Quality |
| Problem Quality | 70% | - | Solution Quality |
| Solution Quality | 70% | - | Requirements |
| Requirements Quality | 75% | - | PRD |
| PRD Quality | 80% | - | DNA |
| DNA Readiness | 85% | - | Build Phase |

## Scoring Criteria

### Hypothesis-Fact Score (0-100)
A hypothesis becomes a fact when confidence ≥ 80%.
- **Type**: `problem` or `solution` (which column it belongs to)
- **State**: `hypothesis` (< 80%) or `fact` (≥ 80%)
- **Confidence**: Based on web research evidence quality
- **Sources**: URLs supporting the validation

### Problem Quality (0-100)
Score each criterion 0-25, sum for total:
- **Severity**: How painful is the problem? (Critical=25, Major=20, Moderate=15, Minor=10, Trivial=5)
- **Frequency**: How often does it occur? (Daily=25, Weekly=20, Monthly=15, Quarterly=10, Rarely=5)
- **Market Size**: How many people affected? (>1M=25, 100K-1M=20, 10K-100K=15, 1K-10K=10, <1K=5)
- **Urgency**: How soon needs solving? (Immediate=25, <1mo=20, <6mo=15, <1yr=10, Someday=5)

### Solution Quality (0-100)
Score each criterion 0-25, sum for total:
- **Feasibility**: Can we build it? (Easy=25, Moderate=20, Hard=15, Very Hard=10, Near Impossible=5)
- **Differentiation**: How unique vs competitors? (Novel=25, Significant=20, Some=15, Minor=10, None=5)
- **Scalability**: Can it grow? (Unlimited=25, High=20, Medium=15, Limited=10, None=5)
- **Problem Fit**: Does it solve the problem? (Perfect=25, Strong=20, Good=15, Partial=10, Weak=5)

### Requirements Quality (0-100)
Composite of Functional (FR) and Non-Functional (NFR) requirements.

**Functional Requirements (0-100):**
Score each criterion 0-33, sum for total:
- **Completeness**: Are all features defined?
- **Clarity**: Are requirements unambiguous?
- **Testability**: Can each requirement be verified?

**Non-Functional Requirements (0-100):**
Score each criterion 0-25, sum for total:
- **Performance**: Response time, throughput defined?
- **Security**: Auth, encryption, data protection defined?
- **Scalability**: Load handling, growth capacity defined?
- **Reliability**: Uptime, recovery, fault tolerance defined?

**Total**: (FR.total + NFR.total) / 2

### PRD Quality (0-100)
Score each criterion 0-25, sum for total:
- **Executive Summary**: Clear problem/solution statement?
- **Requirements**: Complete functional/non-functional specs?
- **Metrics**: Success criteria defined?
- **Risks**: Risks identified with mitigations?

### DNA Quality (Composite)
Weighted average of all previous scores:
- Hypothesis-Fact Avg: 15%
- Problem Quality Avg: 20%
- Solution Quality Avg: 20%
- Requirements Quality: 20%
- PRD Quality: 25%
