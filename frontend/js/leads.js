let LEADS = [];
let editingId = null;
let searchTimer;

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  els.body = document.getElementById("leadsBody");
  els.empty = document.getElementById("emptyState");
  els.search = document.getElementById("searchInput");
  els.filter = document.getElementById("statusFilter");
  els.modal = document.getElementById("leadModal");
  els.title = document.getElementById("modalTitle");
  els.form = document.getElementById("leadForm");

  document.getElementById("addLeadBtn").onclick = () => openModal();

  document.getElementById("closeModal").onclick = closeModal;

  document.getElementById("cancelModal").onclick = closeModal;

  els.modal.addEventListener("click", (e) => {
    if (e.target === els.modal) closeModal();
  });

  els.form.addEventListener("submit", saveLead);

  els.search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(load, 300);
  });

  els.filter.addEventListener("change", load);

  load();
});

async function load() {
  try {
    const params = {};

    if (els.search.value.trim()) {
      params.q = els.search.value.trim();
    }

    if (els.filter.value) {
      params.status = els.filter.value;
    }

    const res = await API.listLeads(params);

    LEADS = res.leads || res.data || [];

    render();

  } catch (e) {
    console.error(e);

    els.body.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;color:red;padding:20px;">
          ${e.message}
        </td>
      </tr>
    `;
  }
}

function render() {
  if (!LEADS.length) {
    els.body.innerHTML = "";
    els.empty.hidden = false;
    return;
  }

  els.empty.hidden = true;

  els.body.innerHTML = LEADS.map((l) => `
    <tr>
      <td><strong>${l.firstName || ""} ${l.lastName || ""}</strong></td>
      <td>${l.email || ""}</td>
      <td>${l.source || "—"}</td>
      <td>${l.status || "—"}</td>
      <td>${l.company || "—"}</td>
      <td>${l.phone || "—"}</td>
      <td>${fmtDate(l.followUpDate)}</td>
      <td>
        <div class="row-actions">
          <button class="btn btn-ghost btn-sm" onclick="openModal('${l._id}')">
            Edit
          </button>

          <button class="btn btn-danger btn-sm" onclick="removeLead('${l._id}')">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function openModal(id = null) {
  editingId = id;

  els.title.textContent = id ? "Edit Lead" : "Add Lead";

  els.form.reset();

  document.getElementById("leadId").value = id || "";

  if (id) {
    try {
      const res = await API.getLead(id);

      const lead = res.lead || res.data;

      const set = (key, value) => {
        const el = document.getElementById(key);

        if (el) {
          el.value = value ?? "";
        }
      };

      set("firstName", lead.firstName);
      set("lastName", lead.lastName);
      set("leadEmail", lead.email);
      set("phone", lead.phone);
      set("company", lead.company);
      set("jobTitle", lead.jobTitle);
      set("source", lead.source);
      set("status", lead.status);
      set("industry", lead.industry);
      set("priority", lead.priority);
      set("dealValue", lead.dealValue);
      set("location", lead.location);
      set("preferredChannel", lead.preferredChannel);

      set(
        "followUpDate",
        lead.followUpDate
          ? lead.followUpDate.slice(0, 10)
          : ""
      );

      set(
        "lastContacted",
        lead.lastContacted
          ? lead.lastContacted.slice(0, 10)
          : ""
      );

      set(
        "tags",
        (lead.tags || []).join(", ")
      );

      set("notes", lead.notes);

    } catch (e) {
      alert(e.message);
      return;
    }
  }

  els.modal.hidden = false;
}

function closeModal() {
  els.modal.hidden = true;
  editingId = null;
}

async function saveLead(e) {
  e.preventDefault();

  const body = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    email: document.getElementById("leadEmail").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    company: document.getElementById("company").value.trim(),
    jobTitle: document.getElementById("jobTitle").value.trim(),

    source:
      document.getElementById("source").value || "Website",

    status:
      document.getElementById("status").value || "New",

    industry:
      document.getElementById("industry").value.trim(),

    priority:
      document.getElementById("priority").value || "Low",

    dealValue:
      Number(document.getElementById("dealValue").value) || 0,

    location:
      document.getElementById("location").value.trim(),

    preferredChannel:
      document.getElementById("preferredChannel").value,

    followUpDate:
      document.getElementById("followUpDate").value || null,

    lastContacted:
      document.getElementById("lastContacted").value || null,

    tags:
      document.getElementById("tags").value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),

    notes:
      document.getElementById("notes").value.trim()
  };

  try {
    console.log("SENDING BODY:");
    console.log(body);

    if (editingId) {
      await API.updateLead(editingId, body);
    } else {
      await API.createLead(body);
    }

    closeModal();

    load();

  } catch (e) {
    console.error(e);
    alert(e.message);
  }
}

async function removeLead(id) {
  if (!confirm("Delete this lead?")) return;

  try {
    await API.deleteLead(id);

    load();

  } catch (e) {
    console.error(e);
    alert(e.message);
  }
}

function fmtDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString();
}