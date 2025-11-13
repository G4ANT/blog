const API = "http://blogs.csm.linkpc.net/api/v1";
const endPointCreateArticle = "articles";
const endPointCategory =
  "categories?_page=1&_per_page=20&sortBy=name&sortDir=ASC";
const endPointOwnArticle = "articles/own?_page=1&_per_page=50";

const getToken = localStorage.getItem("authToken");
getCategoryData();
function getCategoryData() {
  try {
    let categoryOption = document.getElementById("category");
    fetch(`${API}/${endPointCategory}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const getCategoryItems = data.data.items;
        getCategoryItems.forEach((category) => {
          let options = `
                <option value="${category.id}">${category.name}</option>
            `;
          categoryOption.innerHTML += options;
        });
      })
      .catch((error) => {
        console.error(error.message, "data error");
      });
  } catch (error) {
    console.error("Data error: ", error.message);
  }
}

function onClickSubmit() {
  let title = document.getElementById("title");
  let content = document.getElementById("content");
  let category = document.getElementById("category");
  let thumbnailFile = document.getElementById("thumbnail").files[0];

  try {
    const articleData = {
      title: title.value.trim(),
      content: content.value.trim(),
      categoryId: Number(category.value),
    };

    fetch(`${API}/${endPointCreateArticle}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken}`,
      },
      body: JSON.stringify(articleData),
    })
      .then((res) => res.json())
      .then((dataArticle) => {
        if (!dataArticle.result || !dataArticle.data.id) {
          console.error("Article creation failed:", dataArticle.message);
          return;
        }
        const articleId = dataArticle.data.id;

        let formData = new FormData();
        formData.append("thumbnail", thumbnailFile);

        return fetch(`${API}/articles/${articleId}/thumbnail`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken}` },
          body: formData,
        })
          .then((res) => res.json())
          .then((dataThumbnail) => {
            if (!dataThumbnail) return;
            console.log("Thumbnail uploaded:", dataThumbnail);
            if (dataThumbnail.result) {
              alert("sucess");
              title.value = "";
              content.value = "";
              category.selectedIndex = 0;
              document.getElementById("thumbnail").value = "";
            } else {
              console.log("Create aricle is fail");
            }
          });
      });
  } catch (error) {
    console.error({ error: "Data error" });
  }
}

// For get all article owner
let articles = [];
let currentPage = 1;
const perPage = 5;

function fetchArticles() {
  fetch(`${API}/${endPointOwnArticle}`, {
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

  // For show entry informations

  // let infoString;
  // if(totalEntries > 0)
  //     infoString = `Showing ${start + 1} to ${end} of ${totalEntries} entries`
  // else infoString `Showing 0 enteries`;

  document.getElementById("entryInfo").textContent =
    totalEntries > 0
      ? `Showing ${start + 1} to ${end} of ${totalEntries} entries`
      : `Showing 0 enteries`;

  tbody.innerHTML = paginated.length
    ? ""
    : `
        <tr><td colspan="5" class="text-center text-muted">No articles found.</td></tr>
    `;
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
                <button class="btn btn-sm btn-outline-danger"><i class="fa-regular fa-trash"></i></button>
                <button class="btn btn-sm btn-outline-secondary me-1"><i class="fa-regular fa-pencil"></i></button>
                </td>
            </tr>`;
  });
}

function renderPaginations() {
  const searchData = document.getElementById("searchInput").value.toLowerCase();
  const filtered = articles.filter((article) =>
    article.title.toLowerCase().includes(searchData)
  );

  const totalPage = Math.ceil(filtered.length / perPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  //When Prev button of Paginations
  let prevDisabled = currentPage === 1 ? "disable" : "";
  pagination.innerHTML += `
         <li class="page-item ${prevDisabled}">
            <a class="page-link" href="#" data-page="${
              currentPage - 1
            }"><i class="fa-regular fa-arrow-left"></i></a>
        </li>
    `;

  // Page numbers
  for (let i = 1; i <= totalPage; i++) {
    let active;
    if (i === currentPage) {
      active = "active";
    } else {
      active = "";
    }
    pagination.innerHTML += `
            <li class="page-item ${active}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
            `;
  }

  // For Next button of Paginations
  let nextDisabled = currentPage === totalPage ? "disable" : "";
  pagination.innerHTML += `
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="#" data-page="${
              currentPage + 1
            }"><i class="fa-regular fa-arrow-right"></i></a>
        </li>`;

  //Add event click of paginations
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

// Update article
function onClickUpdateArticle(){
    
}
