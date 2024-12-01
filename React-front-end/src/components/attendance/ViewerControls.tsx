import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '../Button';

interface ViewerControlsProps {
  canView: boolean;
  onView: () => void;
}

export function ViewerControls({ canView, onView }: ViewerControlsProps) {
  return (
    <div className="flex justify-end">
      <Button
        variant="primary"
        icon={Eye}
        disabled={!canView}
        onClick={onView}
        className={!canView ? 'opacity-50 cursor-not-allowed' : ''}
      >
        View Attendance
      </Button>
    </div>
  );
}