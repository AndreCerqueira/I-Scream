let path = "";
if (window.location.pathname.includes('/index.html')){
    path += "pages/";
}

// check if username is in session storage
if (sessionStorage.getItem("characterName") == null || sessionStorage.getItem("characterName") == "") {

    // if not, redirect to costumization page
    window.location.href = path + "costumization.html";
}