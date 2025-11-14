const APII = "http://blogs.csm.linkpc.net/api/v1";
const endPointCategoryy =
  "categories?_page=1&_per_page=100&sortBy=name&sortDir=ASC";
const tbody = document.getElementById("displayCategory");
const pagination = document.getElementById("paginationContainer");
const gToken = localStorage.getItem("authToken");

let categories = [];
let cPage = 1;
const perrPage = 10;

// Fetch all categories once
function fetchCategories() {
  fetch(`${APII}/${endPointCategoryy}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${gToken}` },
  })
    .then((res) => res.json())
    .then((data) => {
      categories = data?.data?.items || [];
      renderCategoryTable();
      renderPaginations();
    })
    .catch((err) => {
      console.error("Error fetching categories:", err.message);
      tbody.innerHTML = `<tr><td colspan="2" class="text-center text-danger py-3">Cannot connect to API</td></tr>`;
    });
}

// Show data per page
function renderCategoryTable() {
  tbody.innerHTML = "";
  const totalEntries = categories.length;
  const start = (cPage - 1) * perrPage;
  const end = Math.min(start + perrPage, totalEntries);
  const paginated = categories.slice(start, end);

  const entryInfo = document.getElementById("entryInfo");
  entryInfo.textContent =
    totalEntries > 0
      ? `Showing ${start + 1} to ${end} of ${totalEntries} entries`
      : `Showing 0 entries`;

  if (!paginated.length) {
    tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted py-3">No categories found</td></tr>`;
    return;
  }

  paginated.forEach((cat) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${escapeHtml(cat.name)}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-secondary me-1" onclick="openEditModal(${
              cat.id
            }, '${escapeHtml(cat.name)}')">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="btnDelete(${
              cat.id
            })">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>`;
    tbody.appendChild(row);
  });
}

// Render pagination controls
function renderPaginations() {
  const totalPage = Math.ceil(categories.length / perrPage);
  pagination.innerHTML = "";

  const prevDisabled = cPage === 1 ? "disabled" : "";
  pagination.innerHTML += `
        <li class="page-item ${prevDisabled}">
          <a class="page-link" href="#" data-page="${cPage - 1}">
            <i class="fa-solid fa-angle-left"></i>
          </a>
        </li>`;

  for (let i = 1; i <= totalPage; i++) {
    const active = i === cPage ? "active" : "";
    pagination.innerHTML += `
          <li class="page-item ${active}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
          </li>`;
  }

  const nextDisabled = cPage === totalPage ? "disabled" : "";
  pagination.innerHTML += `
        <li class="page-item ${nextDisabled}">
          <a class="page-link" href="#" data-page="${cPage + 1}">
            <i class="fa-solid fa-angle-right"></i>
          </a>
        </li>`;

  document
    .querySelectorAll("#paginationContainer .page-link")
    .forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = Number(link.getAttribute("data-page"));
        if (page >= 1 && page <= totalPage) {
          cPage = page;
          renderCategoryTable();
          renderPaginations();
        }
      });
    });
}

function btnDelete(id) {
  if (!confirm("Delete this category?")) return;
  fetch(`${APII}/categories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${gToken}` },
  })
    .then((res) => res.json())
    .then(() => fetchCategories())
    .catch((err) => console.error("Error deleting category:", err.message));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

fetchCategories();

function handleSearch() {
  const input = document.getElementById("searchInput");
  if (!input) {
    console.error("Search input not found!");
    return;
  }

  const query = input.value.trim().toLowerCase();

  // If search is empty, show full list again
  if (!query) {
    cPage = 1;
    renderCategoryTable();
    renderPaginations();
    return;
  }

  // Filter categories
  const filtered = categories.filter((cat) =>
    cat.name.toLowerCase().includes(query)
  );

  // Render filtered results
  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="2" class="text-center text-muted py-3">
          No categories found
        </td>
      </tr>`;
    pagination.innerHTML = ""; // hide pagination when searching
    return;
  }

  filtered.forEach((cat) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(cat.name)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-secondary me-1"
          onclick="openEditModal(${cat.id}, '${escapeHtml(cat.name)}')">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger"
          onclick="btnDelete(${cat.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>`;
    tbody.appendChild(row);
  });

  pagination.innerHTML = ""; // hide pagination during search
}

function btnCreate() {
  let authToken = localStorage.getItem("authToken");
  let categoryName = document.getElementById("categoryName").value;

  fetch(`${APII}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ name: categoryName }),
  })
    .then((response) => response.json())
    .then(() => {
      Swal.fire("Created!", "Category created successfully.", "success").then(
        () => fetchCategories(cPage)
      );
    })
    .catch((error) => {
      console.error("Error creating category:", error);
      Swal.fire("Error!", "Failed to create category.", "error");
    });

  clear();
}

function openEditModal(id, name) {
  editCategoryId = id;
  document.getElementById("editCategoryName").value = name;

  // Open modal
  const editModalEl = document.getElementById("editModal");
  const modal = new bootstrap.Modal(editModalEl);
  modal.show();
}

function btnEdit() {
  let authToken = localStorage.getItem("authToken");
  let categoryName = document.getElementById("editCategoryName").value;

  if (!editCategoryId)
    return console.error("No category selected for editing.");

  fetch(`${APII}/categories/${editCategoryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ name: categoryName }),
  })
    .then((response) => response.json())
    .then(() => {
      const editModalEl = document.getElementById("editModal");
      const modal = bootstrap.Modal.getInstance(editModalEl);
      if (modal) modal.hide();

      Swal.fire("Updated!", "Category updated successfully.", "success").then(
        () => fetchCategories(cPage)
      );
    })
    .catch((error) => {
      console.error("Error updating category:", error);
      Swal.fire("Error!", "Failed to update category.", "error");
    });
}
function btnDelete(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      const authToken = localStorage.getItem("authToken");
      fetch(`${APII}/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((res) => res.json())
        .then(() => {
          Swal.fire(
            "Deleted!",
            "Category deleted successfully.",
            "success"
          ).then(() => fetchCategories(cPage));
        })
        .catch((error) => {
          console.error("Error deleting category:", error);
          Swal.fire("Error!", "Failed to delete category.", "error");
        });
    }
  });
}

function clear() {
  document.getElementById("categoryName").value = "";
}
