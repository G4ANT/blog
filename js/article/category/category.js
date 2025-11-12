const API_URL = "http://blogs.csm.linkpc.net/api/v1/categories";
const tbody = document.getElementById("displayCategory");
const pagination = document.getElementById("paginationContainer");
let editCategoryId = null;
let currentPage = 1;
const perPage = 10;

function fetchCategories(page = 1) {
  currentPage = page;

  fetch(`${API_URL}?_page=${page}&_per_page=${perPage}&sortBy=name&sortDir=ASC`)
    .then((res) => res.json())
    .then((data) => {
      const items = data.data?.items || [];
      const totalItems = data.data?.total || 0;
      const totalPages = Math.ceil(totalItems / perPage);
      allCategories = items;
      renderCategories(items);
      renderPagination(totalPages);
    })
    .catch((err) => console.error(err));
}

function renderCategories(categories) {
  tbody.innerHTML = "";
  if (!categories.length) {
    tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted py-3">No categories found</td></tr>`;
    return;
  }

  categories.forEach((cat) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(cat.name)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-secondary" onclick="openEditModal(${
          cat.id
        }, '${escapeHtml(cat.name)}')">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="btnDelete(${
          cat.id
        })">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderPagination(totalPages) {
  pagination.innerHTML = "";

  let prevDisabled = currentPage === 1 ? "disabled" : "";
  let nextDisabled = currentPage === totalPages ? "disabled" : "";

  let start = currentPage - 1;
  let end = currentPage + 1;

  if (start < 1) {
    start = 1;
    end = Math.min(3, totalPages);
  }
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, totalPages - 2);
  }

  let html = `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" aria-label="Previous" onclick="changePage(${
        currentPage - 1
      })">
        <i class="fa-solid fa-angle-left"></i>
      </a>
    </li>
  `;

  for (let i = start; i <= end; i++) {
    html += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
      </li>
    `;
  }

  html += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="#" aria-label="Next" onclick="changePage(${
        currentPage + 1
      })">
        <i class="fa-solid fa-angle-right"></i>
      </a>
    </li>
  `;

  pagination.innerHTML = html;
}

function changePage(page) {
  if (page < 1 || page > 999) return;
  currentPage = page;
  fetchCategories(page);
}

function btnDelete(id) {
  if (!confirm("Delete this category?")) return;
  fetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(() => fetchCategories(currentPage))
    .catch((err) => console.error(err));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

fetchCategories(1);

function handleSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const authToken = localStorage.getItem("authToken");

  if (!query) {
    renderCategories(allCategories);
    return;
  }

  if (!isNaN(query)) {
    fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${query}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result === false || !data.data) {
          renderCategories([]);
        } else {
          let category = Array.isArray(data.data) ? data.data[0] : data.data;
          renderCategories([category]);
        }
      })
      .catch((error) => {
        console.error("Search by ID failed:", error);
        renderCategories([]);
      });
  } else {
    let filtered = allCategories.filter((cat) =>
      cat.name.toLowerCase().includes(query.toLowerCase())
    );
    renderCategories(filtered);
  }
}

function btnCreate() {
  let authToken = localStorage.getItem("authToken");
  let categoryName = document.getElementById("categoryName").value;
  fetch("http://blogs.csm.linkpc.net/api/v1/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ name: categoryName }),
  })
    .then((response) => response.json())
    .then((data) => {
      Swal.fire(
        "Created!",
        "Category has been created successfully.",
        "success"
      ).then(() => {
        fetchCategories(currentPage);
      });
    })
    .catch((error) => {
      console.error("Error creating category:", error);
      Swal.fire("Error!", "Something went wrong while creating.", "error");
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

  if (!editCategoryId) {
    console.error("No category selected for editing.");
    return;
  }

  fetch(`${API_URL}/${editCategoryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ name: categoryName }),
  })
    .then((response) => response.json())
    .then((data) => {
      const editModalEl = document.getElementById("editModal");
      let modal = bootstrap.Modal.getInstance(editModalEl);
      if (!modal) modal = new bootstrap.Modal(editModalEl);
      modal.hide();

      Swal.fire(
        "Updated!",
        "Category has been updated successfully.",
        "success"
      ).then(() => fetchCategories(currentPage));
    })
    .catch((error) => console.error("Error updating category:", error));
}

function btnDelete(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      let authToken = localStorage.getItem("authToken");

      fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          Swal.fire(
            "Deleted!",
            "The category has been deleted.",
            "success"
          ).then(() => fetchCategories(currentPage));
        })
        .catch((error) => {
          console.error(error);
          Swal.fire("Error!", "Something went wrong while deleting.", "error");
        });
    }
  });
}

function clear() {
  document.getElementById("categoryName").value = "";
}
