import setResponsive from './respMenu';
import validation from './signup';
import $ from 'jquery';

setResponsive();

$('.panelData__h3').on('click', () => {
    $('.signup__form').toggleClass('signup__form--active');
});

type Obj = { name: string, valid: boolean };

const validData: Array<Obj> = [
    { name: '#password', valid: false },
    { name: '#repeatPass', valid: false }
];

validation.checkValidation('#password', '.signup__password', validation.passwordPattern, validData[0]);
validation.repeatPassword(1, validData);
validation.submitButton(validData, '.panelData__btn');