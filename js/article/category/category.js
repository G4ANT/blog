let displayCategory = document.getElementById("displayCategory");
let paginationContainer = document.getElementById("paginationContainer");

let currentPage = 1;
let perPage = 10;
let allCategories = [];
let editCategoryId = null;

function fetchCategories(page = 1) {
  fetch(
    `http://blogs.csm.linkpc.net/api/v1/categories?_page=${page}&_per_page=${perPage}&sortBy=name&sortDir=ASC`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("API Response:", data);

      allCategories = data.data?.items || data.data || data.items || [];
      let total =
        data.data?.pagination?.total_items ||
        data.data?.total ||
        data.total ||
        0;

      totalPages = total > 0 ? Math.ceil(total / perPage) : 3;

      renderCategories(allCategories);
      renderPagination();
    })
    .catch((error) => console.error("Error fetching categories:", error));
}

function renderCategories(categories) {
  displayCategory.innerHTML = "";
  if (!categories.length) {
    displayCategory.innerHTML = `
      <tr><td colspan="2" class="text-center text-muted">No categories found</td></tr>`;
    return;
  }

  categories.forEach((category) => {
    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${category.name}</td>
      <td class="text-end">
        <button 
          class="btn btn-sm btn-outline-secondary"
          data-bs-toggle="modal"
          data-bs-target="#editModal"
          onclick="openEditModal(${category.id}, '${category.name}')"
        >
          <i class="fa-solid fa-pen"></i>
        </button>
        <button 
          onclick="btnDelete(${category.id})" 
          class="btn btn-sm btn-outline-danger"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    displayCategory.appendChild(row);
  });
}

function renderPagination() {
  paginationContainer.innerHTML = `
    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
          <button class="page-link" onclick="changePage(${
            currentPage - 1
          })">Previous</button>
        </li>
        ${generatePageNumbers()}
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
          <button class="page-link" onclick="changePage(${
            currentPage + 1
          })">Next</button>
        </li>
      </ul>
    </nav>
  `;
}

function generatePageNumbers() {
  let pagesHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    pagesHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <button class="page-link" onclick="changePage(${i})">${i}</button>
      </li>`;
  }
  return pagesHTML;
}

function changePage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  fetchCategories(currentPage);
}

fetchCategories(currentPage);

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
}

function btnEdit() {
  let authToken = localStorage.getItem("authToken");
  let categoryName = document.getElementById("editCategoryName").value;

  if (!editCategoryId) {
    console.error("No category selected for editing.");
    return;
  }

  fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${editCategoryId}`, {
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
      const modal = bootstrap.Modal.getInstance(editModalEl);
      modal.hide();

      Swal.fire(
        "Updated!",
        "Category has been updated successfully.",
        "success"
      ).then(() => {
        fetchCategories(currentPage);
      });
    })
    .catch((error) => {
      console.error("Error updating category:", error);
    });
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
