let curPage = 1;
const pPage = 8;
const btnLoadMore = document.getElementById('btnLoadMore')

let showAllCard = document.getElementById('showAllCard')
let card = ''
const URL_GET_ARTICLE = 'http://blogs.csm.linkpc.net/api/v1'


function getData(page) {
    fetch(`${URL_GET_ARTICLE}/articles?search=&_page=${page}&_per_page=${pPage}&sortBy=content&sortDir=asc`, {
        method: 'GET',


    })
        .then(res => res.json())
        .then(data => {
            const items = data.data.items;
            if (!items || items.length === 0) {
                btnLoadMore.style.display = 'none'
                
                showNoMoreData.style.display = 'block'
                // return;
            }

            for (let i = 0; i < items.length; i++) {
                let item = items[i]

                let contentDelta;

                // If item.content is a string, try parsing as JSON
                if (typeof item.content === 'string') {
                    try {
                        contentDelta = JSON.parse(item.content); // might be a delta
                    } catch (e) {
                        // plain text fallback → wrap in a delta
                        contentDelta = { ops: [{ insert: item.content + "\n" }] };
                    }
                } else if (item.content && item.content.ops) {
                    // already a delta object
                    contentDelta = item.content;
                } else {
                    // empty or unknown format
                    contentDelta = { ops: [{ insert: "" }] };
                }

                // Convert delta to HTML
                const converter = new QuillDeltaToHtmlConverter(contentDelta.ops, {});
                const contentHTML = converter.convert();

                // 2. Strip HTML to get plain text for clamping
                function stripHTML(html) {
                    const temp = document.createElement('div');
                    temp.innerHTML = html;
                    return temp.textContent || temp.innerText || '';
                }
                const previewText = stripHTML(contentHTML);
                card =
                    `   <div class="col-12 col-md-6 col-lg-4 col-xl-3 get-article">
                                    <div class="card p-2 flex-fill" onclick="viewDetail(${item.id})" style="cursor: pointer;">
                                        <img src="${item.thumbnail}" alt="thumbnail" class="card-img card-thumbnail">
                                        <div class="card-body p-0 py-1 d-flex flex-column">
                                            <h5 class="fw-bold card-title card-text-clamp">${item.title}</h5>
                                            <p class="m-0 card-text-clamp">${previewText}</p>
                                            

                                        </div>
                                        <div class="d-flex align-item-center">
                                            <img src="${item.creator.avatar}" width="20px" height="20px" alt="avatar" class="rounded-5">
                                            <span class="ms-2">${item.creator.firstName} ${item.creator.lastName}</span>
                                        </div>
                                    </div>
                                    <button onclick="fetchAllArticleOfCreator(${item.creator.id})">Test</button>
                                </div>
                            `
                showAllCard.innerHTML += card
            }
        })
        .catch(err => console.log(err))
}


