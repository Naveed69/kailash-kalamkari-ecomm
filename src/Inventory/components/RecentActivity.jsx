import React from 'react';
import './RecentActivity.css';

const RecentActivity = ({ data }) => {
  return (
    <div className="recent-activity">
      <h3>Recent Activity</h3>
      <div className="activity-table-container">
        <table className="activity-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Activity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.activity}</td>
                <td>{item.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivity;
