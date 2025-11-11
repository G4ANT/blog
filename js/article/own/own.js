const API = "http://blogs.csm.linkpc.net/api/v1";
const endPointCreateArticle = "articles";
const endPointCategory = "categories?_page=1&_per_page=20&sortBy=name&sortDir=ASC";
const endPointThumbnail = "articles/1/thumbnail";

const getToken = localStorage.getItem("authToken");
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
        console.log(getCategoryItems);
        getCategoryItems.forEach(category => {
            console.log(category.id);  
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
    let title = document.getElementById("title").value;
    let content = document.getElementById("content").value;
    let category = document.getElementById("category").value;
    

    try {
        // const formData = new FormData();
        // formData.append("title", title);
        // formData.append("content", content);
        // formData.append("categoryId", Number(category));

        const articleData ={
            title: title.value.trim(),
            content: content.value.trim(),
            categoryId: Number(category)
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
        .then((data) =>{
            console.log(data);
            if(data.result){
                title.value = ""
                content.value = ""
                category.selectedIndex = 0
            }else{
                alert("Failed", data.message);
            }
        })
    } catch (error) {
        console.error({error: "Data error"});
        
    }
}
