/* SphereWalk Campus Explorer | Copyright © 2026 Lucky. All Rights Reserved. */
import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const YEAR = new Date().getFullYear();

export default function PrivacyPolicy() {
    return (
        <div className="legal-page page">
            <div className="legal-hero">
                <div className="container">
                    <div className="legal-badge">📋 Legal</div>
                    <h1>Privacy Policy</h1>
                    <p className="legal-meta">Effective Date: April 27, 2026 &nbsp;·&nbsp; Last Updated: April 27, 2026</p>
                    <p className="legal-owner">SphereWalk Campus Explorer &nbsp;|&nbsp; Copyright © {YEAR} Lucky. All Rights Reserved.</p>
                </div>
            </div>

            <div className="container legal-content">
                <div className="legal-card card">

                    <section>
                        <h2>1. Introduction</h2>
                        <p>Welcome to <strong>SphereWalk Campus Explorer</strong> ("SphereWalk", "we", "our", or "us"), a proprietary smart campus navigation platform developed and owned exclusively by <strong>Lucky</strong>.</p>
                        <p>This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, including the AR navigation system, 360° virtual tours, AI campus assistant, and 3D campus map. By using SphereWalk, you agree to the terms of this Privacy Policy.</p>
                    </section>

                    <section>
                        <h2>2. Information We Collect</h2>
                        <h3>2.1 Location Data</h3>
                        <p>To provide AR Navigation and GPS-based wayfinding, we request access to your device's <strong>GPS location sensors</strong> and <strong>compass/gyroscope</strong>. This data is processed <em>entirely on your device</em> and is <strong>not transmitted to or stored on our servers</strong>. Location data is only active while AR Navigation is running.</p>

                        <h3>2.2 Camera Access</h3>
                        <p>The AR Navigation feature requires access to your device's camera to display the real-world video feed overlaid with navigation arrows and AI object detection. <strong>We do not record, capture, or transmit any video or images</strong> from your camera. All camera processing happens locally on your device in real time.</p>

                        <h3>2.3 Chat & AI Query Data</h3>
                        <p>When you interact with our AI Campus Assistant, your text queries are sent to our backend server and processed via the <strong>Google Gemini API</strong>. Queries are used solely to generate relevant responses. We may log anonymized query statistics (search terms, frequency) for improving the AI knowledge base. No personally identifiable information is stored.</p>

                        <h3>2.4 Usage & Analytics Data</h3>
                        <p>We collect anonymous usage data including search queries entered into the campus assistant, pages visited, and navigation destinations selected. This information helps us improve our platform. No personal identifiers (name, email, IP address) are stored.</p>

                        <h3>2.5 Admin Authentication</h3>
                        <p>If you are an authorized administrator, your login credentials are verified against securely stored, bcrypt-hashed credentials. JWT (JSON Web Tokens) are used for session management with an 8-hour expiry. Credentials are never stored in plain text.</p>
                    </section>

                    <section>
                        <h2>3. How We Use Your Information</h2>
                        <ul>
                            <li>To provide, operate, and maintain SphereWalk services</li>
                            <li>To enable real-time AR navigation and GPS wayfinding</li>
                            <li>To power the AI campus assistant with relevant responses</li>
                            <li>To improve the accuracy of navigation and AI responses</li>
                            <li>To monitor system performance and prevent abuse</li>
                            <li>To enforce our Terms of Use and protect user safety</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Data Sharing & Third Parties</h2>
                        <p>We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We use the following third-party services which have their own privacy policies:</p>
                        <ul>
                            <li><strong>Google Gemini API</strong> — AI text generation (Google Privacy Policy applies)</li>
                            <li><strong>Vercel</strong> — Frontend hosting (Vercel Privacy Policy applies)</li>
                            <li><strong>Render</strong> — Backend hosting (Render Privacy Policy applies)</li>
                            <li><strong>TensorFlow.js / COCO-SSD</strong> — Client-side ML (processed entirely in your browser)</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Data Security</h2>
                        <p>We implement industry-standard security measures including:</p>
                        <ul>
                            <li>HTTPS encryption for all data in transit</li>
                            <li>bcrypt hashing (cost factor 12) for stored credentials</li>
                            <li>JWT authentication with short-lived tokens</li>
                            <li>HTTP security headers via Helmet.js</li>
                            <li>Content Security Policy (CSP) enforcement</li>
                            <li>Rate limiting on all API endpoints</li>
                        </ul>
                        <p>Despite these measures, no internet transmission is 100% secure. We cannot guarantee absolute security of data transmitted to our platform.</p>
                    </section>

                    <section>
                        <h2>6. Cookies</h2>
                        <p>SphereWalk uses <strong>localStorage</strong> (not cookies) to save your chat history and theme preferences on your device. This data never leaves your device and can be cleared by clearing your browser's site data. We do not use third-party tracking cookies or advertising cookies.</p>
                    </section>

                    <section>
                        <h2>7. Children's Privacy</h2>
                        <p>SphereWalk is designed for use by students and staff of SCET Surat. The platform is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
                    </section>

                    <section>
                        <h2>8. Your Rights</h2>
                        <p>Since we collect minimal personal data, most of what you see is processed locally on your device. You may:</p>
                        <ul>
                            <li>Revoke camera/GPS permissions at any time via your browser or device settings</li>
                            <li>Clear your chat history at any time from within the AI Assistant</li>
                            <li>Clear localStorage to remove saved preferences</li>
                        </ul>
                    </section>

                    <section>
                        <h2>9. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy from time to time. Changes will be reflected by updating the "Last Updated" date above. Continued use of SphereWalk after changes constitutes acceptance of the updated policy.</p>
                    </section>

                    <section>
                        <h2>10. Contact</h2>
                        <p>For privacy-related questions or concerns, contact the developer:</p>
                        <ul>
                            <li><strong>Developer:</strong> Lucky</li>
                            <li><strong>GitHub:</strong> <a href="https://github.com/lucky-om" target="_blank" rel="noreferrer">github.com/lucky-om</a></li>
                        </ul>
                    </section>

                    <div className="legal-footer-note">
                        <p>© {YEAR} Lucky. All Rights Reserved. &nbsp;·&nbsp; <Link to="/terms">Terms of Use</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
