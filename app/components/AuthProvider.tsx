import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#FF6B00',
    colorPrimaryForeground: '#FFFFFF',
    colorBackground: '#15151C',
    colorForeground: '#EAEAE6',
    colorMutedForeground: '#A8A8AE',
    colorInput: '#1E1E26',
    colorInputForeground: '#EAEAE6',
    colorNeutral: '#EAEAE6',
    colorRing: 'rgba(255, 107, 0, 0.42)',
    borderRadius: '8px',
    fontFamily: 'var(--font-inter), sans-serif',
  },
  elements: {
    socialButtonsBlockButton: { color: '#EAEAE6' },
    socialButtonsBlockButtonText: { color: '#EAEAE6' },
    formFieldLabel: { color: '#EAEAE6' },
    dividerText: { color: '#A8A8AE' },
    footerActionText: { color: '#A8A8AE' },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <ClerkProvider appearance={clerkAppearance}>{children}</ClerkProvider>;
}
