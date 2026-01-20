// Demo data constants for testing
export const DEMO_PRD = `# Product Requirements Document: FinTech Payment Gateway

## Executive Summary
A comprehensive payment processing solution for small to medium businesses, providing secure, fast, and cost-effective transaction processing with advanced fraud detection and multi-currency support.

## Functional Requirements
- FR-001: Process credit card payments with 99.9% uptime
- FR-002: Support multiple payment methods (cards, digital wallets, bank transfers)
- FR-003: Real-time fraud detection and prevention
- FR-004: Multi-currency transaction processing
- FR-005: Merchant dashboard with analytics and reporting

## Non-Functional Requirements
- NFR-001: Process transactions within 2 seconds
- NFR-002: Support 10,000+ concurrent transactions
- NFR-003: PCI DSS Level 1 compliance
- NFR-004: 99.99% availability with disaster recovery

## Success Metrics
- Transaction success rate: >99.5%
- Average processing time: <2 seconds
- Customer satisfaction: >4.5/5
- Monthly recurring revenue growth: >20%

## Risks & Mitigations
- **Risk**: Regulatory compliance changes
  **Mitigation**: Dedicated compliance team and regular audits
- **Risk**: Security breaches
  **Mitigation**: Multi-layer security architecture and penetration testing`;

export const DEMO_LANDING_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PayFlow - Secure Payment Processing</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0; text-align: center; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 20px; font-weight: 700; }
        .hero p { font-size: 1.3rem; margin-bottom: 30px; opacity: 0.9; }
        .cta-button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 1.1rem; transition: transform 0.3s ease; }
        .cta-button:hover { transform: translateY(-2px); }
        .features { padding: 80px 0; background: #f8f9fa; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; margin-top: 50px; }
        .feature { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center; }
        .feature h3 { color: #667eea; margin-bottom: 15px; font-size: 1.5rem; }
        .stats { padding: 60px 0; background: #667eea; color: white; text-align: center; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; }
        .stat h3 { font-size: 3rem; margin-bottom: 10px; }
        .footer { background: #2c3e50; color: white; padding: 40px 0; text-align: center; }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>PayFlow</h1>
            <p>Secure, Fast, and Reliable Payment Processing for Modern Businesses</p>
            <a href="#" class="cta-button">Start Free Trial</a>
        </div>
    </section>

    <section class="features">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 20px;">Why Choose PayFlow?</h2>
            <div class="features-grid">
                <div class="feature">
                    <h3>🔒 Bank-Level Security</h3>
                    <p>PCI DSS Level 1 compliant with advanced fraud detection and real-time monitoring.</p>
                </div>
                <div class="feature">
                    <h3>⚡ Lightning Fast</h3>
                    <p>Process transactions in under 2 seconds with 99.99% uptime guarantee.</p>
                </div>
                <div class="feature">
                    <h3>🌍 Global Reach</h3>
                    <p>Accept payments in 150+ currencies with automatic conversion and settlement.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="stats">
        <div class="container">
            <div class="stats-grid">
                <div class="stat">
                    <h3>99.9%</h3>
                    <p>Transaction Success Rate</p>
                </div>
                <div class="stat">
                    <h3>$2B+</h3>
                    <p>Processed Annually</p>
                </div>
                <div class="stat">
                    <h3>50K+</h3>
                    <p>Happy Merchants</p>
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 PayFlow. All rights reserved. | Secure Payment Processing Made Simple</p>
        </div>
    </footer>
</body>
</html>`;
