import setResponsive from './respMenu';
import validation from './signup';

setResponsive();

type Obj = { name: string, valid: boolean };

const validData: Array<Obj> = [
    { name: '#password', valid: false },
    { name: '#repeatPass', valid: false }
];

validation.checkValidation('#password', '.signup__password', validation.passwordPattern, validData[0]);
validation.repeatPassword(1, validData);
validation.submitButton(validData, '.panelData__btn');