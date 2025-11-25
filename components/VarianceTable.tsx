import React from 'react';
import { VarianceResult } from '../types';
import { formatCurrency, formatPercent } from '../utils';

interface Props {
  data: VarianceResult[];
  priorLabel?: string;
  currentLabel?: string;
}

const VarianceTable: React.FC<Props> = ({ 
  data, 
  priorLabel = "เดือนก่อน (Prior)", 
  currentLabel = "เดือนปัจจุบัน (Current)" 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-6 py-4 font-bold text-gray-600 w-24">รหัส</th>
            <th scope="col" className="px-6 py-4 font-bold text-gray-600">รายการ</th>
            <th scope="col" className="px-6 py-4 text-right font-bold text-gray-600">
              {priorLabel}
            </th>
            <th scope="col" className="px-6 py-4 text-right font-bold text-gray-600">
              {currentLabel}
            </th>
            <th scope="col" className="px-6 py-4 text-right font-bold text-gray-600">
              เพิ่ม/(ลด)
            </th>
            <th scope="col" className="px-6 py-4 text-right font-bold text-gray-600">
              ร้อยละ
            </th>
            <th scope="col" className="px-6 py-4 text-center font-bold text-gray-600 w-24">
              สถานะ
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr
              key={row.id}
              className={`transition-colors duration-150 ${
                row.isMaterial 
                  ? 'bg-red-50/70 hover:bg-red-100/80' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <td className={`px-6 py-4 font-medium whitespace-nowrap ${row.isMaterial ? 'text-red-900' : 'text-gray-900'}`}>
                {row.accountCode}
              </td>
              <td className={`px-6 py-4 ${row.isMaterial ? 'text-red-900 font-semibold' : 'text-gray-700'}`}>
                {row.accountName}
              </td>
              <td className="px-6 py-4 text-right text-gray-600 font-mono">
                {formatCurrency(row.previousAmount)}
              </td>
              <td className="px-6 py-4 text-right text-gray-900 font-mono font-medium">
                {formatCurrency(row.currentAmount)}
              </td>
              <td
                className={`px-6 py-4 text-right font-mono font-bold ${
                  row.diff > 0
                    ? 'text-emerald-600'
                    : row.diff < 0
                    ? 'text-red-600'
                    : 'text-gray-400'
                }`}
              >
                {row.diff > 0 ? '+' : ''}
                {formatCurrency(row.diff)}
              </td>
              <td
                className={`px-6 py-4 text-right font-mono font-bold ${
                   Math.abs(row.percentChange) > 20 ? 'text-purple-600' : 'text-gray-600'
                }`}
              >
                {row.diff > 0 ? '+' : ''}
                {formatPercent(row.percentChange)}
              </td>
              <td className="px-6 py-4 text-center">
                {row.isMaterial ? (
                  <div className="flex items-center justify-center gap-1 text-red-700 bg-white border border-red-200 shadow-sm px-3 py-1 rounded-full text-xs font-bold animate-pulse-slow">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Check
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VarianceTable;