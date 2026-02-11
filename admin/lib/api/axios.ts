// Axios client for API calls
// Uses NEXT_PUBLIC_API_BASE_URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://auth.ekowlabs.space/api';

// Interface for API responses
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Helper function to get auth header
const getAuthHeader = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper with auth
async function fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            // Token expired or invalid - redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Fire Safety Tips API functions
export const fireSafetyTipsApi = {
    // GET all tips
    getAll: (): Promise<ApiResponse<any[]>> => {
        return fetchWithAuth<ApiResponse<any[]>>('/fire-safety-tips', {
            method: 'GET',
        });
    },

    // GET tip by ID
    getById: (id: string): Promise<ApiResponse<any>> => {
        return fetchWithAuth<ApiResponse<any>>(`/fire-safety-tips/${id}`, {
            method: 'GET',
        });
    },

    // POST create new tip
    create: (data: { title: string; content: string }): Promise<ApiResponse<any>> => {
        return fetchWithAuth<ApiResponse<any>>('/fire-safety-tips', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // PUT update tip
    update: (id: string, data: { title?: string; content?: string }): Promise<ApiResponse<any>> => {
        return fetchWithAuth<ApiResponse<any>>(`/fire-safety-tips/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // DELETE tip
    delete: (id: string): Promise<ApiResponse<void>> => {
        return fetchWithAuth<ApiResponse<void>>(`/fire-safety-tips/${id}`, {
            method: 'DELETE',
        });
    },
};

// Export API base URL for direct use
export { API_BASE_URL };
