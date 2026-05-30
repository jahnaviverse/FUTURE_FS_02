// api.js - Complete Working Version
const API_BASE = (window.CRM_CONFIG && window.CRM_CONFIG.API_BASE) 
    ? `${window.CRM_CONFIG.API_BASE}/api` 
    : "https://future-fs-02-su2g.onrender.com";


console.log("API_BASE URL:", API_BASE);

async function request(endpoint, options = {}) {
    const token = localStorage.getItem("crm_token");
    
    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers,
            ...options
        });

        if (response.status === 401) {
            localStorage.removeItem("crm_token");
            localStorage.removeItem("crm_user");
            if (!window.location.pathname.includes("index.html")) {
                window.location.href = "index.html";
            }
            throw new Error("Session expired. Please login again.");
        }

        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error("Server returned invalid response");
        }

        if (!response.ok) {
            throw new Error(data.message || "Request failed");
        }

        return data;
    } catch (error) {
        console.error("API request error:", error);
        throw error;
    }
}

const API = {
    login(email, password) {
        return request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
    },
    
    getMe() {
        return request("/api/auth/me");
    },
    
    listLeads(params = {}) {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });
        const qs = queryParams.toString();
        return request(`/api/leads${qs ? `?${qs}` : ""}`);
    },

    getLead(id) {
        return request(`/api/leads/${id}`);
    },

    createLead(body) {
        return request("/api/leads", {
            method: "POST",
            body: JSON.stringify(body)
        });
    },

    updateLead(id, body) {
        return request(`/api/leads/${id}`, {
            method: "PUT",
            body: JSON.stringify(body)
        });
    },

    deleteLead(id) {
        return request(`/api/leads/${id}`, {
            method: "DELETE"
        });
    },
    
    stats() {
        return request("/api/leads/stats/summary");
    }
};

window.API = API;
console.log("API.js loaded");