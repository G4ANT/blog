const endPointCreateArticle = "articles";
const endPointCategory = "categories?_page=1&_per_page=20&sortBy=name&sortDir=ASC";
const endPointOwnArticle = "articles/own?_page=1&_per_page=50";

const getToken = localStorage.getItem("authToken");

//  Get data category item
getCategoryData()
function getCategoryData(dropdownId = "category", selectedId = null) {
    try {
        const categoryOption = document.getElementById(dropdownId);
        if (!categoryOption) return;
        categoryOption.innerHTML = `<option value="">Select category</option>`;

        fetch(`${BASE_URL}/${endPointCategory}`, {
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
    toastEl.querySelector(".toast-body").textContent = "Update article successfully!";
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
    let category = document.getElementById("category");
    const thumbnailInput = document.getElementById("thumbnail");
    const thumbnailFile = thumbnailInput.files[0];
    let formCreateValidation = document.getElementById("articleForm");
    const editorDiv = document.getElementById("editor");
    
    const quillText = quill.getText().trim();
    const quillContent = quill.root.innerHTML;
    
    // Validation for Content [ Rich Text Editor ]
    if(quillText.length < 10){
      editorDiv.classList.add("is-invalid");
      editorDiv.classList.remove("is-valid");
      formCreateValidation.classList.add("was-validated");
    }else{
        editorDiv.classList.remove("is-invalid");
        editorDiv.classList.add("is-valid");
    }

    // Thumbnail validation
    const thumbnailFeedback = document.getElementById("thumbnailFeedback");

    if(!thumbnailFile){
      thumbnailInput.classList.add("is-invalid");
      thumbnailInput.classList.remove("is-valid");
      thumbnailFeedback.innerText = "Thumbnail is required!";
      formCreateValidation.classList.add("was-validated");
      return
    }

    const extensionOFThumbnails = ["jpg", "jpeg", "png"];
    const fileExtensions = thumbnailFile.name.split(".").pop().toLowerCase();
    
    if(!extensionOFThumbnails.includes(fileExtensions)){
      thumbnailInput.classList.add("is-invalid");
      thumbnailInput.classList.remove("is-valid")
      thumbnailFeedback.innerText = "Invalid file extension. Only .jpg, .jpeg, or .png are allowed";
      formCreateValidation.classList.add("was-validated");
      return; 
    }else{
      thumbnailInput.classList.remove("is-invalid");
      thumbnailInput.classList.add("is-valid");
    }
    
    if (!formCreateValidation.checkValidity()) {
        formCreateValidation.classList.add("was-validated");
        return;
    }
    
    const articleData = {
        title: title.value.trim(),
        content: quillContent,
        categoryId: Number(category.value)
    };

    fetch(`${BASE_URL}/articles`, {
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

        return fetch(`${BASE_URL}/articles/${articleId}/thumbnail`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${getToken}` },
            body: formData
        })
        .then(res => res.json())
        .then(dataThumbnail => {
            if (dataThumbnail.result) {
                createArticleErrorMessage("success");

                // Clear the form
                document.getElementById("title").value = "";
                document.getElementById("category").selectedIndex = 0;
                document.getElementById("thumbnail").value = "";
                quill.root.innerHTML = "";
                document.getElementById("editor").classList.remove("is-valid", "is-invalid");
                document.getElementById("articleForm").classList.remove("was-validated");

                // Refresh articles list
                document.querySelector('[data-page="all-articles"]').click();
                fetchArticles();
                return
            } else {
                console.error("Thumbnail upload failed");
            }
        });
    })
    .catch(err => console.error("Error creating article:", err));
}

// When thumbnail is selected, remove error message
document.getElementById("thumbnail").addEventListener("change", function () {
    const thumbnailInput = this;
    const thumbnailFile = thumbnailInput.files[0];
    const thumbnailFeedback = document.getElementById("thumbnailFeedback");

    if (thumbnailFile) {
        thumbnailInput.classList.remove("is-invalid");
        thumbnailFeedback.innerText = "";
    }
});

let articles = []
let currentPage = 1
const perPage = 5;

function fetchArticles() {
  fetch(`${BASE_URL}/${endPointOwnArticle}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${getToken}` },
  })
    .then((res) => res.json())
    .then((data) => {
      articles = data.data.items;
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
  renderPaginations();
});

fetchArticles();

function showDataTable() {
  let tbody = document.getElementById("articlesTableBody");
  const searchData = document.getElementById("searchInput").value.toLowerCase();
  const filtered = articles.filter((article) =>
    article.title.toLowerCase().includes(searchData)
  );

  const totalEntries = filtered.length;
  const start = (currentPage - 1) * perPage;
  const end = Math.min(start + perPage, totalEntries);
  const paginated = filtered.slice(start, end);

  // Show entry information
  document.getElementById("entryInfo").textContent =
    totalEntries > 0
      ? `Showing ${start + 1} to ${end} of ${totalEntries} entries`
      : `Showing 0 entries`;

  tbody.innerHTML = paginated.length ? "" : `<tr><td colspan="5" class="text-center text-muted">No articles found.</td></tr>`;
  
  paginated.forEach((article) => {
    let createdAt = new Date(article.createdAt).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Phnom_Penh",
    });

    let categoryName = article.category ? article.category.name : "No category";
    const thumbnailUrl = article.thumbnail || "https://via.placeholder.com/60x40?text=No+Image";

    tbody.innerHTML += `
      <tr>
        <td><img src="${thumbnailUrl}" alt="Thumbnail"></td>
        <td>${article.title}</td>
        <td><span class="badge-category">${categoryName}</span></td>
        <td>${createdAt}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" onclick="btnDeleteArticle(${article.id})"><i class="fa-regular fa-trash"></i></button>
          <button class="btn btn-sm btn-outline-secondary me-1" onclick="onClickUpdateArticle(${article.id})"><i class="fa-regular fa-pencil"></i></button>
        </td>
      </tr>`;
  });
}

function renderPaginations() {
  const searchData = document.getElementById("searchInput").value.toLowerCase();
  const filtered = articles.filter((article) =>
    article.title.toLowerCase().includes(searchData)
  );

  const totalEntries = filtered.length;
  const totalPage = Math.ceil(totalEntries / perPage);
  const pagination = document.getElementById("pagination");
  
  // Hide pagination if no data or only one page
  if (totalEntries === 0 || totalPage <= 1) {
    pagination.innerHTML = "";
    return;
  }

  pagination.innerHTML = "";

  // Previous button
  let prevDisabled = currentPage === 1 ? "disabled" : "";
  pagination.innerHTML += `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" data-page="${currentPage - 1}"><i class="fa-regular fa-arrow-left"></i></a>
    </li>`;

  // Page numbers with smart ellipsis
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPage, startPage + maxVisiblePages - 1);

  // Adjust start if we're near the end
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // First page + ellipsis
  if (startPage > 1) {
    pagination.innerHTML += `
      <li class="page-item">
        <a class="page-link" href="#" data-page="1">1</a>
      </li>`;
    if (startPage > 2) {
      pagination.innerHTML += `
        <li class="page-item disabled">
          <span class="page-link">...</span>
        </li>`;
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    let active = i === currentPage ? "active" : "";
    pagination.innerHTML += `
      <li class="page-item ${active}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
  }

  // Ellipsis + last page
  if (endPage < totalPage) {
    if (endPage < totalPage - 1) {
      pagination.innerHTML += `
        <li class="page-item disabled">
          <span class="page-link">...</span>
        </li>`;
    }
    pagination.innerHTML += `
      <li class="page-item">
        <a class="page-link" href="#" data-page="${totalPage}">${totalPage}</a>
      </li>`;
  }

  // Next button
  let nextDisabled = currentPage === totalPage ? "disabled" : "";
  pagination.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="#" data-page="${currentPage + 1}"><i class="fa-regular fa-arrow-right"></i></a>
    </li>`;

  // Add click events
  document.querySelectorAll("#pagination .page-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      let pages = Number(link.getAttribute("data-page"));
      if (pages >= 1 && pages <= totalPage) {
        currentPage = pages;
        showDataTable();
        renderPaginations();
      }
    });
  });
}

// Delete an article with confirmation
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
      fetch(`${BASE_URL}/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          Swal.fire(
            "Deleted!",
            "The article has been deleted.",
            "success"
          ).then(() => {
            // Adjust current page if needed after deletion
            fetchArticles();
          });
        })
        .catch((error) => {
          console.error("Error deleting article:", error);
          Swal.fire("Error!", "Something went wrong while deleting.", "error");
        });
    }
  });
}

