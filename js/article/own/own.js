const API = "http://blogs.csm.linkpc.net/api/v1";
const endPointCreateArticle = "articles";
const endPointCategory = "categories?_page=1&_per_page=20&sortBy=name&sortDir=ASC";
let endPointOwnArticle = (page, perPage) =>
  `articles/own?_page=${page}&_per_page=${perPage}`;


let articles = []
let currentPage = 1
let perPage = 5;
let totalPages = 1;


const getToken = localStorage.getItem("authToken");

//  Get data category item
getCategoryData()
function getCategoryData(dropdownId = "category", selectedId = null) {
  try {
    const categoryOption = document.getElementById(dropdownId);
    if (!categoryOption) return;
    categoryOption.innerHTML = `<option value="">Select category</option>`;

    fetch(`${API}/${endPointCategory}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${getToken}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const categories = data.data.items;
        categories.forEach(category => {
          const isSelected = selectedId && category.id === selectedId ? "selected" : "";
          const option = `<option value="${category.id}" ${isSelected}>${category.name}</option>`;
          categoryOption.innerHTML += option;
        });
      })
      .catch(err => console.error("Category fetch error:", err.message));
  } catch (err) {
    console.error("Data error:", err.message);
  }
}
function createArticleErrorMessage(type) {
  const successToastEl = document.getElementById("successToast");
  const errorToastEl = document.getElementById("errorToast");
  let toastEl;
  if (type === "success") {
    toastEl = successToastEl;
    toastEl.querySelector(".toast-body").textContent = "Article created successfully!";
  } else if (type === "error") {
    toastEl = errorToastEl;
    toastEl.querySelector(".toast-body").textContent = "Create article fail";
  }

  if (toastEl) {
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}
function updateArticleErrorMessage(type) {
  const successToastEl = document.getElementById("successToast");
  const errorToastEl = document.getElementById("errorToast");
  let toastEl;
  if (type === "success") {
    toastEl = successToastEl;
    toastEl.querySelector(".toast-body").textContent = "Update created successfully!";
  } else if (type === "error") {
    toastEl = errorToastEl;
    toastEl.querySelector(".toast-body").textContent = "Update article fail";
  }

  if (toastEl) {
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

// For get all article owner
function onClickSubmit() {
  let title = document.getElementById("title");
  let content = document.getElementById("content");
  let category = document.getElementById("category");
  let thumbnailFile = document.getElementById("thumbnail").files[0];
  let formCreateValidation = document.getElementById("articleForm");

  if (!formCreateValidation.checkValidity()) {
    formCreateValidation.classList.add("was-validated");
    return;
  }
  const articleData = {
    title: title.value.trim(),
    content: content.value.trim(),
    categoryId: Number(category.value)
  };

  fetch(`${API}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken}`
    },
    body: JSON.stringify(articleData)
  })
    .then(res => res.json())
    .then(dataArticle => {
      if (!dataArticle.result || !dataArticle.data.id) {
        createArticleErrorMessage("error");
        console.error("Article creation failed:", dataArticle.message);
        return;
      }

      const articleId = dataArticle.data.id;

      // Upload thumbnail
      let formData = new FormData();
      formData.append("thumbnail", thumbnailFile);

      return fetch(`${API}/articles/${articleId}/thumbnail`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${getToken}` },
        body: formData
      })
        .then(res => res.json())
        .then(dataThumbnail => {
          if (dataThumbnail.result) {
            // alert(" Article created successfully!");
            createArticleErrorMessage("success");


            // Clear form
            // title.value = "";
            // content.value = "";
            // category.selectedIndex = 0;
            // document.getElementById("thumbnail").value = "";

            // Add the new article to the top of the articles array
            fetchArticles(); // Refresh table immediately
            return
          } else {
            console.error("Thumbnail upload failed");

          }
        });
    })
    .catch(err => console.error("Error creating article:", err));
}


function fetchArticles() {
  fetch(`${API}/${endPointOwnArticle(currentPage, perPage)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${getToken}` },
  })
    .then((res) => res.json())
    .then((data) => {
      articles = data.data.items;
      totalPages = data.data.meta.totalPages;

      showDataTable();
      renderPaginations();
    })
    .catch((error) => {
      console.error("Error fetching articles", error.message);
    });
}
document.getElementById("searchInput").addEventListener("input", () => {
  currentPage = 1; // Reset to first page when searching
  showDataTable();
});
fetchArticles();

