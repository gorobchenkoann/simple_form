var form = function() {

    // Функции для изменения класса input элемента,
    // класс используется для отображения нужной иконки при валидации
    const set_succes = (element) => {
        if ($(element).hasClass('input--failure')) {
            $(element).removeClass('input--failure')
        }
        $(element).addClass('input--success')
    }
    const set_failure = (element) => {
        if ($(element).hasClass('input--success')) {
            $(element).removeClass('input--success')
        }
        $(element).addClass('input--failure')
    }

    // Функция валидации полей
    // {element} - поле 
    // {type} - тип элемента 
    // В зависимости от типа функция выполняет необходимые проверки
    // text - проверка на пустое значение и русские буквы
    // phone - проверка на соответствие маске +7(xxx)-xxx-xx-xx
    // address - проверка на пустое значение
    const validate_input = (element, type) => {
        let check_all;
        if (type === 'text') {
            let empty_check = $(element).val().trim() !== ''
            let letters_check = /^[а-яА-Я]{2,}$/.test($(element).val())
            check_all = empty_check && letters_check
        } else if (type === 'address') {
            let empty_check = $(element).val().trim() !== ''
            check_all = empty_check
        } else if (type === 'phone') {
            let str = $(element).val().replace(/\s/g, '')
            let phone_check = /^\+7\(\d{3}\)\d{3}(-\d{2}){2}$/.test(str)
            check_all = phone_check
        } 

        if (check_all) {
            set_succes($(element))
            return true
        } else {
            set_failure($(element))
            return false
        }
    }

    // Валиация поля Имя после перехода фокуса на другой элемент
    $('#name').blur(function() {
        let valid = validate_input($(this), 'text')  
        if (valid) {
            set_succes($(this))
        } else {
            set_failure($(this))
        }
    });

    // Валидация поля Телефон после перехода фокуса на другой элемент
    $('#phone').blur(function() {
        let valid = validate_input($(this), 'phone')
        
        if (valid) {
            set_succes($(this))
        } else {
            set_failure($(this))
        }
    });

    // Валидация поля Адрес после перехода фокуса на другой элемент
    $('#address').blur(function() {
        let valid = validate_input($(this), 'address')
        
        if (valid) {
            set_succes($(this))
        } else {
            set_failure($(this))
        }
    });

    $('.form').on('submit', function(e) {
        // Отменяет отправку формы
        e.preventDefault()

        let name_is_valid = validate_input($('#name'), 'text')
        let phone_is_valid = validate_input($('#phone'), 'phone')
        let address_is_valid

        if ($(window).width() <= 1260) {
            address_is_valid = validate_input($('#address'), 'address')
        } else {
            address_is_valid = $('#address_link').hasClass('address_valid')
        }

        if (name_is_valid && phone_is_valid && address_is_valid) {
            $.ajax({
                url: 'some/api/1',
                type: 'post',
                dataType: 'json',
                data: $(this).serialize(),
                success: function(data) {
                    // Один из вариантов сценария после успешной отправки данных:
                    // редирект на адрес, полученный от сервера
                    if (data.redirect) {
                        window.location.href = data.redirect
                    }
                    alert('Данные успешно отправлены')
                },
                error: function(jqXHR) {
                    if (jqXHR.status === 404) {
                        alert('Адрес сервера не найден')
                    } else if (jqXHR.status === 500) {
                        alert('Ошибка сервера')
                    } else {
                        alert(`Что-то пошло не так. Код ошибки: ${jqXHR.status}`)
                    }
                }
            });
        } 
    });  

    const init = () => {
        // Устанавливает маску для ввода телефона
        $('#phone').mask('+7 (999) 999-99-99');
    }
    
    return {
        init: init
    }
}

export let form_loader = form();
