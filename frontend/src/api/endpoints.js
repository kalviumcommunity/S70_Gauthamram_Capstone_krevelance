export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        SIGNUP: '/auth/signup',
        LOGOUT: '/auth/logout',
        VERIFY_GSTIN: '/auth/verify-gstin',
    },
    DASHBOARD: {
        STATS: '/dashboard/stats',
    },
    ANALYSIS: {
        HISTORY: '/analysis/history',
        UPLOAD: '/analysis/upload',
        RUN: '/analysis/run',
    },
    REPORTS: {
        LIST: '/report/',
        GENERATE: '/report/generate',
        VIEW: (id) => `/report/view/${id}`,
        DOWNLOAD: (id) => `/report/download/${id}`,
    },
    SETTINGS: {
        PROFILE: '/settings/profile',
        DELETE_ACCOUNT: '/settings/delete-account',
        VERIFY_DELETE: '/settings/verify-delete-token',
        UPDATE_PASSWORD: '/settings/update-password',
    },
    NOTIFICATIONS: {
        LIST: '/notifications',
        MARK_READ: (id) => `/notifications/${id}/read`,
    }
};
