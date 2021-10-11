$(document).ready(function() {
    $(".js-menu-list").on("click", ".menu__item", function(){
        $(".menu__item").removeClass("menu__item--active"); //удаляем класс во всех вкладках
        $(this).addClass("menu__item--active"); //добавляем класс текущей (нажатой)
    });

    /* form */
    var $input = $('.js-input');
    $('.js-form').on('change', function(){
        $input.each(function (){
            if($(this).val().length) {
                $(this).addClass('is-full');
            } else {
                $(this).removeClass('is-full');
            }
        });
    });

    $('.select').on('click', '.select__head', function () {
        if ($(this).hasClass('select__head--open')) {
            $(this).removeClass('select__head--open');
            $(this).next().fadeOut();
        } else {
            $('.select__head').removeClass('select__head--open');
            $('.select__list').fadeOut();
            $(this).addClass('select__head--open');
            $(this).next().fadeIn();
        }
    });

    $('.select').on('click', '.select__item', function () {
        $('.select__head').removeClass('select__head--open');
        $(this).parent().fadeOut();
        $(this).parent().prev().text($(this).text());
        $(this).parent().prev().prev().val($(this).text());
    });

    $(document).click(function (e) {
        if (!$(e.target).closest('.select').length) {
            $('.select__head').removeClass('select__head--open');
            $('.select__list').fadeOut();
        }
    });


    $('.js-text_toggle').click(function(){
        $('.js-table_desc').slideToggle(300, function(){
            if ($(this).is(':hidden')) {
                $('.js-text_toggle span').html('Показать загруженные файлы');
                $('.js-text_toggle img').css('transform', '');

            } else {
                $('.js-text_toggle span').html('Скрыть загруженные файлы');
                $('.js-text_toggle img').css('transform', 'rotate(180deg)');
            }
        });
        return false;
    });

});

/*button-file*/

$(document).ready(function(){
    var $fileAdd = $("#file-add");
    var $errorMessage = $("#error-message");
    var types = ["application/pdf", "image/jpeg", "image/png", "image/tiff", "image/gif",
        "image/x-pcx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword", "application/vnd.ms-excel", "audio/mpeg", "image/bmp",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint",
        "image/x-wmf"];
    var $buttonFileAdd = $fileAdd.find(".button-file .button-file__add");
    var $fileTable = $fileAdd.find(".js-file__table");
    var $fileDetails = $("#filedetails");
    window.store = {
        filesS: [], // хранилище для файлов
    };

    var $maxSize = 10, // MB
        $currentSize = 0,
        $remainSize = 0;

    var $maxQuantity = 10, //шт
        $currentQuantity = 0,
        $remainQuantity = 0;

    function refreshSpace() {
        $("#totalsize span").text($currentSize.toFixed(2));
        $("#remainsize span").text($remainSize.toFixed(2));
    }

    $(".file__input").change(function(e) {
        var $files = e.target.files;

        if (!$files.length) {
            $fileTable.removeClass("file__table--show");
            return;
        } else {
            $fileTable.addClass("file__table--show");
        }

        $buttonFileAdd.removeClass("js-size");
        $buttonFileAdd.removeClass("js-quantity");

        for (var i = 0; i < $files.length; i++){
            var fl = $files[i];
            if (ParseFile(fl) === false){
                if( $buttonFileAdd.hasClass("js-quantity")){
                    $errorMessage.append("<span>Превышен лимит по количеству файлов</span>");
                    Disappear();
                    break;
                }if( $buttonFileAdd.hasClass("js-size")){
                    $errorMessage.append("<span>не хватает места - есть только&ensp;&ensp;" + $remainSize.toFixed(2) + "&ensp;&ensp;MB</span>");
                    Disappear();
                    break;
                }
            }else {
                addFiles(fl); // добавляем файлы в хранилище
                afterDeletion();
            }
        }
        refreshSpace();
        e.target.value = '';
    });

    $fileDetails.on("click", ".delete", function() {
        $fileAdd.addClass("js-active");
        var $parent = $(this).closest(".filedetails__add"),
            $filesize = $parent.attr("data-filesize"),
            $fileindex = $parent.attr("data-fileindex");
        $currentSize -= $filesize;
        $currentQuantity -= 1;
        $remainSize = $maxSize - $currentSize;
        $remainQuantity = $maxQuantity - $currentQuantity;
        refreshSpace();
        removeFile($fileindex);
        $parent.remove();
        afterDeletion();
    });

    function ParseFile(file) {
        var $filename = file.name;
        var $filesize = file.size / 1024;
        $filesize = (Math.round(($filesize / 1024) * 100) / 100);

        if (-1 == $.inArray(file.type, types)) {
            $errorMessage.append("<span>Можно загрузить файлы следующих форматов PDF, GIF, JPG," +
                " JPEG, PNG, TIF, TIFF, WMF, DOC, DOCX, RTF, XLS, XLSX, PPS, PPT, BMP, MP3," +
                " общий объем которых не превышает 10 МБ.</span>");
            Disappear();
            $remainSize = $maxSize - $currentSize;
            $remainQuantity = $maxQuantity - $currentQuantity;
            return false;
        }else{
            if ($currentSize + $filesize >= $maxSize) {
                $buttonFileAdd.addClass("js-size");
                return false;
            }
            if ($currentQuantity + 1 > $maxQuantity){
                $buttonFileAdd.addClass("js-quantity");
                return false;
            }
            $currentQuantity += 1;
            $remainQuantity = $maxQuantity - $currentQuantity;
            $currentSize += $filesize;
            $remainSize = $maxSize - $currentSize;

            $fileDetails.append("<tr class='filedetails__add' data-filesize='" + $filesize + "'><td><strong>" + $filename + " (" + $filesize + " MB)&ensp;&ensp;&ensp;</strong></td><td><a href='#' onclick='return false' class='delete'>удалить</a></td></tr>");
        }
    }

    function afterDeletion() {
        var $fileDetailsAdds = $fileDetails.find(".filedetails__add");
        $fileDetailsAdds.each(function(index) {
            $(this).attr("data-fileindex",index);
        });
    }

    function removeFile(index) {
        // удаляем файл по индексу
        store.filesS.splice(index, 1);
    }

    function addFiles(files) {
        // добавляем файлы в общую кучу
        store.filesS = store.filesS.concat(files);
    }

    function Disappear() {
        var $errorMessageText = $errorMessage.find("span");
        setTimeout(function () {
            $errorMessageText.fadeOut(function(){$errorMessageText.remove()});
        }, 10000);
    }
});

