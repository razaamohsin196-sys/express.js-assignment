import { User } from '../types';

export const mockUsers: Map<number, User> = new Map([
  [1, { id: 1, name: 'John Doe', email: 'john@example.com' }],
  [2, { id: 2, name: 'Jane Smith', email: 'jane@example.com' }],
  [3, { id: 3, name: 'Alice Johnson', email: 'alice@example.com' }],
]);

export function getNextUserId(): number {
  const ids = Array.from(mockUsers.keys());
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

export function userExists(id: number): boolean {
  return mockUsers.has(id);
}

export function getUserById(id: number): User | undefined {
  return mockUsers.get(id);
}

export function addUser(user: User): void {
  mockUsers.set(user.id, user);
}

export function getAllUsers(): User[] {
  return Array.from(mockUsers.values());
}