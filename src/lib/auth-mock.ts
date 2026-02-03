export type UserRole = 'CUSTOMER' | 'AGENT' | 'ADMIN' | 'DELIVERY';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

// Mock database
const USERS: User[] = [
    { id: '1', name: 'John Doe', email: 'customer@example.com', role: 'CUSTOMER' },
    { id: '2', name: 'Agent Smith', email: 'agent@example.com', role: 'AGENT' },
    { id: '3', name: 'Admin', email: 'admin@example.com', role: 'ADMIN' },
];

export async function login(email: string, password: string): Promise<{ user: User | null; error?: string }> {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (password === 'password') {
        const user = USERS.find((u) => u.email === email);
        if (user) return { user };
    }
    return { user: null, error: 'Invalid credentials' };
}

export async function register(name: string, email: string, password: string): Promise<{ user: User | null; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Check existing
    if (USERS.find(u => u.email === email)) {
        return { user: null, error: 'User already exists' };
    }
    const newUser: User = { id: Math.random().toString(), name, email, role: 'CUSTOMER' };
    USERS.push(newUser);
    return { user: newUser };
}
