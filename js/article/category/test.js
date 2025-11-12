const URL = "http://articles.csm.linkpc.net/api/articles";

let dataItems = []; // store fetched data
let currentPage = 1;
const itemsPerPage = 8; // number of cards per page
const maxPagesToShow = 5;

const display = document.getElementById("display");

getData();

function getData() {
  fetch(URL)
    .then((res) => res.json())
    .then((data) => {
      dataItems = data; // store all items for pagination
      updatePagination();
    })
    .catch((error) => console.log(error));
}

function displayItems(page) {
  display.innerHTML = "";
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = dataItems.slice(startIndex, endIndex);

  paginatedItems.forEach((item) => {
    const imageSrc = item.image
      ? `http://articles.csm.linkpc.net/uploads/${item.image}`
      : "https://i.ibb.co/Mn13jQQ/empty.png";

    const row = `
            <div class="col-12 col-md-6 col-lg-4 col-xl-3">
                <div class="card">
                    <img src="${imageSrc}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">Title: ${item.title}</h5>
                        <p class="card-text">Content: ${item.content}</p>
                        <button type="button" class="btn btn-primary" onclick="">Detail</button>
                        <button type="button" class="btn btn-info" onclick="">Edit</button>
                        <button type="button" class="btn btn-outline-danger" onclick="deleteItem(${item.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    display.innerHTML += row;
  });
}

function setupPagination() {
  const pageCount = Math.ceil(dataItems.length / itemsPerPage);
  let paginationContainer = document.getElementById("pagination");

  if (!paginationContainer) {
    paginationContainer = document.createElement("div");
    paginationContainer.id = "pagination";
    paginationContainer.className = "d-flex justify-content-center my-3 gap-1";
    display.parentNode.appendChild(paginationContainer);
  }
  paginationContainer.innerHTML = "";

  // Previous Button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "<";
  prevBtn.className = "btn btn-secondary";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updatePagination();
    }
  });
  paginationContainer.appendChild(prevBtn);

  // Page numbers with ... logic
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(pageCount, startPage + maxPagesToShow - 1);
  startPage = Math.max(1, endPage - maxPagesToShow + 1);

  if (startPage > 1) {
    createPageButton(1);
    if (startPage > 2) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.className = "px-2";
      paginationContainer.appendChild(dots);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    createPageButton(i);
  }

  if (endPage < pageCount) {
    if (endPage < pageCount - 1) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.className = "px-2";
      paginationContainer.appendChild(dots);
    }
    createPageButton(pageCount);
  }

  // Next Button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = ">";
  nextBtn.className = "btn btn-secondary";
  nextBtn.disabled = currentPage === pageCount;
  nextBtn.addEventListener("click", () => {
    if (currentPage < pageCount) {
      currentPage++;
      updatePagination();
    }
  });
  paginationContainer.appendChild(nextBtn);
}

function createPageButton(page) {
  const paginationContainer = document.getElementById("pagination");
  const btn = document.createElement("button");
  btn.textContent = page;
  btn.className =
    "btn " + (page === currentPage ? "btn-primary" : "btn-outline-primary");
  btn.addEventListener("click", () => {
    currentPage = page;
    updatePagination();
  });
  paginationContainer.appendChild(btn);
}

function updatePagination() {
  displayItems(currentPage);
  setupPagination();
}

function deleteItem(id) {
  fetch(`${URL}/${id}`, { method: "DELETE" })
    .then((res) => res.json())
    .then((data) => {
      alert("Deleted successfully");
      // remove deleted item from local data
      dataItems = dataItems.filter((item) => item.id !== id);
      // reset currentPage if needed
      const totalPages = Math.ceil(dataItems.length / itemsPerPage);
      if (currentPage > totalPages) currentPage = totalPages;
      updatePagination();
    })
    .catch((error) => console.log(error));
}
