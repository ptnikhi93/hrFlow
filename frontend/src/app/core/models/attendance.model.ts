export interface Attendance {
  id: number;
  employeeId: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: string | null; // MySQL decimals arrive as strings, e.g. "9.00"
  status: 'present' | 'half_day' | 'absent' | 'leave';
}

export interface TodayResponse {
  date: string;
  attendance: Attendance | null;
}

export interface AttendanceSummary {
  presentDays: number;
  halfDays: number;
  totalWorkHours: number;
}

export interface MyAttendanceResponse {
  month: string;
  summary: AttendanceSummary;
  records: Attendance[];
}