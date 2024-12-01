export interface AttendanceRecord {
  ID: string;
  Name: string;
  Subject: string;
  Date: string;
}

export interface AttendanceGridProps {
  subject: string;
  date: string;
  onClose: () => void;
}

export interface DateSelectorProps {
  selectedSubject: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export interface SubjectSelectorProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

export interface ViewerControlsProps {
  canView: boolean;
  onView: () => void;
}