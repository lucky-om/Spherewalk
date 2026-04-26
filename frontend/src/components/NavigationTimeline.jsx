/* Coded by Lucky */
/* SphereWalk Campus Explorer | v1.0 | Green Node Team */
import React, { useState } from 'react';
import MiniMap from './MiniMap';
import './NavigationTimeline.css';

export default function NavigationTimeline({ steps, fromLabel, toLabel, toRoom, onClose, onExpandStep, archPlans }) {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleNext = () => setActiveIndex(prev => Math.min(steps.length - 1, prev + 1));
    const handlePrev = () => setActiveIndex(prev => Math.max(0, prev - 1));

    return (
        <div className="nav-timeline-wrap">
            <div className="nav-timeline-header">
                <div className="nav-tl-title-group">
                    <span className="nav-tl-icon">🛰️</span>
                    <div>
                        <div className="nav-tl-label">JOURNEY TO {toRoom.toUpperCase()}</div>
                        <div className="nav-tl-sub">{fromLabel} → {toLabel}</div>
                    </div>
                </div>
                <button className="nav-close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="nav-timeline-container">
                <div className="nav-timeline-line" />

                {steps.map((step, idx) => {
                    const isActive = idx === activeIndex;
                    const isPassed = idx < activeIndex;
                    const plan = archPlans && step.building ? archPlans[step.building] : null;

                    return (
                        <div
                            key={step.id}
                            className={`nav-timeline-step ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                            onClick={() => setActiveIndex(idx)}
                        >
                            <div className="nav-step-indicator">
                                <div className="nav-step-dot" />
                                {idx < steps.length - 1 && <div className="nav-step-connector" />}
                            </div>

                            <div className="nav-step-content">
                                <div className="nav-step-card">
                                    <div className="nav-step-badge" data-type={step.type}>
                                        {step.type.replace('_', ' ').toUpperCase()}
                                    </div>
                                    <div className="nav-step-title">
                                        <span className="nav-step-icon">{step.icon}</span>
                                        {step.title}
                                    </div>

                                    {isActive && (
                                        <div className="nav-step-details">
                                            <p className="nav-step-desc">{step.description}</p>
                                            <MiniMap
                                                step={step}
                                                isActive={isActive}
                                                onExpand={() => onExpandStep(step)}
                                                plan={plan}
                                                fi={step.floor}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="nav-timeline-footer">
                <div className="nav-progress-text">Step {activeIndex + 1} of {steps.length}</div>
                <div className="nav-controls">
                    <button className="nav-btn-icon" onClick={handlePrev} disabled={activeIndex === 0}>←</button>
                    <button className="nav-btn-icon" onClick={handleNext} disabled={activeIndex === steps.length - 1}>→</button>
                </div>
            </div>
        </div>
    );
}
