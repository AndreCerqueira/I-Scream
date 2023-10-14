const selectCharacterColor = document.getElementById('characterColor');
const inputCharacterName = document.getElementById('characterName');
const confirmButton = document.getElementById('confirmButton');

let characterColor = sessionStorage.getItem('characterColor');
if (!characterColor) characterColor = 'pink';

changeCharacterColor(characterColor);
selectCharacterColor.value = characterColor;
inputCharacterName.value = sessionStorage.getItem('characterName');

function showToast() {
    const toast = document.getElementById('toast');
    toast.className = 'toast show';
    setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
}

function confirm() {
    let characterName = inputCharacterName.value.trim(); 

    if (!characterName) {
        console.log('Name is empty');
        showToast();
        return; 
    }

    let characterColor = selectCharacterColor.value;

    sessionStorage.setItem('characterColor', characterColor);
    sessionStorage.setItem('characterName', characterName);

    window.location.href = 'index.html';
}

selectCharacterColor.addEventListener('change', function() {
    const color = selectCharacterColor.value;
    changeCharacterColor(color);
});