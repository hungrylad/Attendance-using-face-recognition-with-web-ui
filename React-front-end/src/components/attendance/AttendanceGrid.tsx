import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { Button } from '../Button';
import { AttendanceGridProps, AttendanceRecord } from './types';

export function AttendanceGrid({ subject, date, onClose }: AttendanceGridProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          'http://localhost:5000/api/subject-attendance',
          {
            subject,
            date,
          }
        );
        // Ensure we always have an array of records
        const attendanceData = Array.isArray(response.data) 
          ? response.data 
          : [response.data];
        
        setRecords(attendanceData);
        setError('');
      } catch (error) {
        setError('Failed to load attendance records');
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    if (subject && date) {
      fetchAttendance();
    }
  }, [subject, date]);

  if (loading) {
    return (
      <div className="mt-6 p-6 bg-white/95 rounded-lg shadow-lg animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={`loading-${n}`} className="h-6 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white/95 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-teal-600 text-white flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Attendance for {subject} - {new Date(date).toLocaleDateString()}
        </h3>
        <Button
          variant="secondary"
          size="sm"
          icon={X}
          onClick={onClose}
        >
          Close
        </Button>
      </div>

      <div className="p-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={`${record.ID}-${record.Date}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.ID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.Name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.Subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(record.Date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}