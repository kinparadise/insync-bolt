import React, { createContext, useContext, useState } from 'react';

interface User {
  avatar: string | null;
  name: string;
  email: string;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  updateUser: (fields: Partial<User>) => void;
}

const defaultUser: User = {
  avatar: null,
  name: 'Alex',
  email: 'alex@email.com',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser);

  const updateUser = (fields: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...fields }));
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}; 