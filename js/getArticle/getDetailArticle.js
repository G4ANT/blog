let showCardDetail = document.getElementById('showCardDetail')

let spinnerArticleDetail = document.getElementById('spinnerArticleDetail')


function viewDetail(id) {

    spinnerArticleDetail.classList.remove('d-none')
    spinnerArticleOfCreator.classList.remove('d-none')

    showAllCard.style.display = 'none'
    showNoMoreData.classList.add('d-none')
    btnLoadMore.style.display = 'none'
    showCardDetail.style.display = 'block'
    showArticleOfCreator.style.display = 'none'

    sessionStorage.setItem('currentArticleId', id)
    fetch(`${BASE_URL}/articles/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
        .then(res => res.json())
        .then(data => {
            let item = data.data
            let itemContent = item.content
            let previewText = parseQuillContent(itemContent)
            const createdAt = moment(item.createdAt).format('MMM D, YYYY');
            cardDetail = `   
                            <div class="col-12 get-article">
                                <div class="card border border-0 mb-4">
                                    <div class="position-relative image-detail-wrapper">
                                        <img src="${item.thumbnail}" alt="thumbnail" class="card-img-top object-fit-cover" height="400px">
                                        <small class="pop-up-id text-white rounded">${item.id}</small>
                                        <button class="btn btn-info" onclick="location.href='../../index.html'">← Back</button>

                                    </div>
                                    <div class="d-flex align-item-center p-2 profile-creator">
                                        <img src="${item.creator.avatar}" width="40px" height="40px" alt="avatar" class="rounded-5" onclick="getAllArticleOfCreator(${item.creator.id}, '${item.creator.firstName}', '${item.creator.lastName}', '${item.creator.avatar}' )" >
                                        <div>
                                            <p class="ms-2 mb-0">${item.creator.firstName} ${item.creator.lastName}</p>
                                            <p class="ms-2"><i>pulished on ${createdAt}</i></p>
                                        </div>
                                    </div>
                                    <div class="card-body p-2">
                                        <h5 class="fw-bold card-title">${item.title}</h5>
                                        <p class="m-0">${previewText}</p>
                                    </div>
                                </div>
                            </div>
                        `
            showCardDetail.innerHTML = cardDetail
        })
        .catch(err => console.log(err))
        // .finally(() => {
        //     $("#showCardDetail").LoadingOverlay("hide", true);
        // });
}