let displayCategory = document.getElementById("displayCategory");
let allCategories = [];
let editCategoryId = null;

fetch(
  "http://blogs.csm.linkpc.net/api/v1/categories?_page=1&_per_page=50&sortBy=name&sortDir=ASC"
)
  .then((response) => response.json())
  .then((data) => {
    allCategories = data.data.items;
    renderCategories(allCategories);
  })
  .catch((error) => console.error("Error fetching categories:", error));

function renderCategories(categories) {
  displayCategory.innerHTML = "";
  if (!categories.length) {
    displayCategory.innerHTML = `<tr><td colspan="2" class="text-center text-muted">No categories found</td></tr>`;
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

function handleSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const token = localStorage.getItem("token");

  if (!query) {
    renderCategories(allCategories);
    return;
  }

  if (!isNaN(query)) {
    fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${query}`, {
      headers: { Authorization: `Bearer ${token}` },
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
  let token = localStorage.getItem("token");
  let categoryName = document.getElementById("categoryName").value;
  fetch("http://blogs.csm.linkpc.net/api/v1/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: categoryName }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Category created:", data);
      Swal.fire(
        "Created!",
        "Category has been created successfully.",
        "success"
      ).then(() => {
        location.reload();
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
  let token = localStorage.getItem("token");
  let categoryName = document.getElementById("editCategoryName").value;

  if (!editCategoryId) {
    console.error("No category selected for editing.");
    return;
  }

  fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${editCategoryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: categoryName }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Category updated:", data);
      Swal.fire(
        "Updated!",
        "Category has been updated successfully.",
        "success"
      ).then(() => {
        location.reload();
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
      let token = localStorage.getItem("token");

      fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          Swal.fire(
            "Deleted!",
            "The category has been deleted.",
            "success"
          ).then(() => location.reload());
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
