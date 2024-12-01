import React, { useState } from 'react';
import { SubjectSelector } from './SubjectSelector';
import { DateSelector } from './DateSelector';
import { AttendanceGrid } from './AttendanceGrid';
import { ViewerControls } from './ViewerControls';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../Button';

export function AttendanceViewer({ onBack }: { onBack: () => void }) {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showGrid, setShowGrid] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <Button
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          onClick={onBack}
          className="mr-4"
        >
          Back
        </Button>
        <h2 className="text-2xl font-semibold text-white">View Attendance Records</h2>
      </div>

      <div className="space-y-6">
        <SubjectSelector
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
        />

        {selectedSubject && (
          <DateSelector
            selectedSubject={selectedSubject}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        )}

        <ViewerControls
          canView={!!(selectedSubject && selectedDate)}
          onView={() => setShowGrid(true)}
        />

        {showGrid && (
          <AttendanceGrid
            subject={selectedSubject}
            date={selectedDate}
            onClose={() => setShowGrid(false)}
          />
        )}
      </div>
    </div>
  );
}