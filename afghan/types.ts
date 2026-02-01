
export interface StudentGrades {
  q: string | number; // Quarterly
  a: string | number; // Annual
  f: string | number; // Final
}

export interface StudentData {
  id: number;
  name: string;
  fatherName: string;
  grandfatherName: string;
  asasNumber: string;
  tazkiraNumber: string;
  grades: { [subject: string]: StudentGrades };
  summary: {
    total: StudentGrades;
    average: StudentGrades;
    result: string;
    rank: string;
  };
  attendance: {
    days: StudentGrades;
    present: StudentGrades;
    absent: StudentGrades;
    sick: StudentGrades;
    leave: StudentGrades;
  };
}

export interface Subject {
  id: string;
  name: string;
}
