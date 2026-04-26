/* SphereWalk Campus Explorer | v2.0 | Green Node Team */
/* Coded by Lucky */
import React from 'react';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
    return (
        <div className="legal-page page">
            <div className="legal-hero">
                <div className="container">
                    <h1>Privacy Policy</h1>
                    <p>Last Updated: April 2026</p>
                </div>
            </div>
            
            <div className="container legal-content">
                <div className="legal-card card">
                    <section>
                        <h2>1. Introduction</h2>
                        <p>We are committed to protecting your privacy. This policy applies to all data collected via SphereWalk.</p>
                    </section>
                    
                    <section>
                        <h2>2. Information We Collect</h2>
                        <p><strong>Device Data:</strong> We may collect device information such as your device ID, model, and operating system for performance monitoring and AR compatibility.</p>
                        <p><strong>Location Data:</strong> To provide AR navigation, we request access to your device's GPS and compass sensors. This data is processed locally on your device and is not stored on our servers.</p>
                        <p><strong>Chat Logs:</strong> Conversations with our AI Sphere Guide are processed to provide answers. These logs are anonymous and used for service improvement.</p>
                    </section>
                    
                    <section>
                        <h2>3. How We Use Your Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, including the AR navigation accuracy and the AI chatbot responses.</p>
                    </section>
                    
                    <section>
                        <h2>4. Data Security</h2>
                        <p>We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet is 100% secure.</p>
                    </section>
                    
                    <section>
                        <h2>5. Contact Us</h2>
                        <p>If you have questions or comments about this policy, you may contact the Green Node Team at support@spherewalk.campus.io.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
