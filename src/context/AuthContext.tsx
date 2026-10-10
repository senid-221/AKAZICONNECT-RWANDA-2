import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile, CVDocument, ApplicationRecord, PaymentTransaction, BrandingConfig } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  cvs: CVDocument[];
  branding: BrandingConfig | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; name: string; phone?: string; district?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  refreshCVs: () => Promise<void>;
  addCV: (cvData: { fileName: string; fileType?: string; fileSize?: number; fileDataUrl?: string; notes?: string }) => Promise<CVDocument | null>;
  deleteCV: (cvId: string) => Promise<boolean>;
  setDefaultCV: (cvId: string) => Promise<boolean>;
  refreshBranding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cvs, setCvs] = useState<CVDocument[]>([]);
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('akazi_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Load initial branding
  const refreshBranding = async () => {
    try {
      const res = await fetch('/api/branding');
      if (res.ok) {
        const data = await res.json();
        setBranding(data.branding);
      }
    } catch (e) {
      console.warn('Failed to fetch branding', e);
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
      } else if (res.status === 401) {
        logout();
      }
    } catch (e) {
      console.warn('Failed to refresh profile', e);
    }
  };

  const refreshCVs = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/cvs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCvs(data.cvs || []);
      }
    } catch (e) {
      console.warn('Failed to refresh CVs', e);
    }
  };

  useEffect(() => {
    refreshBranding();
    if (token) {
      Promise.all([refreshProfile(), refreshCVs()]).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      localStorage.setItem('akazi_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      await refreshCVs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const register = async (regData: { email: string; password: string; name: string; phone?: string; district?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      localStorage.setItem('akazi_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      await refreshCVs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('akazi_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setCvs([]);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const resData = await res.json();
        setUser(resData.user);
        setProfile(resData.user.profile);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const addCV = async (cvData: { fileName: string; fileType?: string; fileSize?: number; fileDataUrl?: string; notes?: string }) => {
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/cvs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cvData),
      });
      if (res.ok) {
        const data = await res.json();
        await refreshCVs();
        return data.cv;
      }
      return null;
    } catch {
      return null;
    }
  };

  const deleteCV = async (cvId: string) => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/auth/cvs/${cvId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await refreshCVs();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const setDefaultCV = async (cvId: string) => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/auth/cvs/${cvId}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await refreshCVs();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        cvs,
        branding,
        token,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
        refreshCVs,
        addCV,
        deleteCV,
        setDefaultCV,
        refreshBranding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
