import React, { useState, useEffect } from 'react';
import { UserPlus, Users, ClipboardList, ArrowRightCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './Button';
import { AttendanceViewer } from './attendance/AttendanceViewer';
import { useAppState } from '../context/AppStateContext';
import axios from 'axios';

export function MainActions() {
  const { state, setState } = useAppState();
  const [message, setMessage] = useState('');
  const [finalMessage, setFinalMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messageType, setMessageType] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/load-subjects');
        setSubjects(response.data.subjects || []);
      } catch (error) {
        setMessage('Error loading subjects');
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    if (finalMessage) {
      const timer = setTimeout(() => {
        setFinalMessage('');
        setState(prev => ({ ...prev, showRegistrationInputs: false }));
        setUserId('');
        setName('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [finalMessage]);

  const handleRegisterSubmit = async () => {
    if (!userId || !name) {
      setMessage('Please provide both User ID and Name.');
      return;
    }

    setIsProcessing(true);
    setMessage('Collecting face data for registration, make sure your camera is accessible and look into the camera.');
    setFinalMessage('');
    setMessageType('');

    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        user_id: userId,
        name: name,
      });
      setMessageType('success');
      setFinalMessage(response.data.message || 'Registration data has been collected, consider training the model to complete the registration process.');
    } catch (error) {
      setMessageType('error');
      setFinalMessage(`Error during registration: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsProcessing(false);
      setMessage('');
    }
  };

  const handleToggleInputs = () => {
    setState(prev => ({ ...prev, showRegistrationInputs: !prev.showRegistrationInputs }));
    setMessage('');
    setFinalMessage('');
  };

  const handleMarkAttendance = async () => {
    if (!selectedSubject) {
      setMessage('Please select a subject.');
      return;
    }

    setIsProcessing(true);
    setMessage(`Marking attendance for subject: ${selectedSubject}...`);
    setFinalMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/mark-attendance', {
        subject_name: selectedSubject,
      });
      setMessageType('success');
      setFinalMessage(response.data.message || 'Attendance marked successfully!');
    } catch (error) {
      setMessageType('error');
      setFinalMessage(`Error during marking attendance: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setMessage('');
    }
  };

  if (state.showAttendanceViewer) {
    return (
      <AttendanceViewer
        onBack={() => setState(prev => ({ ...prev, showAttendanceViewer: false }))}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto px-4">
      <Button
        variant="primary"
        size="lg"
        icon={UserPlus}
        className="w-full"
        onClick={handleToggleInputs}
      >
        {state.showRegistrationInputs ? 'Cancel Registration' : 'Register New Student'}
      </Button>

      {message && !finalMessage && (
        <div className="mt-2 text-center text-white">
          {message}
        </div>
      )}

      {state.showRegistrationInputs && !isProcessing && !finalMessage && (
        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border p-2 rounded-md text-sm w-64"
          />
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded-md text-sm w-64"
          />
          <Button
            variant="primary"
            size="md"
            icon={ArrowRightCircle}
            className="w-64"
            onClick={handleRegisterSubmit}
          >
            Submit Registration
          </Button>
        </div>
      )}

      {isProcessing && !finalMessage && (
        <div className="flex flex-col items-center gap-2">
          <div className="loader border-t-4 border-white rounded-full w-16 h-16 animate-spin"></div>
        </div>
      )}

      {finalMessage && (
        <div className={`mt-2 text-center text-white p-4 rounded-md shadow-md
          ${messageType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          <div className="flex items-center justify-center gap-2">
            {messageType === 'success' ? (
              <CheckCircle size={24} />
            ) : (
              <XCircle size={24} />
            )}
            <span>{finalMessage}</span>
          </div>
        </div>
      )}

      <Button
        variant="secondary"
        size="lg"
        icon={Users}
        className="w-full"
        onClick={() => {
          setState(prev => ({ ...prev, isMarkingAttendance: !prev.isMarkingAttendance }));
          setMessage('');
          setFinalMessage('');
        }}
      >
        {state.isMarkingAttendance ? 'Cancel Attendance Marking' : 'Mark Attendance'}
      </Button>

      {state.isMarkingAttendance && (
        <div className="mt-4 flex flex-col items-center gap-4">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border p-2 rounded-md text-sm w-64"
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            size="md"
            icon={ArrowRightCircle}
            className="w-64"
            onClick={handleMarkAttendance}
          >
            Submit Attendance
          </Button>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        icon={ClipboardList}
        className="w-full"
        onClick={() => setState(prev => ({ ...prev, showAttendanceViewer: true }))}
      >
        Show Attendance
      </Button>
    </div>
  );
}