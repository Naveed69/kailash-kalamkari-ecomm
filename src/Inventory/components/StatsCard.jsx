import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, percentage, isPositive }) => {
  return (
    <div className="stats-card">
      <div className="stats-card-info">
        <h4>{title}</h4>
        <p>{value}</p>
      </div>
      <div className={`stats-card-percentage ${isPositive ? 'positive' : 'negative'}`}>
        {percentage}
      </div>
    </div>
  );
};

export default StatsCard;