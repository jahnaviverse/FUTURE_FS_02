// dashboard.js - Complete Working Version
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("crm_token");
    if (!token) {
        window.location.href = "../index.html";
        return;
    }
    
    await loadDashboardData();
    
    // Listen for updates from leads page
    window.addEventListener('storage', (e) => {
        if (e.key === 'leads_updated') {
            console.log("Leads updated, refreshing dashboard...");
            loadDashboardData();
        }
    });
});

async function loadDashboardData() {
    try {
        console.log("Loading dashboard data...");
        
        // Fetch all leads
        const response = await API.listLeads({ limit: 100 });
        const allLeads = response.leads || response.data || response;
        
        console.log("Total leads found:", allLeads.length);
        
        // Update Total Leads
        const totalLeads = Array.isArray(allLeads) ? allLeads.length : 0;
        const statTotal = document.getElementById("statTotal");
        if (statTotal) statTotal.textContent = totalLeads;
        
        // Calculate New This Week
        let newThisWeekCount = 0;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        if (Array.isArray(allLeads)) {
            allLeads.forEach(lead => {
                const createdAt = lead.createdAt || lead.created_at;
                if (createdAt) {
                    const leadDate = new Date(createdAt);
                    if (!isNaN(leadDate) && leadDate > oneWeekAgo) {
                        newThisWeekCount++;
                    }
                }
            });
        }
        const statNew = document.getElementById("statNew");
        if (statNew) statNew.textContent = newThisWeekCount;
        
        // Calculate Qualified Leads
        let qualifiedCount = 0;
        if (Array.isArray(allLeads)) {
            qualifiedCount = allLeads.filter(lead => lead.status === "Qualified").length;
        }
        const statQualified = document.getElementById("statQualified");
        if (statQualified) statQualified.textContent = qualifiedCount;
        
        // Calculate Pipeline Value
        let pipelineValue = 0;
        const activeStatuses = ['New', 'Contacted', 'Qualified', 'Proposal'];
        if (Array.isArray(allLeads)) {
            pipelineValue = allLeads
                .filter(lead => activeStatuses.includes(lead.status))
                .reduce((sum, lead) => sum + (lead.dealValue || 0), 0);
        }
        const statValue = document.getElementById("statValue");
        if (statValue) statValue.textContent = "$" + pipelineValue.toLocaleString();

        // Update Recent Leads Table
        const tbody = document.getElementById("recentLeads");
        if (tbody) {
            // Get last 5 leads (most recent first)
            const recentLeads = Array.isArray(allLeads) ? [...allLeads].reverse().slice(0, 5) : [];
            
            if (recentLeads.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;">No leads yet</td></tr>';
            } else {
                tbody.innerHTML = recentLeads.map(lead => `
                    <tr>
                        <td><strong>${escapeHtml((lead.firstName || "") + " " + (lead.lastName || ""))}</strong></td>
                        <td>${escapeHtml(lead.company || "—")}</td>
                        <td>${badgeFor(lead.status)}</td>
                        <td>${escapeHtml(lead.source || "—")}</td>
                        <td>${fmtDate(lead.followUpDate)}</td>
                    </tr>
                `).join("");
            }
        }
        
        // Update Charts
        if (typeof Charts !== 'undefined') {
            updateCharts(allLeads);
        }
        
    } catch (error) {
        console.error("Dashboard error:", error);
        const tbody = document.getElementById("recentLeads");
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;padding:40px;">Error loading data. Make sure backend is running.</td></tr>';
        }
    }
}

function updateCharts(leads) {
    if (typeof Charts === 'undefined') return;
    
    // Status counts
    const statusCounts = {
        'New': 0, 'Contacted': 0, 'Qualified': 0, 
        'Proposal': 0, 'Won': 0, 'Lost': 0
    };
    
    if (Array.isArray(leads)) {
        leads.forEach(lead => {
            const status = lead.status || 'New';
            if (statusCounts[status] !== undefined) {
                statusCounts[status]++;
            }
        });
    }
    
    const palette = ["#4f46e5","#22d3ee","#f59e0b","#10b981","#ef4444","#a855f7"];
    const statusData = Object.entries(statusCounts)
        .filter(([_, value]) => value > 0)
        .map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }));
    
    // Source counts
    const sourceCounts = {};
    if (Array.isArray(leads)) {
        leads.forEach(lead => {
            const source = lead.source || 'Other';
            sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });
    }
    
    const sourceData = Object.entries(sourceCounts)
        .map(([label, value], i) => ({ label, value, color: palette[(i+2) % palette.length] }));
    
    const statusChart = document.getElementById("statusChart");
    const sourceChart = document.getElementById("sourceChart");
    
    if (statusChart && statusData.length) {
        Charts.donut(statusChart, statusData);
    }
    if (sourceChart && sourceData.length) {
        Charts.bar(sourceChart, sourceData);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function badgeFor(status) {
    const colors = {
        'New': '#e3f2fd', 
        'Contacted': '#fff3e0', 
        'Qualified': '#e8f5e9',
        'Proposal': '#f3e5f5', 
        'Won': '#c8e6c9', 
        'Lost': '#ffebee'
    };
    const color = colors[status] || '#e0e0e0';
    return `<span style="background:${color};padding:4px 8px;border-radius:4px;font-size:12px;display:inline-block;">${status || 'New'}</span>`;
}

function fmtDate(dateStr) {
    if (!dateStr) return '—';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    } catch {
        return '—';
    }
}