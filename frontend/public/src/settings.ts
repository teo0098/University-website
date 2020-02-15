import setResponsive from './respMenu';
import validation from './signup';
import $ from 'jquery';

setResponsive();

const classToggle = (...names) => {
    $(names[0]).on('click', () => {
        $(names[1]).toggleClass(names[2]);
    });
}

classToggle('.panelData__h3--change', '.signup__form--change', 'signup__form--change-active');
classToggle('.panelData__h3--delete', '.signup__form--delete', 'signup__form--delete-active');

type Obj = { name: string, valid: boolean };

const validData: Array<Obj> = [
    { name: '#password', valid: false },
    { name: '#repeatPass', valid: false }
];

validation.checkValidation('#password', '.signup__password', validation.passwordPattern, validData[0]);
validation.repeatPassword(1, validData);
validation.submitButton(validData, '.panelData__btn--change');

setResponsive();