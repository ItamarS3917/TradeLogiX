import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SimplePlanForm from '../components/plans/SimplePlanForm';
import { format } from 'date-fns';

const PlanningPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch recent plans
    const fetchPlans = async () => {
      try {
        const response = await axios.get('/api/plans?limit=5');
        setPlans(response.data.items || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="planning-page">
      <div className="page-header">
        <h1>Pre-Market Planning</h1>
      </div>

      <div className="planning-container">
        <div className="plan-form-container">
          <SimplePlanForm />
        </div>

        {plans.length > 0 && (
          <div className="recent-plans">
            <h2>Recent Plans</h2>
            {loading ? (
              <p>Loading recent plans...</p>
            ) : (
              <div className="plans-list">
                {plans.map(plan => (
                  <div key={plan.id} className="plan-card">
                    <div className="plan-header">
                      <h3>{format(new Date(plan.date), 'EEEE, MMMM d, yyyy')}</h3>
                      <span className={`plan-bias ${plan.marketBias.toLowerCase()}`}>
                        {plan.marketBias.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="plan-body">
                      <p><strong>Goal:</strong> {plan.dailyGoal}</p>
                      <p><strong>Mental State:</strong> {plan.mentalState}/10</p>
                      <p><strong>Risk/Trade:</strong> {plan.riskPerTrade}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningPage;
