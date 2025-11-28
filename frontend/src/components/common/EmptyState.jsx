import React from 'react';
import { FileX } from 'lucide-react';

const EmptyState = ({ message, icon: Icon = FileX }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon className="h-16 w-16 text-gray-400 mb-4" />
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  );
}

export default EmptyState