// leads.js - Complete Working Version
let currentLeads = [];

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("crm_token");
    if (!token) {
        window.location.href = "../index.html";
        return;
    }
    
    await loadLeadsFromAPI();
    setupEventListeners();
    setupModalEvents();
});

async function loadLeadsFromAPI() {
    try {
        const response = await API.listLeads();
        currentLeads = response.leads || response.data || response;
        
        if (!Array.isArray(currentLeads)) {
            currentLeads = [];
        }
        
        renderLeadsTable();
        console.log("Leads loaded:", currentLeads.length);
    } catch (error) {
        console.error("Error loading leads:", error);
        showNotification("Failed to load leads", "error");
        currentLeads = [];
        renderLeadsTable();
    }
}

async function saveLeadToAPI(leadData) {
    const saveBtn = document.getElementById("saveLead");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    
    try {
        if (leadData.id) {
            await API.updateLead(leadData.id, leadData);
            showNotification("Lead updated successfully!", "success");
        } else {
            leadData.createdAt = new Date().toISOString();
            await API.createLead(leadData);
            showNotification("Lead created successfully!", "success");
        }
        
        await loadLeadsFromAPI();
        closeModalWindow();
        
        // Tell dashboard to refresh
        localStorage.setItem('leads_updated', Date.now().toString());
        
    } catch (error) {
        console.error("Error saving lead:", error);
        showNotification(error.message || "Failed to save lead", "error");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Lead";
    }
}

async function deleteLeadFromAPI(id) {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    
    try {
        await API.deleteLead(id);
        await loadLeadsFromAPI();
        showNotification("Lead deleted successfully!", "success");
        
        // Tell dashboard to refresh
        localStorage.setItem('leads_updated', Date.now().toString());
        
    } catch (error) {
        console.error("Error deleting lead:", error);
        showNotification("Failed to delete lead", "error");
    }
}

function renderLeadsTable() {
    const tbody = document.getElementById("leadsBody");
    if (!tbody) return;
    
    const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const statusFilter = document.getElementById("statusFilter")?.value || "";
    
    let filteredLeads = currentLeads.filter(lead => {
        const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.toLowerCase();
        const matchesSearch = !searchTerm || 
            fullName.includes(searchTerm) ||
            (lead.email || "").toLowerCase().includes(searchTerm) ||
            (lead.company || "").toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || (lead.status || "New") === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    const emptyState = document.getElementById("emptyState");
    if (filteredLeads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;">No leads found</td></tr>';
        if (emptyState) emptyState.hidden = false;
        return;
    }
    
    if (emptyState) emptyState.hidden = true;
    
    tbody.innerHTML = filteredLeads.map(lead => {
        const leadId = lead._id || lead.id;
        return `
        <tr>
            <td><strong>${escapeHtml(lead.firstName || '')} ${escapeHtml(lead.lastName || '')}</strong></td>
            <td>${escapeHtml(lead.email || '-')}</td>
            <td>${escapeHtml(lead.source || '-')}</td>
            <td><span class="status-badge">${escapeHtml(lead.status || 'New')}</span></td>
            <td>${escapeHtml(lead.company || '-')}</td>
            <td>${escapeHtml(lead.phone || '-')}</td>
            <td>${lead.followUpDate ? formatDate(lead.followUpDate) : '-'}</td>
            <td>
                <button class="icon-btn edit-lead" data-id="${leadId}" title="Edit">✎</button>
                <button class="icon-btn delete-lead" data-id="${leadId}" title="Delete">🗑</button>
            </td>
        </tr>`;
    }).join("");
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-lead').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const lead = currentLeads.find(l => (l._id || l.id).toString() === id);
            if (lead) openModal(lead);
        });
    });
    
    document.querySelectorAll('.delete-lead').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            deleteLeadFromAPI(id);
        });
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    
    if (searchInput) searchInput.addEventListener("input", () => renderLeadsTable());
    if (statusFilter) statusFilter.addEventListener("change", () => renderLeadsTable());
}

