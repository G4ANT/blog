// show all article of a creator
let showArticleOfCreator = document.getElementById('showArticleOfCreator')
function getAllArticleOfCreator(id, firstName, lastName, avatar) {

    showCardDetail.style.display = 'none'

    showArticleOfCreator.innerHTML = ''
    showArticleOfCreator.style.display = 'flex';

    // fetch infor of creator
    fetchCreatorInfo(id, showArticleOfCreator, firstName, lastName, avatar)

    // fetch creator infomation 
    fetchCreatorArticles(id, showArticleOfCreator)

}

function fetchCreatorArticles(id, getArticleOfCreator) {
    $("#showArticleOfCreator").LoadingOverlay("show", {
        // image: "",
        // fontawesome: "fa fa-spinner fa-spin",
        // background: "rgba(0, 0, 0, 0.4)",
        // text: "",
        // textColor: "#fff",
    });
    // console.log(id)
    fetch(`${URL_GET_ARTICLE}/articles/by/${id}?search=&_page=1&_per_page=8&sortBy=createdAt&sortDir=asc`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
        .then(res => res.json())
        .then(data => {
            for (let i = 0; i < data.data.items.length; i++) {
                const item = data.data.items[i]
                let itemContent = item.content
                let previewText = parseQuillContent(itemContent)

                let cardOfCreator = `<div class="col-12 col-md-6 col-lg-4 col-xl-3">
                                    <div class="card flex-fill" onclick="viewDetail(${item.id})" style="cursor: pointer;">
                                        <img src="${item.thumbnail}" alt="thumbnail" class="card-img card-thumbnail  object-fit-cover">
                                        <div class="card-body p-2 d-flex flex-column">
                                            <h5 class="fw-bold card-title card-text-clamp">${item.title}</h5>
                                            <p class="m-0 card-text-clamp">${previewText}</p>
                                            
                                        </div>
                                    </div>
                                </div>`
                getArticleOfCreator.innerHTML += cardOfCreator
            }

        })
        .catch(err => console.log(err))
        .finally(() => {
            $("#showArticleOfCreator").LoadingOverlay("hide", true);
        });
}




function fetchCreatorInfo(id, getArticleOfCreator, firstName, lastName, avatar) {
    const cardOfCreator = `
    <div class="col-12 get-article">
        <div class="card p-2 mb-4">
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

// function fetchCreatorInfo(id, getArticleOfCreator, firstName, lastName, avatar) {

//     // user name
//     fetch(`${URL_GET_ARTICLE}/articles/${id}`, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${localStorage.getItem('authToken')}`
//         }
//     })
//         .then(res => res.json())
//         .then(data => {
//             let item = data.data
//             console.log(id)
//             const createdAt = moment(item.createdAt).format('MMM D, YYYY');
//             let cardOfCreator = `   
//                                 <div class="col-12 get-article">
//                                     <div class="card p-2 mb-4">
//                                         <div class="position-relative image-detail-wrapper">

//                                         </div>
//                                         <div class="d-flex align-item-center py-3 profile-creator">
//                                         <img src="${avatar}" width="40px" height="40px" alt="avatar" class="rounded-5" onclick="getAllArticleOfCreator(${item.creator.id})">
//                                         <div class="">
//                                             <p class="ms-2 mb-0">${firstName} ${lastName}</p>
//                                             <p class="ms-2"><i>pulished on ${createdAt}</i></p>
//                                         </div>
//                                         <button class="btn btn-info" onclick="location.href='getDetailArticle.html'">← Back</button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             `
//             getArticleOfCreator.innerHTML += cardOfCreator // append, not overwrite
//         })
//     // user name

// }

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

