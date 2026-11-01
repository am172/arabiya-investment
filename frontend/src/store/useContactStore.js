import { create } from 'zustand';

export const useContactStore = create((set) => ({
  selectedPackage: '',
  subject: '',
  subjectKey: 0,
  setSelectedPackage: (name) => set({ selectedPackage: name }),
  setSubject: (subject) => set((state) => ({ subject, subjectKey: state.subjectKey + 1 }))
}));