function setupModalEvents() {
    const modal = document.getElementById("leadModal");
    const closeModalBtn = document.getElementById("closeModal");
    const cancelModalBtn = document.getElementById("cancelModal");
    const addLeadBtn = document.getElementById("addLeadBtn");
    
    if (cancelModalBtn) {
        cancelModalBtn.onclick = function() {
            closeModalWindow();
        };
    }
    
    if (closeModalBtn) {
        closeModalBtn.onclick = function() {
            closeModalWindow();
        };
    }
    
    if (addLeadBtn) {
        addLeadBtn.onclick = function() {
            openModal();
        };
    }
    
    const form = document.getElementById("leadForm");
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            saveLead(e);
        };
    }
    
    if (modal) {
        modal.onclick = function(e) {
            if (e.target === modal) {
                closeModalWindow();
            }
        };
    }
}

function openModal(lead = null) {
    const modal = document.getElementById("leadModal");
    const modalTitle = document.getElementById("modalTitle");
    
    if (!modal) return;
    
    if (lead) {
        modalTitle.textContent = "Edit Lead";
        document.getElementById("leadId").value = lead._id || lead.id;
        document.getElementById("firstName").value = lead.firstName || "";
        document.getElementById("lastName").value = lead.lastName || "";
        document.getElementById("leadEmail").value = lead.email || "";
        document.getElementById("phone").value = lead.phone || "";
        document.getElementById("company").value = lead.company || "";
        document.getElementById("jobTitle").value = lead.jobTitle || "";
        document.getElementById("source").value = lead.source || "Website";
        document.getElementById("status").value = lead.status || "New";
        document.getElementById("industry").value = lead.industry || "";
        document.getElementById("priority").value = lead.priority || "Medium";
        document.getElementById("dealValue").value = lead.dealValue || "";
        document.getElementById("location").value = lead.location || "";
        document.getElementById("preferredChannel").value = lead.preferredChannel || "Email";
        document.getElementById("followUpDate").value = lead.followUpDate || "";
        document.getElementById("lastContacted").value = lead.lastContacted || "";
        document.getElementById("tags").value = lead.tags || "";
        document.getElementById("notes").value = lead.notes || "";
    } else {
        modalTitle.textContent = "Add Lead";
        document.getElementById("leadForm").reset();
        document.getElementById("leadId").value = "";
        if (document.getElementById("status")) document.getElementById("status").value = "New";
        if (document.getElementById("source")) document.getElementById("source").value = "Website";
        if (document.getElementById("priority")) document.getElementById("priority").value = "Medium";
    }
    
    modal.hidden = false;
}

function closeModalWindow() {
    const modal = document.getElementById("leadModal");
    if (modal) {
        modal.hidden = true;
    }
    document.getElementById("leadForm").reset();
    document.getElementById("leadId").value = "";
}

function saveLead(e) {
    e.preventDefault();
    
    const leadData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("leadEmail").value,
        phone: document.getElementById("phone").value,
        company: document.getElementById("company").value,
        jobTitle: document.getElementById("jobTitle").value,
        source: document.getElementById("source").value,
        status: document.getElementById("status").value,
        industry: document.getElementById("industry").value,
        priority: document.getElementById("priority").value,
        dealValue: parseFloat(document.getElementById("dealValue").value) || 0,
        location: document.getElementById("location").value,
        preferredChannel: document.getElementById("preferredChannel").value,
        followUpDate: document.getElementById("followUpDate").value || null,
        lastContacted: document.getElementById("lastContacted").value || null,
        tags: document.getElementById("tags").value,
        notes: document.getElementById("notes").value
    };
    
    const leadId = document.getElementById("leadId").value;
    if (leadId) leadData.id = leadId;
    
    saveLeadToAPI(leadData);
}

function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return "-";
    try {
        return new Date(dateString).toLocaleDateString();
    } catch {
        return "-";
    }
}

function showNotification(message, type = "info") {
    const existing = document.querySelector(".notification-toast");
    if (existing) existing.remove();
    
    const notification = document.createElement("div");
    notification.className = "notification-toast";
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === "error" ? "#dc2626" : "#10b981"};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}