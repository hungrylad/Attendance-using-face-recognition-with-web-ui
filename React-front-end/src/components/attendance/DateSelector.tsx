import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DateSelectorProps {
  selectedSubject: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DateSelector({ selectedSubject, selectedDate, onDateChange }: DateSelectorProps) {
  const [dates, setDates] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDates = async () => {
      if (!selectedSubject) return;
      
      try {
        const response = await axios.post(`http://localhost:5000/api/subject-dates`, {
          subject: selectedSubject, // Send subject in the request body
        });
        setDates(response.data.dates || []);
        setError('');
      } catch (error) {
        setError('Failed to load dates');
        console.error('Error fetching dates:', error);
      }
    };

    fetchDates();
  }, [selectedSubject]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">Select Date</label>
      <select
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-full p-2 rounded-md border border-gray-300 bg-white/90 text-gray-900 focus:ring-2 focus:ring-teal-500"
      >
        <option value="">Select Date</option>
        {dates.map((date) => (
          <option key={date} value={date}>
            {new Date(date).toLocaleDateString()}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}