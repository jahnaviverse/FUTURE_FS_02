const API_BASE = "http://localhost:5006/api";

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  let data = {};

  try {
    data = await res.json();
  } catch {
    throw new Error("Server returned invalid response");
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

const API = {
  listLeads(params = {}) {
    const qs = new URLSearchParams(params).toString();

    return request(`/leads${qs ? `?${qs}` : ""}`);
  },

  getLead(id) {
    return request(`/leads/${id}`);
  },

  createLead(body) {
    return request("/leads", {
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  updateLead(id, body) {
    return request(`/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    });
  },

  deleteLead(id) {
    return request(`/leads/${id}`, {
      method: "DELETE"
    });
  }
};

window.API = API;