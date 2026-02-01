
import { Subject, StudentData } from './types';

export const SUBJECTS: Subject[] = [
  { id: 'quran', name: 'قرآنکریم' },
  { id: 'theology', name: 'دنیات' },
  { id: 'dari', name: 'دری' },
  { id: 'pashto', name: 'پشتو' },
  { id: 'english', name: 'لسا ن سوم' },
  { id: 'third_lang', name: 'انگلیسی' },
  { id: 'math', name: 'ریاضی' },
  { id: 'science', name: 'ساینس' },
  { id: 'social', name: 'اجتماعیات' },
  { id: 'arts', name: 'خط / رسم' },
  { id: 'life_skills', name: 'مهارت زندگی' },
  { id: 'pe', name: 'تربیت بدنی' },
  { id: 'ethics', name: 'تهذیب' },
];

const generateMockGrades = () => {
  const grades: { [key: string]: any } = {};
  SUBJECTS.forEach(s => {
    grades[s.id] = { q: 40, a: 60, f: 100 };
  });
  return grades;
};

export const MOCK_STUDENTS: StudentData[] = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  name: i === 0 ? 'احمد' : '',
  fatherName: i === 0 ? 'حامد' : '',
  grandfatherName: i === 0 ? 'افغان' : '',
  asasNumber: i === 0 ? '4455' : '',
  tazkiraNumber: i === 0 ? '1404-1100-4455' : '',
  grades: generateMockGrades(),
  summary: {
    total: { q: 520, a: 780, f: 1300 },
    average: { q: '40.00', a: '60.00', f: '100.00' },
    result: 'ارتقا صنف',
    rank: 'الف',
  },
  attendance: {
    days: { q: 82, a: 103, f: 185 },
    present: { q: 80, a: 90, f: 170 },
    absent: { q: 10, a: 1, f: 11 },
    sick: { q: 1, a: 1, f: 2 },
    leave: { q: 1, a: 1, f: 2 },
  }
}));
