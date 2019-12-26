import setResponsive from './respMenu';
import switchQuality from './switchQ';
import grayscaleBG from './grayscaleBG';

setResponsive();

setTimeout(() => {
    setInterval(() => {switchQuality();}, 300);
}, 2000);

grayscaleBG();