
// check if username is in session storage
if (sessionStorage.getItem("characterName") == null || sessionStorage.getItem("characterName") == "") {

    // if not, redirect to costumization page
    window.location.href = "costumization.html";
}