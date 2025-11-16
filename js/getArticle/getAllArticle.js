let curPage = 1;
const pPage = 8;

const btnLoadMore = document.getElementById('btnLoadMore')

let showAllCard = document.getElementById('showAllCard')
let card = ''
let showNoMoreData = document.getElementById('showNoMoreData') 
function getData(page) {

    
    return fetch(`${BASE_URL}/articles?search=&_page=${page}&_per_page=${pPage}&sortBy=content&sortDir=asc`, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(data => {
            const items = data.data.items;
            if (!items || items.length === 0) {
                showNoMoreData.classList.remove('d-none')
                btnLoadMore.classList.add('d-none')
                return;
            }

            for (let i = 0; i < items.length; i++) {
                let item = items[i]
                let itemContent = item.content

                let previewText = parseQuillContent(itemContent)

                card =
                    `   <div class="col-12 col-md-6 col-lg-4 col-xl-3 get-article">
                                <div class="card flex-fill rounded-4 h-100" onclick="viewDetail(${item.id})" style="cursor: pointer;">
                                    <img src="${item.thumbnail}" alt="thumbnail" class="card-img-top card-thumbnail">
                                    <div class="card-body d-flex flex-column">
                                        <h5 class="fw-bold card-title card-text-clamp">${item.title}</h5>
                                        <p class="m-0 card-text-clamp">${previewText}</p>
                                        

                                    </div>
                                    <div class="d-flex p-2 align-items-center">
                                        <img src="${item.creator.avatar}" width="30" height="30" alt="avatar" class="rounded-5">
                                        <span class="ms-2">${item.creator.firstName} ${item.creator.lastName}</span>
                                    </div>
                                </div>
                            </div>
                        `
                showAllCard.innerHTML += card
            }
        })
        .catch(err => console.log(err))
        .finally(() => {
            // Restore button text
            btnLoadMore.disabled = false;
            spinner.classList.add('d-none')
            spinnerText.textContent = "Load more"
        });
}

getData(curPage)

btnLoadMore.addEventListener('click', () => {

    btnLoadMore.disabled = true;
    spinner.classList.remove('d-none'); 
    spinnerText.textContent = "Loading..."
    curPage++;
    getData(curPage)        
})


function parseQuillContent(content) {
    let contentDelta;

    // If item.content is a string, try parsing as JSON
    if (typeof content === 'string') {
        try {
            contentDelta = JSON.parse(content); // might be a delta
        } catch (e) {
            // plain text fallback → wrap in a delta
            contentDelta = { ops: [{ insert: content + "\n" }] };
        }
    } else if (content && content.ops) {
        // already a delta object
        contentDelta = content;
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
        return (temp.textContent || temp.innerText || '')
            .replace(/[\s\u200B\u200C\u200D\uFEFF]+/g, ' ')
            .trim()


        // stripHTML("<p>Hello <b>World</b></p>")
        // Hello World


        // trim for delete space in all cards
    }
    const previewText = stripHTML(contentHTML);

    return previewText
}

