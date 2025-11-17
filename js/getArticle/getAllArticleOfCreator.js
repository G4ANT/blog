// show all article of a creator
let showArticleOfCreator = document.getElementById('showArticleOfCreator')

let spinnerArticleOfCreator = document.getElementById('spinnerArticleOfCreator')

// load more article in creator
let creatorCurrentPage = 1;
let creatorPerPage = 8;



function getAllArticleOfCreator(id, firstName, lastName, avatar) {

    spinnerArticleOfCreator.classList.remove('d-none')

    showCardDetail.style.display = 'none'

    showArticleOfCreator.innerHTML = ''

    showArticleOfCreator.style.display = 'flex';

    // fetch infor of creator
    fetchCreatorInfo(id, showArticleOfCreator, firstName, lastName, avatar)

    // fetch creator infomation 
    fetchCreatorArticles(id, showArticleOfCreator)



}

// function loadMoreCreatorArticles(id) {
//     creatorCurrentPage++; // next page
//     fetchCreatorArticles(id, showArticleOfCreator);
// }
function loadMoreCreatorArticles(id) {

    const btn = document.getElementById("loadMoreCreatorBtn");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
            <span role="status">Loading...</span>
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        `;
    }

    creatorCurrentPage++;
    fetchCreatorArticles(id, showArticleOfCreator);
}



function fetchCreatorArticles(id, getArticleOfCreator) {
    spinnerArticleOfCreator.classList.remove('d-none')

    fetch(`${BASE_URL}/articles/by/${id}?search=&_page=${creatorCurrentPage}&_per_page=${creatorPerPage}&sortBy=createdAt&sortDir=asc`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
        .then(res => res.json())
        .then(data => {

            spinnerArticleOfCreator.classList.add('d-none')

            data.data.items.forEach(item => {
                let previewText = parseQuillContent(item.content)

                let cardOfCreator = `
                    <div class="col-12 col-md-6 col-lg-4 col-xl-3 get-article">
                        <div class="card flex-fill rounded-4 h-100" onclick="viewDetail(${item.id})" style="cursor: pointer;">
                            <img src="${item.thumbnail}" alt="thumbnail" class="card-img-top card-thumbnail object-fit-cover">
                            <div class="card-body p-2 d-flex flex-column">
                                <h5 class="fw-bold card-title card-text-clamp">${item.title}</h5>
                                <p class="m-0 card-text-clamp">${previewText}</p>
                            </div>
                        </div>
                    </div>`;
                getArticleOfCreator.innerHTML += cardOfCreator
            });

            // Remove existing load more button (avoid duplicates)
            const oldBtn = document.getElementById("loadMoreCreatorBtnWrapper");
            if (oldBtn) oldBtn.remove();

            // Add Load More button in the correct position (AFTER cards)
            if (data.data.items.length === creatorPerPage) {
                getArticleOfCreator.innerHTML += `
                    <div id="loadMoreCreatorBtnWrapper" class="col-12 text-center my-3">
                        <button id="loadMoreCreatorBtn" class="btn btn-primary" type="button"
                            onclick="loadMoreCreatorArticles(${id})">
                            Load More
                        </button>
                    </div>
                `;
            }

        })
        .catch(err => console.log(err))
}


function fetchCreatorInfo(id, getArticleOfCreator, firstName, lastName, avatar) {
    spinnerArticleOfCreator.classList.remove('d-none')
    const cardOfCreator = `
    <div class="col-12 get-article ">
        <div class="card p-2 mb-4 border border-0">
            <div class="d-flex align-items-center profile-creator">
                <img src="${avatar}" width="40" height="40" alt="avatar" class="rounded-5"
                     onclick="getAllArticleOfCreator(${id}, '${firstName}', '${lastName}', '${avatar}')">
                <div>
                    <p class="ms-2 mb-0">${firstName} ${lastName}</p>
                </div>
                <button class="btn btn-info ms-auto" onclick="backToDetail()">← Back</button>
            </div>
        </div>
    </div>`;

    getArticleOfCreator.innerHTML += cardOfCreator;
}


function backToDetail() {
    const id = sessionStorage.getItem('currentArticleId')
    if (id) {
        viewDetail(id);
        // back to view detail
    }
    else {
        console.log('Still in the getAllArticleOfCreator')
        // testing purpose
    }
}

