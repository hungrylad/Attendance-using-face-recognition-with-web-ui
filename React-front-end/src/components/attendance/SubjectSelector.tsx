import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SubjectSelectorProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

export function SubjectSelector({ selectedSubject, onSubjectChange }: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/attended-subjects');
        setSubjects(response.data.subjects || []);
        setError('');
      } catch (error) {
        setError('Failed to load subjects');
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">Select Subject</label>
      <select
        value={selectedSubject}
        onChange={(e) => onSubjectChange(e.target.value)}
        className="w-full p-2 rounded-md border border-gray-300 bg-white/90 text-gray-900 focus:ring-2 focus:ring-teal-500"
      >
        <option value="">Select Subject</option>
        {subjects.map((subject) => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}