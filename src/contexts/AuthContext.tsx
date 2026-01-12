import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type UserRole = 'employee' | 'manager' | 'guru';

export type AuthUser = {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  displayName: string | null; // "Фамилия И."
  initials: string | null; // "ФИ"
  roleLabel: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  showTwoFactorNudge: boolean;
  dismissTwoFactorNudge: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleLabelMap: Record<UserRole, string> = {
  employee: 'Сотрудник',
  manager: 'Менеджер',
  guru: 'Гуру',
};

function guessUserByEmail(email: string): Pick<AuthUser, 'firstName' | 'lastName'> {
  const lower = email.toLowerCase();
  if (lower.includes('shargaev')) return { firstName: 'Вадим', lastName: 'Шаргаев' };
  if (lower.includes('ivanov')) return { firstName: 'Иван', lastName: 'Иванов' };
  if (lower.includes('petrova')) return { firstName: 'Анна', lastName: 'Петрова' };
  return { firstName: 'Демо', lastName: 'Пользователь' };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>({
    email: 'v.shargaev@corp.example',
    ...guessUserByEmail('v.shargaev@corp.example'),
    role: 'employee',
  });
  const [showTwoFactorNudge, setShowTwoFactorNudge] = useState(false);

  const value = useMemo<AuthContextType>(() => {
    const isAuthenticated = Boolean(user);
    const firstInitial = user?.firstName.trim().slice(0, 1).toUpperCase() ?? null;
    const displayName = user ? `${user.lastName} ${firstInitial}.` : null;
    const initials = user ? `${user.lastName.trim().slice(0, 1).toUpperCase()}${firstInitial}` : null;
    const roleLabel = user ? roleLabelMap[user.role] : null;

    return {
      isAuthenticated,
      user,
      displayName,
      initials,
      roleLabel,
      login: async (email: string, _password: string) => {
        // TODO: replace mock login with real API
        await delay(500);
        const guessed = guessUserByEmail(email);
        setUser({ email, ...guessed, role: 'employee' });
        setShowTwoFactorNudge(true);
      },
      logout: () => {
        // TODO: replace mock logout with real API
        setUser(null);
        setShowTwoFactorNudge(false);
      },
      setRole: (role: UserRole) => {
        setUser((prev) => (prev ? { ...prev, role } : prev));
      },
      showTwoFactorNudge,
      dismissTwoFactorNudge: () => setShowTwoFactorNudge(false),
    };
  }, [user, showTwoFactorNudge]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


