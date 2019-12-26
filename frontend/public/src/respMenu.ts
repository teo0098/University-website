import $ from "jquery";

const setRes: () => void = () => {
    $('.menu__container').click(() => {
        $('.menu__items').toggleClass("menu__items--showed");
        $('.menu__li').toggleClass("menu__li--showed");
        $('.menu__items li').each(function (index, element) {
            $(this).toggleClass(`menu__li--showed-${index + 1}`);
        })
    });
}

export default setRes;