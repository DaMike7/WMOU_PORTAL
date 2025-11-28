import React from 'react';
import { getStatusColor } from '../../utils/helpers';

const Badge = ({ status, text }) =>{
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
        status
      )}`}
    >
      {text || status}
    </span>
  );
}

export default Badge