/*Обновить страницу при изменении размера*/
/*$(window).bind('resize', function(e)
{
    if (window.RT) clearTimeout(window.RT);
    window.RT = setTimeout(function()
    {
        this.location.reload(false);
    }, 100);
});*/

var modalCloseEvent;
if ( typeof (Event) === 'function' ) {
    modalCloseEvent = new CustomEvent( 'modalWasClosed' );
} else {
    modalCloseEvent = document.createEvent( 'Event' );
    modalCloseEvent.initEvent( 'modalWasClosed', true, true );
}

function toggleMenu() {
    var menuButton = document.querySelector( '.menu__button' );
    if ( menuButton.getAttribute( 'aria-expanded' ) === 'true' ) {
        closeMenu();
    } else {
        openMenu();
    }
}

function openMenu() {
    var body = document.querySelector( 'body' );
    var menuButton = document.querySelector( '.menu__button' );
    var expanded = menuButton.getAttribute( 'aria-expanded' ) === 'true';
    menuButton.setAttribute( 'aria-expanded', String( !expanded ) );
    menuButton.classList.add( 'menu__button--open' );
    body.classList.add( 'page__body--menu-open' );
    if ( !window.matchMedia( '(min-width: 1366px' ).matches ) {
        var modal = document.querySelector( '.js-menu-modal' );
        modal.classList.add( 'is-active' );
    }
}

function closeMenu() {
    var body = document.querySelector( 'body' );
    var menuButton = document.querySelector( '.menu__button' );
    menuButton.setAttribute( 'aria-expanded', String( false ) );
    menuButton.classList.remove( 'menu__button--open' );
    body.classList.remove( 'page__body--menu-open' );
    var modal = document.querySelector( '.js-menu-modal' );
    modal.classList.remove( 'is-active' );
}

function updateMenu() {
    if ( window.matchMedia( '(min-width: 1366px' ).matches ) {
        deactiveModalMenu();
    } else {
        activeModalMenu();
    }
}


function deactiveModalMenu() {
    var menu = document.querySelector( '.js-menu' );
    if ( menu.querySelector( '.js-menu-list' ) ) {
        return;
    }
    var menuList = document.querySelector( '.js-menu-list' );
    menuList.classList.remove( 'menu__list--open' );
    menu.appendChild( menuList );
}

function activeModalMenu() {
    var modal = document.querySelector( '.js-menu-modal' );
    var modalContent = modal.querySelector( '.js-modal-menu-container' );
    if ( modalContent.querySelector( '.js-menu-list' ) ) {
        return;
    }
    var menuList = document.querySelector( '.js-menu-list' );
    menuList.classList.add( 'menu__list--open' );
    modalContent.appendChild( menuList );
}

(function () {
    var menuButton = document.querySelector( '.menu__button' );
    var menuCloseButtons = document.querySelectorAll( '.js-menu-close' );
    menuButton.addEventListener( 'click', toggleMenu );
    Array.prototype.forEach.call( menuCloseButtons, function ( menuCloseButton ) {
        menuCloseButton.addEventListener( 'click', closeMenu );
    } );

    updateMenu();
    window.addEventListener( "optimizedResize", function () {
        updateMenu();
    });

    window.addEventListener("resize", function() {
        updateMenu();
    });

    document.body.addEventListener( 'modalWasClosed', function () {
        document.body.classList.remove( 'is-modal-open' );
    } )
})();

(function () {
    var modalOpenButtons = document.querySelectorAll( '.js-modal-open' );
    if ( !modalOpenButtons ) {
        return;
    }
    var modalCloseButtons = document.querySelectorAll( '.js-modal-close' );
    if ( modalCloseButtons ) {
        Array.prototype.forEach.call( modalCloseButtons, function ( modalCloseButton ) {
            modalCloseButton.addEventListener( 'click', function () {
                var modal = document.querySelector( '#' + this.dataset.target );
                modal.classList.remove( 'is-active' );
                document.body.classList.remove( 'is-modal-open' );
            } );
        } );
    }
})();

(function () {
    /*ползунок*/
    var sliders = document.querySelectorAll(".slider");
    Array.prototype.forEach.call(sliders, function (slider) {
        var sliderInput = slider.querySelector(".slider__input");
        var output =  slider.querySelector(".slider__value");
        output.innerHTML = sliderInput.value;
        sliderInput.oninput = function() {
            output.innerHTML = this.value;
        }
    });
})();









