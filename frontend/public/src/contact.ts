import setResponsive from './respMenu';
import validator from 'validator';
import $ from 'jquery';

setResponsive();

type Obj = { name: string, valid: boolean };

const validData: Array<Obj> = [
    { name: '#email', valid: false },
    { name: '#message', valid: false }
];

$('.signup__btn--message').click((e) => {
    if (validator.isEmail($(validData[0].name).val().toString())) {
        validData[0].valid = true;
    }
    
    if(!validator.isEmpty($(validData[1].name).val().toString().trim())) {
        validData[1].valid = true;
    }

    for (let i = 0; i < validData.length; i++) {
        if (!validData[i].valid) {
            e.preventDefault();
            $(validData[i].name).css('background', 'crimson');
            break;
        }
    }
});