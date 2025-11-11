const API = "http://blogs.csm.linkpc.net/api/v1";
const endPointCreateArticle = "articles";
const endPointCategory = "categories?_page=1&_per_page=20&sortBy=name&sortDir=ASC";

const getToken = localStorage.getItem("authToken");
getCategoryData()
function getCategoryData() {
   try {
    let categoryOption = document.getElementById("category");
    fetch(`${API}/${endPointCategory}`,{
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getToken}`
        }
    })
    .then(res => res.json())
    .then((data) =>{
        const getCategoryItems = data.data.items;
        getCategoryItems.forEach(category => {
            let options = `
                <option value="${category.id}">${category.name}</option>
            `;
                categoryOption.innerHTML += options; 
        }); 
    })
    .catch(error =>{console.error(error.message, "data error");
    })
} catch (error) {
    console.error("Data error: ", error.message);   
} 
}
// try {
//     let thumbnail = document.getElementById("thumbnail").files[0];

//     const formData = new FormData();
//     formData.append("thumbnail", thumbnail);

//     fetch(`${API}/${endPointThumbnail}`,{
//         method: "POST",
//         headers:{"Authorization": `Bearer ${getToken}`},
//         body: formData
//     })
//     .then(res => res.json())
//     .then(data =>{
//         console.log(data);
        
//     })
//     .catch(error =>{console.log(error.message ,"Error")})
// } catch (error) {
//     console.error("Data error thumbnail: ",error.message); 
// }


function onClickSubmit(){
    let title = document.getElementById("title");
    let content = document.getElementById("content");
    let category = document.getElementById("category");
    let thumbnailFile = document.getElementById("thumbnail").files[0];
    
    try {

        const articleData ={
            title: title.value.trim(),
            content: content.value.trim(),
            categoryId: Number(category.value)
        }

        fetch(`${API}/${endPointCreateArticle}`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken}`
            },
            body: JSON.stringify(articleData)
        })
        .then((res) => res.json())
        .then((dataArticle) =>{
            if (!dataArticle.result || !dataArticle.data.id) {
          console.error("Article creation failed:", dataArticle.message);
          return;
        }
            const articleId = dataArticle.data.id;

            let formData = new FormData();
            formData.append("thumbnail", thumbnailFile);

            return fetch(`${API}/articles/${articleId}/thumbnail`, {
                method: "POST",
                headers: {"Authorization": `Bearer ${getToken}`},
                body: formData
            })
            .then(res => res.json())
            .then(dataThumbnail =>{
                if(!dataThumbnail) return;
                 console.log("Thumbnail uploaded:", dataThumbnail);
                 if(dataThumbnail.result){
                    alert("sucess");
                    title.value = ""
                    content.value = ""
                    category.selectedIndex = 0
                   document.getElementById("thumbnail").value = "";
                 }else{
                    console.log("Create aricle is fail");
                    
                 }
            })
        })
    } catch (error) {
        console.error({error: "Data error"});
        
    }
}

