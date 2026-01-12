import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export type UserRole = 'employee' | 'manager' | 'guru';

export type User = {
  firstName: string;
  lastName: string;
  role: UserRole;
};

type UserContextType = {
  user: User;
  setRole: (role: UserRole) => void;
  displayName: string; // "Фамилия И."
  initials: string; // "ФИ"
  roleLabel: string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const roleLabelMap: Record<UserRole, string> = {
  employee: 'Сотрудник',
  manager: 'Менеджер',
  guru: 'Гуру',
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    firstName: 'Вадим',
    lastName: 'Шаргаев',
    role: 'employee',
  });

  const value = useMemo<UserContextType>(() => {
    const firstInitial = user.firstName.trim().slice(0, 1).toUpperCase();
    const displayName = `${user.lastName} ${firstInitial}.`;
    const initials = `${user.lastName.trim().slice(0, 1).toUpperCase()}${firstInitial}`;
    return {
      user,
      setRole: (role) => setUser((prev) => ({ ...prev, role })),
      displayName,
      initials,
      roleLabel: roleLabelMap[user.role],
    };
  }, [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserContext must be used within UserProvider');
  return ctx;
};


