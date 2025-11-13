// Centralised API utilities for interacting with the backend services

export interface Movie {
	id: string;
	title: string;
	genre?: string;
	rating?: number;
	posterImage?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface MovieFormData {
	title: string;
	genre?: string;
	rating?: number;
	posterImage?: string;
}

export interface AuthResponse {
	token: string;
	email: string;
	userId: string;
	role: string;
	expiresAt: string;
}

export interface UserProfile {
	userId: string;
	email: string;
	role: string;
	createdAt: string;
}

export interface ApiError {
	message?: string;
	errors?: Record<string, string[]>;
}

declare global {
	interface Window {
		__ENV__?: {
			VITE_API_URL?: string;
		};
	}
}

function getApiUrl(): string {
	if (typeof window !== 'undefined' && window.__ENV__?.VITE_API_URL) {
		return window.__ENV__.VITE_API_URL;
	}
	return (import.meta as any).env?.VITE_API_URL || 'http://localhost:6124/api';
}

const API_BASE_URL = getApiUrl();
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
	authToken = token;
}

function buildUrl(path: string): string {
	if (path.startsWith('http')) {
		return path;
	}
	return `${API_BASE_URL}${path}`;
}

async function request<T>(
	path: string,
	options: RequestInit = {},
	requiresAuth: boolean = false
): Promise<T> {
	const headers = new Headers(options.headers ?? {});
	const method = (options.method ?? 'GET').toUpperCase();
	const isFormData = options.body instanceof FormData;

	if (requiresAuth) {
		if (!authToken) {
			throw new Error('Authentication required');
		}
		headers.set('Authorization', `Bearer ${authToken}`);
	} else if (authToken && !headers.has('Authorization')) {
		headers.set('Authorization', `Bearer ${authToken}`);
	}

	if (!isFormData && method !== 'GET' && method !== 'HEAD' && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}

	const response = await fetch(buildUrl(path), {
		...options,
		headers,
	});

	if (!response.ok) {
		let errorMessage = `Request failed with status ${response.status}`;
		try {
			const errorBody = await response.json();
			if (errorBody?.message) {
				errorMessage = errorBody.message;
			}
		} catch {
			// ignore parse errors
		}
		throw new Error(errorMessage);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	const contentType = response.headers.get('content-type') ?? '';
	if (contentType.includes('application/json')) {
		return (await response.json()) as T;
	}

	const text = await response.text();
	return text as unknown as T;
}

// Authentication ------------------------------------------------------------
export async function registerUser(email: string, password: string, confirmPassword: string): Promise<AuthResponse> {
	const body = JSON.stringify({ email, password, confirmPassword });
	return request<AuthResponse>('/auth/register', {
		method: 'POST',
		body,
	});
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
	const body = JSON.stringify({ email, password });
	return request<AuthResponse>('/auth/login', {
		method: 'POST',
		body,
	});
}

export async function getCurrentUser(): Promise<UserProfile> {
	return request<UserProfile>('/auth/me', {}, true);
}

// Movies -----------------------------------------------------------------
export async function getMovies(
	search?: string,
	genre?: string,
	rating?: number
): Promise<Movie[]> {
	const params = new URLSearchParams();
	if (search) params.set('search', search);
	if (genre && genre !== 'All') params.set('genre', genre);
	if (rating) params.set('rating', String(rating));

	const queryString = params.toString();
	return request<Movie[]>(`/movies${queryString ? `?${queryString}` : ''}`);
}

export async function getMovieById(id: string): Promise<Movie> {
	return request<Movie>(`/movies/${id}`);
}

export async function createMovie(data: MovieFormData): Promise<Movie> {
	const body = JSON.stringify(data);
	return request<Movie>('/movies', {
		method: 'POST',
		body,
	});
}

export async function updateMovie(id: string, data: MovieFormData): Promise<Movie> {
	const body = JSON.stringify(data);
	return request<Movie>(`/movies/${id}`, {
		method: 'PUT',
		body,
	});
}

export async function deleteMovie(id: string): Promise<void> {
	await request<void>(`/movies/${id}`, {
		method: 'DELETE',
	});
}

export async function uploadImage(file: File): Promise<{ url: string }> {
	const formData = new FormData();
	formData.append('file', file);

	return request<{ url: string }>('/upload', {
		method: 'POST',
		body: formData,
	});
}
