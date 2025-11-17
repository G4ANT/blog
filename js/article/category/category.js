const baseURL = "categories";

let itemsPerPage = 100;
let sortBy = "name";
let sortDir = "ASC";

const endPointCategoryy = `${baseURL}?_page=${currentPage}&_per_page=${itemsPerPage}&sortBy=${sortBy}&sortDir=${sortDir}`;
const tbody = document.getElementById("displayCategory");
const paginationCategory = document.getElementById("paginationContainer");
const gToken = localStorage.getItem("authToken");

let editCategoryId = null;
let categories = [];
let allCategories = [];
let cPage = 1;
const perrPage = 10;

function fetchCategories() {
  fetch(`${BASE_URL}/${endPointCategoryy}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${gToken}` },
  })
    .then((res) => res.json())
    .then((data) => {
      allCategories = data?.data?.items || [];
      categories = [...allCategories];

      renderCategoryTable();
      renderPaginationCategory();
    })
    .catch((err) => {
      console.error("Error fetching categories:", err.message);
      tbody.innerHTML = `<tr><td colspan="2" class="text-center text-danger py-3">Cannot connect to API</td></tr>`;
    });
}

function renderCategoryTable() {
  tbody.innerHTML = "";

  const totalEntries = categories.length;
  const start = (cPage - 1) * perrPage;
  const end = Math.min(start + perrPage, totalEntries);
  const paginated = categories.slice(start, end);

  // const entryInfo = document.getElementById("entryInfo");
  // entryInfo.textContent =
  //   totalEntries > 0
  //     ? `Showing ${start + 1} to ${end} of ${totalEntries} entries`
  //     : `Showing 0 entries`;

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

function renderPaginationCategory() {
  const tPage = Math.ceil(categories.length / perrPage);
  paginationCategory.innerHTML = "";

  const addPage = (p, text = p, active = false, disabled = false) =>
    (paginationCategory.innerHTML += `
      <li class="page-item ${active ? "active" : ""} ${
      disabled ? "disabled" : ""
    }">
        <a class="page-link" href="#" data-page="${p}">${text}</a>
      </li>`);

  addPage(cPage - 1, "<", false, cPage === 1);

  addPage(1, "1", cPage === 1);

  if (cPage > 3)
    paginationCategory.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;

  for (
    let i = Math.max(2, cPage - 1);
    i <= Math.min(tPage - 1, cPage + 1);
    i++
  ) {
    addPage(i, i, i === cPage);
  }

  if (cPage < tPage - 2)
    paginationCategory.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;

  if (tPage > 1) addPage(tPage, tPage, cPage === tPage);

  addPage(cPage + 1, ">", false, cPage === tPage);

  paginationCategory.querySelectorAll(".page-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = Number(link.getAttribute("data-page"));
      if (page >= 1 && page <= tPage) {
        cPage = page;
        renderCategoryTable();
        renderPaginationCategory();
      }
    });
  });
}

function btnDelete(id) {
  if (!confirm("Delete this category?")) return;
  fetch(`${BASE_URL}/categories/${id}`, {
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

function renderCategories(list) {
  categories = list;
  cPage = 1;
  renderCategoryTable();
  renderPaginationCategory();
}

fetchCategories();

function handleSearch() {
  const query = document.getElementById("searchCategoryInput").value.trim();
  const authToken = localStorage.getItem("authToken");

  if (!query) {
    renderCategories(allCategories);
    return;
  }

  if (!isNaN(query)) {
    fetch(`${BASE_URL}/categories/${query}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data?.data) {
          renderCategories([]);
        } else {
          const category = Array.isArray(data.data) ? data.data[0] : data.data;
          renderCategories([category]);
        }
      })
      .catch(() => renderCategories([]));
    return;
  }

  const filtered = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(query.toLowerCase())
  );

  renderCategories(filtered);
}

function btnCreate() {
  let authToken = localStorage.getItem("authToken");
  let categoryName = document.getElementById("categoryName").value.trim();

  if (categoryName === "") {
    Swal.fire("Warning!", "Category name cannot be empty.", "warning");
    return;
  }

  fetch(`${BASE_URL}/categories`, {
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

  const editModalEl = document.getElementById("editModal");
  const modal = new bootstrap.Modal(editModalEl);
  modal.show();
}

function btnEdit() {
  let authToken = localStorage.getItem("authToken");
  let categoryName = document.getElementById("editCategoryName").value;

  if (!editCategoryId)
    return console.error("No category selected for editing.");

  fetch(`${BASE_URL}/categories/${editCategoryId}`, {
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
      fetch(`${BASE_URL}/categories/${id}`, {
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
