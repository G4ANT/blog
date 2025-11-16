const quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Write content here...',
});

const editorDiv = document.getElementById("editor");
// Live typing validation
quill.on('text-change', function() {
    const textLength = quill.getText().trim().length;

    if (textLength >= 10) {
        editorDiv.classList.remove("is-invalid");
        editorDiv.classList.add("is-valid");
    } else {
        editorDiv.classList.remove("is-valid");
        if (document.getElementById("articleForm").classList.contains("was-validated")) {
            editorDiv.classList.add("is-invalid");
        }
    }
});

//  For access by className
const quillByclassName = new Quill('#editorByClassName',{
    theme: 'snow',
    placeholder: 'Write content here...',
});
const editorDivTage = document.getElementById('editorByClassName');
quillByclassName.on('text-change', function(){
    const textLengthContent = quillByclassName.getText().trim().length;
    if(textLengthContent >= 10){
        editorDivTage.classList.remove("is-invalid");
        editorDivTage.classList.add("is-valid");
    }else{
        editorDivTage.classList.remove("is-valid");
        if(document.getElementById("updateForm").classList.contains("was-validated")){
            editorDivTage.classList.add("is-invalid");
        }
    }
})
