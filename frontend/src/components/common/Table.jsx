import React from 'react';

const Table =({ children }) =>{
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  );
}

const TableHeader = ({ children }) =>{
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  );
}

const TableHeaderCell = ({ children })=> {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
}

const TableBody = ({ children }) => {
  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
}

const TableRow = ({ children, onClick }) => {
  return (
    <tr
      onClick={onClick}
      className={onClick ? 'table-row cursor-pointer' : 'table-row'}
    >
      {children}
    </tr>
  );
}

const TableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}>
      {children}
    </td>
  );
}

export default {TableBody,TableCell,TableHeader,TableHeaderCell,TableRow,Table}