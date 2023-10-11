

function alterarCorPersonagem(cor) {
    const cores = {
        rosa: {
            background: '#F982BF',
            lights: '#FF98CC',
            shadow: '#962b62',
            glare: '#FF98CC',
            eye: '#FF2995',
            mouth: '#FF2995'
        },
        amarelo: {
            background: '#F9E07F',
            lights: '#fff9aa',
            shadow: '#b89b3b',
            glare: '#fff9aa',
            eye: '#c49318',
            mouth: '#c49318'
        },
        verde: {
            background: '#8CF982',
            lights: '#abffae',
            shadow: '#4a7f4e',
            glare: '#abffae',
            eye: '#228B22',
            mouth: '#228B22'
        }
    };

    const corCSS = cores[cor];

    if (!corCSS) {
        console.error('Cor não reconhecida:', cor);
        return;
    }

    const title = document.querySelector('.title');
    const iceCream = document.querySelector('.ice-cream');
    const glare = document.querySelector('.glare');
    const eyes = document.querySelectorAll('.eye');
    const mouth = document.querySelector('.mouth');

    iceCream.style.backgroundColor = corCSS['background'];
    iceCream.style.borderTopColor = corCSS['lights']; 
        
    glare.style.backgroundColor = corCSS['glare'];

    eyes.forEach(eye => { 
        eye.style.backgroundColor = corCSS['eye'];
        eye.style.borderBottomColor = corCSS['lights'];
    });
        
    mouth.style.backgroundColor = corCSS['mouth'];
    mouth.style.borderBottomColor = corCSS['lights']; 

    title.style.color = corCSS['lights'];
    title.style.textShadow = `0 0 10px ${corCSS['shadow']}`;

}