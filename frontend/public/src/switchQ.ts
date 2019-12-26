const intro__h4 = document.querySelector('.intro__h4');
const qualities: Array<string> = ['PASSION','JOY','ENTHUSIASM','KINDNESS'];
let element_position: number = 0;
let letter_position: number = 0;
let text: string = qualities[0];
let removed: boolean = false;

intro__h4.textContent = qualities[0];

const changeQuality: () => void = () => {
    if (element_position === 4) element_position = 0;
    if (removed) {
        if (text.length === qualities[element_position].length) {
            setTimeout(() => {
                removed = false;
                letter_position = 0;
            }, 1000);
        } else {
            text += qualities[element_position][letter_position];
            intro__h4.textContent = text;
            letter_position++;
        }
    } else {
        if (text.length === 0) {
            element_position++;
            removed = true;
            text = '';
        } else {
            text = text.substring(0, text.length - 1);
            intro__h4.textContent = text;
        }
    }
}

export default changeQuality;