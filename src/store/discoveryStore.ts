import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DiscoverySession,
  DiscoveryStep,
  FreeResponseData,
  ChildhoodChoice,
  HypotheticalChoice,
  SliderData,
  BeforeReport,
} from '@/types/discovery';

interface DiscoveryState {
  session: DiscoverySession | null;
  currentStep: DiscoveryStep;

  initSession: (userId: string) => void;
  setStep: (step: DiscoveryStep) => void;
  saveFreeResponse: (data: FreeResponseData) => void;
  saveChildhood: (data: ChildhoodChoice) => void;
  saveScenario: (data: HypotheticalChoice) => void;
  saveSliders: (data: SliderData[]) => void;
  saveBeforeReport: (report: BeforeReport) => void;
  reset: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set) => ({
      session: null,
      currentStep: 'free-response',

      initSession: (userId) =>
        set({
          session: {
            id: `session_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`,
            userId,
            status: 'in_progress',
            currentStep: 'free-response',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          currentStep: 'free-response',
        }),

      setStep: (step) =>
        set((state) => ({
          currentStep: step,
          session: state.session
            ? { ...state.session, currentStep: step, updatedAt: new Date().toISOString() }
            : null,
        })),

      saveFreeResponse: (data) =>
        set((state) => ({
          session: state.session
            ? { ...state.session, freeResponse: data, updatedAt: new Date().toISOString() }
            : null,
        })),

      saveChildhood: (data) =>
        set((state) => ({
          session: state.session
            ? { ...state.session, childhood: data, updatedAt: new Date().toISOString() }
            : null,
        })),

      saveScenario: (data) =>
        set((state) => ({
          session: state.session
            ? { ...state.session, scenario: data, updatedAt: new Date().toISOString() }
            : null,
        })),

      saveSliders: (data) =>
        set((state) => ({
          session: state.session
            ? { ...state.session, sliderData: data, updatedAt: new Date().toISOString() }
            : null,
        })),

      saveBeforeReport: (report) =>
        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                beforeReport: report,
                status: 'before_complete' as const,
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      reset: () => set({ session: null, currentStep: 'free-response' }),
    }),
    { name: 'aletheia-discovery' }
  )
);