function showDataTable() {
  let tbody = document.getElementById("articlesTableBody");
  const searchData = document.getElementById("searchInput").value.toLowerCase();
  const filtered = articles.filter((article) =>
    article.title.toLowerCase().includes(searchData)
  );

  // const totalEntries = filtered.length;
  // const start = (currentPage - 1) * perPage;
  // const end = Math.min(start + perPage, totalEntries);
  // const paginated = filtered.slice(start, end);

  // For show entry informations

  // let infoString;
  // if(totalEntries > 0)
  //     infoString = `Showing ${start + 1} to ${end} of ${totalEntries} entries`
  // else infoString `Showing 0 enteries`;

  // console.log(filtered.length)
  // document.getElementById("entryInfo").textContent =
  //   filtered.length > 0
  //     ? `Showing 1 to ${filtered.length} of ${filtered.length} entries`
  //     : `Showing 0 entries`;


  tbody.innerHTML = filtered.length ? "" : ` <tr><td colspan="5" class="text-center text-muted">No articles found.</td></tr>`;
  filtered.forEach((article) => {
    let createdAt = new Date(article.createdAt).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Phnom_Penh",
    });

    // const categoryName = article.category ? article.category.name : "No category";

    let categoryName;
    if (article.category) {
      categoryName = article.category.name;
    } else {
      categoryName = "No category";
    }
    const thumbnailUrl =
      article.thumbnail || "https://via.placeholder.com/60x40?text=No+Image";

    tbody.innerHTML += `
             <tr>
                <td><img src="${thumbnailUrl}" alt="Thumbnail"></td>
                <td>${article.title}</td>
                <td><span class="badge-category">${categoryName}</span></td>
                <td>${createdAt}</td>
                <td class="text-end">
                <button class="btn btn-sm btn-outline-danger"onclick="btnDeleteArticle(${article.id})" ><i class="fa-regular fa-trash"></i></button>
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="onClickUpdateArticle(${article.id})"><i class="fa-regular fa-pencil"></i></button>
                </td>
            </tr>`;
  });
}


function renderPaginations() {
  let totalPage = totalPages;
  const paginationEl = document.getElementById("pagination");
  paginationEl.innerHTML = "";

  const addPage = (p, text = p, active = false, disabled = false) =>
  (paginationEl.innerHTML += `
        <li class="page-item ${active ? "active" : ""} ${disabled ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${p}">${text}</a>
        </li>`);

  // Prev
  addPage(currentPage - 1, "<", false, currentPage === 1);

  // First page
  addPage(1, "1", currentPage === 1);

  // Left ellipsis
  if (currentPage > 3) paginationEl.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;

  // Middle pages (currentPage ±1)
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPage - 1, currentPage + 1); i++) {
    addPage(i, i, i === currentPage);
  }

  // Right ellipsis
  if (currentPage < totalPage - 2) paginationEl.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;

  // Last page
  if (totalPage > 1) addPage(totalPage, totalPage, currentPage === totalPage);

  // Next
  addPage(currentPage + 1, ">", false, currentPage === totalPage);

  // Click event
  paginationEl.querySelectorAll(".page-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const page = Number(link.getAttribute("data-page"));
      if (page >= 1 && page <= totalPage && page !== currentPage) {
        currentPage = page;
        fetchArticles()
      }
    });
  });
}

function btnDeleteArticle(id) {
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
      fetch(`${API}/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          Swal.fire(
            "Deleted!",
            "The article has been deleted.",
            "success"
          ).then(() => fetchArticles());
        })
        .catch((error) => {
          console.error("Error deleting article:", error);
          Swal.fire("Error!", "Something went wrong while deleting.", "error");
        });
    }
  });
}

function onClickUpdateArticle(id) {
  const article = articles.find(a => a.id === id);
  if (!article) return alert("Article not found!");

  // Fill modal form fields
  document.getElementById("updateId").value = article.id;
  document.getElementById("updateTitle").value = article.title;
  document.getElementById("updateContent").value = article.content?.replace(/<[^>]*>/g, "") || "";
  document.getElementById("thumbnailPreview").src = article.thumbnail || "https://placehold.co/400";

  // Pass category ID so the correct one is selected
  const selectedCategoryId = article.category?.id || article.categoryId || null;
  getCategoryData("updateCategory", selectedCategoryId);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("updateModal"));
  modal.show();

}

// Update article
function onClickUpdate() {
  const form = document.getElementById("updateForm");
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const id = document.getElementById("updateId").value;
  const title = document.getElementById("updateTitle").value.trim();
  const content = document.getElementById("updateContent").value.trim();
  const categoryId = Number(document.getElementById("updateCategory").value);
  const thumbnailFile = document.getElementById("updateThumbnail").files[0];

  fetch(`${API}/articles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken}`
    },
    body: JSON.stringify({ title, content, categoryId })
  })
    .then(response => response.json())
    .then(data => {
      if (!data.result) {
        console.error("Update failed:", data.message);
        throw new Error(data.message);
      }

      if (thumbnailFile) {
        const formData = new FormData();
        formData.append("thumbnail", thumbnailFile);

        return fetch(`${API}/articles/${id}/thumbnail`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${getToken}` },
          body: formData
        })
          .then(res => res.json())
          .then(thumbData => {
            if (!thumbData.result) {
              console.error("Thumbnail upload failed:", thumbData.message);

            }
          });
      }
    })
    .then(() => {
      updateArticleErrorMessage("success");
      bootstrap.Modal.getInstance(document.getElementById("updateModal")).hide();
      form.reset();
      form.classList.remove("was-validated");
      fetchArticles();

    })
    .catch(error => {
      updateArticleErrorMessage("error");
      console.error("Error updating article:", error);
    });
}


