export interface EmployeeUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Employee {
  id: number;
  userId: number;
  employeeCode: string;
  phone?: string;
  department?: string;
  designation?: string;
  dateOfJoining?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  status: 'active' | 'inactive';
  user: EmployeeUser;
}