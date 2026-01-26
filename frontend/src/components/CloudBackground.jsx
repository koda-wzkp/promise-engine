import React from 'react';
import './CloudBackground.css';

/**
 * CloudBackground - Animated cloud layer with sky gradient
 */
const CloudBackground = () => {
  return (
    <div className="cloud-background">
      {/* Sky gradient base */}
      <div className="sky-gradient" />

      {/* Floating clouds */}
      <div className="clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
        <div className="cloud cloud-4"></div>
      </div>
    </div>
  );
};

export default CloudBackground;
