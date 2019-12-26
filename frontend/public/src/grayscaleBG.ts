import $ from 'jquery';

const grayscale: () => void = () => {
    $(window).scroll(function() {
        $('.intro').css({
            filter: `grayscale(${$(this).scrollTop() / 5}%)`
        });
    });
}

export default grayscale;