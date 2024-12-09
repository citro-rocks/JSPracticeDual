const inputSEction = document.querySelector(".input-section");

//Prevent text input only numbers
const inputField = document.querySelector('#input-value');
inputField.onkeydown = (event) => {
    if(isNaN(event.key) && event.key !== 'Backspace') {
        event.preventDefault()
    }
};

const buttonActive = document.getElementById('drawButton');
document.getElementById('drawButton').addEventListener('click',
    function() {
        const number = parseInt(document.getElementById('input-value').value);
        const shadeBox = document.getElementById('shade-box');
        shadeBox.innerHTML = '';
    
        for (let i = 0; i < number; i++) {
            const element = document.createElement('div');
            const shade = Math.floor((i / (number - 1)) * 255);
            const textColor = shade < 123 ? 'white' : 'black';
            element.style.backgroundColor = `rgb(${shade}, ${shade}, ${shade})`;
            element.className = 'element';
            element.textContent = `${i + 1}. nijansa sive`;
            element.style.color = textColor;
            shadeBox.appendChild(element);
        } 

        if(number > 50) {
            alert('Unesite broj manji od 51');
            // const alert = document.inputSEction.appendChild('label');
            // alert.inerText = 'Unesite broj manji od 51';
        }
    }

);