let showCardDetail = document.getElementById('showCardDetail')
function viewDetail(id) {
    showAllCard.style.display = 'none'
    btnLoadMore.style.display = 'none'
    fetch(`${URL_GET_ARTICLE}/articles/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
        .then(res => res.json())
        .then(data => {
            let item = data.data
            let cardDetail = ''
            let contentDelta;

            // If item.content is a string, try parsing as JSON
            if (typeof item.content === 'string') {
                try {
                    contentDelta = JSON.parse(item.content); // might be a delta
                } catch (e) {
                    // plain text fallback → wrap in a delta
                    contentDelta = { ops: [{ insert: item.content + "\n" }] };
                }
            } else if (item.content && item.content.ops) {
                // already a delta object
                contentDelta = item.content;
            } else {
                // empty or unknown format
                contentDelta = { ops: [{ insert: "" }] };
            }

            // Convert delta to HTML
            const converter = new QuillDeltaToHtmlConverter(contentDelta.ops, {});
            const contentHTML = converter.convert();
            const createdAt = moment(item.createdAt).format('MMM D, YYYY');
            cardDetail = `   
                                <div class="col-12 get-article">
                                    <div class="card p-2 mb-4">
                                        <div class="position-relative image-detail-wrapper">
                                            <img src="${item.thumbnail}" alt="thumbnail" class="card-img object-fit-cover border rounded" height="500px">
                                            <small class="pop-up-id text-white rounded">${item.id}</small>
                                            <button class="btn btn-info" onclick="location.href='../../index.html'">← Back</button>

                                        </div>
                                        <div class="d-flex align-item-center py-3 profile-creator">
                                            <img src="${item.creator.avatar}" width="40px" height="40px" alt="avatar" class="rounded-5" onclick="getAllArticleOfCreator(${id})">
                                            <div class="">
                                                <p class="ms-2 mb-0">${item.creator.firstName} ${item.creator.lastName}</p>
                                                <p class="ms-2"><i>pulished on ${createdAt}</i></p>
                                            </div>
                                        </div>
                                        <div class="card-body p-0 py-1">
                                            <h5 class="fw-bold card-title">${item.title}</h5>
                                            <p class="m-0">${contentHTML}</p>
                                            <p${item.id}></p$>

                                        </div>
                                    </div>
                                </div>
                            `
            showCardDetail.innerHTML = cardDetail
        })
}
getData(curPage)

btnLoadMore.addEventListener('click', () => {
    curPage++;
    getData(curPage);
})

function fetchAllArticleOfCreator(id) {
    fetch(`${URL_GET_ARTICLE}/articles/by/39?search=&_page=1&_per_page=8&sortBy=createdAt&sortDir=asc`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
        .then(res => res.json())
        .then(data => console.log(data))
}


function parseQuillContent(content) {
    let contentDelta;

    if (typeof content === 'string') {
        try {
            // parsing, it might be delta
            contentDelta = JSON.parse(content)
        }
        catch (e) {

        }
    }
}

// show all article of a creator
function getAllArticleOfCreator(id) {
    let showArticleOfCreator = document.getElementById('showArticleOfCreator')
    let cardOfCreator = ''
    fetch(`${URL_GET_ARTICLE}/articles/by/499?search=&_page=1&_per_page=8&sortBy=createdAt&sortDir=asc`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
        .then(res => res.json())
        .then(data => {
            for (let i = 0; i < data.data.items.length; i++) {
                let contentDelta;
                item = data.data.items[i]
                // If item.content is a string, try parsing as JSON
                if (typeof item.content === 'string') {
                    try {
                        contentDelta = JSON.parse(item.content); // might be a delta
                    } catch (e) {
                        // plain text fallback → wrap in a delta
                        contentDelta = { ops: [{ insert: item.content + "\n" }] };
                    }
                } else if (item.content && item.content.ops) {
                    // already a delta object
                    contentDelta = item.content;
                } else {
                    // empty or unknown format
                    contentDelta = { ops: [{ insert: "" }] };
                }

                // Convert delta to HTML
                const converter = new QuillDeltaToHtmlConverter(contentDelta.ops, {});
                const contentHTML = converter.convert();
                // 2. Strip HTML to get plain text for clamping
                function stripHTML(html) {
                    const temp = document.createElement('div');
                    temp.innerHTML = html;
                    return temp.textContent || temp.innerText || '';
                }
                const previewText = stripHTML(contentHTML);
                
                cardOfCreator = `<div class="col-12 col-md-6 col-lg-4 col-xl-3 get-article">
                                    <div class="card p-2 flex-fill" onclick="viewDetail(${item.id})" style="cursor: pointer;">
                                        <img src="${item.thumbnail}" alt="thumbnail" class="card-img card-thumbnail">
                                        <div class="card-body p-0 py-1 d-flex flex-column">
                                            <h5 class="fw-bold card-title card-text-clamp">${item.title}</h5>
                                            <p class="m-0 card-text-clamp">${previewText}</p>
                                            
                                        </div>
                                    </div>
                                </div>`
                showArticleOfCreator.innerHTML += cardOfCreator
            }
        })
}