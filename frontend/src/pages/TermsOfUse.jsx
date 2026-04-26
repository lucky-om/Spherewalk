/* SphereWalk Campus Explorer | v2.0 | Green Node Team */
/* Coded by Lucky */
import React from 'react';
import './PrivacyPolicy.css'; // Reusing the same styling for consistency

export default function TermsOfUse() {
    return (
        <div className="legal-page page">
            <div className="legal-hero">
                <div className="container">
                    <h1>Terms of Use</h1>
                    <p>Last Updated: April 2026</p>
                </div>
            </div>

            <div className="container legal-content">
                <div className="legal-card card">
                    <section>
                        <h2>1. Acceptance of Terms</h2>
                        <p>By using SphereWalk, you agree to these terms. Please read them carefully.</p>
                    </section>

                    <section>
                        <h2>2. Use License</h2>
                        <p>Permission is granted to temporarily use the platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
                    </section>

                    <section>
                        <h2>3. User Conduct</h2>
                        <p>Users are responsible for ensuring their use of AR navigation is safe and does not interfere with real-world obstacles or personnel. Always remain aware of your surroundings.</p>
                    </section>

                    <section>
                        <h2>4. AR Safety Warning</h2>
                        <p><strong>IMPORTANT:</strong> SphereWalk is an experimental AR tool. Do not use while driving, operating machinery, or in hazardous environments. Use of the app is at your own risk.</p>
                    </section>

                    <section>
                        <h2>5. Disclaimer</h2>
                        <p>The materials on SphereWalk are provided on an 'as is' basis. Green Node Team makes no warranties, expressed or implied, and hereby disclaims all other warranties including, without limitation, implied warranties of merchantability.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
