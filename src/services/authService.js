import { getUserByLogin, addUser, updateUser, getAllUsers, deleteUser as dbDeleteUser } from './storageService';

const SALT = 'aston_salt_2024';
const SESSION_KEY = 'aston_auth';

const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const setSession  = (user) => localStorage.setItem(SESSION_KEY, JSON.stringify(user));
export const getSession  = ()     => { const r = localStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null; };
export const clearSession = ()    => localStorage.removeItem(SESSION_KEY);

export const loginUser = async (login, password) => {
  const user = await getUserByLogin(login.trim().toLowerCase());
  if (!user) return { ok: false, error: 'Usuário não encontrado.' };
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return { ok: false, error: 'Senha incorreta.' };
  const sessionUser = { id: user.id, login: user.login, name: user.name, number: user.number, role: user.role };
  setSession(sessionUser);
  return { ok: true, user: sessionUser };
};

export const createUser = async (login, password, name, number, role = 'operator') => {
  const normalized = login.trim().toLowerCase();
  const existing = await getUserByLogin(normalized);
  if (existing) return { ok: false, error: 'Login já está em uso.' };
  const passwordHash = await hashPassword(password);
  const user = {
    id: Date.now().toString(),
    login: normalized,
    passwordHash,
    name: name.trim(),
    number: number.trim() || `OP-${String(Date.now()).slice(-3)}`,
    role,
  };
  await addUser(user);
  return { ok: true, user };
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const users = await getAllUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return { ok: false, error: 'Usuário não encontrado.' };
  const currentHash = await hashPassword(currentPassword);
  if (currentHash !== user.passwordHash) return { ok: false, error: 'Senha atual incorreta.' };
  const newHash = await hashPassword(newPassword);
  await updateUser({ ...user, passwordHash: newHash });
  return { ok: true };
};

export const hasAnyUser = async () => {
  const users = await getAllUsers();
  return users.length > 0;
};

export const deleteUser = async (userId) => {
  try {
    await dbDeleteUser(userId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: 'Erro ao deletar usuário' };
  }
};

export { getAllUsers } from './storageService';
