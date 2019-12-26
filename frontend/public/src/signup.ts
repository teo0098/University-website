import setResponsive from './respMenu';
import $ from 'jquery';
import validate from 'validator';

setResponsive();

type Obj = { name: string, valid: boolean };

const validData: Array<Obj> = [
    { name: '#name', valid: false },
    { name: '#lastname', valid: false },
    { name: '#password', valid: false },
    { name: '#repeatPass', valid: false },
    { name: '#pin', valid: false },
    { name: '#phone', valid: false },
    { name: '#email', valid: false },
    { name: '#zipcode', valid: false },
    { name: '#place', valid: false },
    { name: '#apartment', valid: false },
    { name: '#street', valid: false },
];

const checkValidation = (id: string, cl: string, pattern: RegExp, obj : Obj): void => {
    $(id).on('keyup', () => {
        $(id).css('background', 'transparent');
        let result = pattern.test($(id).val().toString());
        if (result) {
            $(cl).css('display', 'none');
            obj.valid = true;
        }
        else {
            obj.valid = false;
            $(cl).css('display', 'block');
        }
    });
}

const namePattern: RegExp = /^[a-zA-ZęóąśłżźćńĘÓĄŚŁŻŹĆŃ\s]{2,20}$/;
const lastNamePattern: RegExp = /^[a-zA-ZęóąśłżźćńĘÓĄŚŁŻŹĆŃ\s]{2,30}$/;
const passwordPattern: RegExp = /^[a-zA-Z0-9ęóąśłżźćńĘÓĄŚŁŻŹĆŃ@#!$*_\^&\.,\-]{8,30}$/;
const pinPattern: RegExp = /^[0-9]{11}$/;
const phonePattern: RegExp = /^[0-9]{9,30}$/;
const zipcodePattern: RegExp = /^[0-9]{2,5}-[0-9]{2,5}$/;
const placePattern: RegExp = /^[a-zA-ZęóąśłżźćńĘÓĄŚŁŻŹĆŃ\s]{3,30}$/;
const apartmentPattern: RegExp = /^[a-zA-Z0-9]{1,5}\/?([a-zA-Z0-9]{1,5})?$/;

checkValidation('#name', '.signup__name', namePattern, validData[0]);
checkValidation('#lastname', '.signup__lastname', lastNamePattern, validData[1]);
checkValidation('#password', '.signup__password', passwordPattern, validData[2]);
checkValidation('#pin', '.signup__pin', pinPattern, validData[4]);
checkValidation('#phone', '.signup__phone', phonePattern, validData[5]);
checkValidation('#zipcode', '.signup__zipcode', zipcodePattern, validData[7]);
checkValidation('#place', '.signup__place', placePattern, validData[8]);
checkValidation('#apartment', '.signup__apartment', apartmentPattern, validData[9]);
checkValidation('#street', '.signup__street', placePattern, validData[10]);

$('#repeatPass').on('keyup', function() {
    $('#repeatPass').css('background', 'transparent');
    if ($(this).val() === $('#password').val()) {
        $('.signup__repeatPass').css('display', 'none');
        validData[3].valid = true;
    }
    else {
        $('.signup__repeatPass').css('display', 'block');
        validData[3].valid = false;
    }
});

$('#email').on('keyup', () => {
    $('#email').css('background', 'transparent');
    let result = validate.isEmail($('#email').val().toString());
    if (result && $('#email').val().toString().length < 61) {
        $('.signup__email').css('display', 'none');
        validData[6].valid = true;
    }
    else {
        $('.signup__email').css('display', 'block');
        validData[6].valid = false;
    } 
});

$('.signup__btn').on('click', (e) => {
    for (let i = 0; i < validData.length; i++) {
        if (!validData[i].valid) {
            e.preventDefault();
            $(validData[i].name).css('background', 'crimson');
            break;
        }
    }
});