// Get article by id and populate update form
function onClickUpdateArticle(id) {
  const article = articles.find(a => a.id === id);
  if (!article) return alert("Article not found!");

  // Fill modal form fields
  document.getElementById("updateId").value = article.id;
  document.getElementById("updateTitle").value = article.title;
  quillByclassName.root.innerHTML = article.content || "<p><br></p>";
  
  document.getElementById("thumbnailPreview").src = article.thumbnail || "https://placehold.co/400";

  // Set selected category
  const selectedCategoryId = article.category?.id || article.categoryId || null;
  getCategoryData("updateCategory", selectedCategoryId);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("updateModal"));
  modal.show();
}

// Update article
function onClickUpdate() {
    const id = document.getElementById("updateId").value;
    const title = document.getElementById("updateTitle").value.trim();
    const quillContent = quillByclassName.root.innerHTML;
    const categoryId = Number(document.getElementById("updateCategory").value);
    const thumbnailInput = document.getElementById("updateThumbnail")
    const thumbnailFile = thumbnailInput.files[0];

    const form = document.getElementById("updateForm");
    const editorDivTags = document.getElementById("editorByClassName");
    const textEditor = quillByclassName.getText().trim();

    // Validate editor content
    if (textEditor.length < 10) {
      editorDivTags.classList.add("is-invalid");
      editorDivTags.classList.remove("is-valid");
      form.classList.add("was-validated");
      return;
    } else {
      editorDivTags.classList.add("is-valid");
      editorDivTags.classList.remove("is-invalid");
    }

    // Validate thumbnail if user selected a new one
    const thumbnailFeedbackUpload = document.getElementById("thumbnailFeedbackUpload");
    
    if (!thumbnailFile) {
      thumbnailInput.classList.remove("is-invalid");
      thumbnailInput.classList.remove("is-valid");
    } else {
      const extensionOFThumbnails = ["jpg", "jpeg", "png"];
      const fileExtensions = thumbnailFile.name.split(".").pop().toLowerCase();

      if (!extensionOFThumbnails.includes(fileExtensions)) {
        thumbnailInput.classList.add("is-invalid");
        thumbnailFeedbackUpload.innerText = "Invalid file extension. Only .jpg, .jpeg, or .png are allowed";
        return;
      }

      thumbnailInput.classList.remove("is-invalid");
      thumbnailInput.classList.add("is-valid");
    }

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    fetch(`${BASE_URL}/articles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken}`
      },
      body: JSON.stringify({ title, content: quillContent, categoryId })
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

        return fetch(`${BASE_URL}/articles/${id}/thumbnail`, {
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
      editorDivTags.classList.remove("is-invalid");
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

// Preview thumbnail on file selection
document.getElementById("updateThumbnail").addEventListener("change", function () {
    const file = this.files[0];
    const preview = document.getElementById("thumbnailPreview");
    const feedback = document.getElementById("thumbnailFeedbackUpload");

    if (file) {
      preview.src = URL.createObjectURL(file);
      this.classList.remove("is-invalid");
      feedback.innerText = "";
    }
});