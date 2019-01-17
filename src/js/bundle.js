(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.form_loader = void 0;

var form = function form() {
  // Функции для изменения класса input элемента,
  // класс используется для отображения нужной иконки при валидации
  var set_succes = function set_succes(element) {
    if ($(element).hasClass('input--failure')) {
      $(element).removeClass('input--failure');
    }

    $(element).addClass('input--success');
  };

  var set_failure = function set_failure(element) {
    if ($(element).hasClass('input--success')) {
      $(element).removeClass('input--success');
    }

    $(element).addClass('input--failure');
  }; // Функция валидации полей
  // {element} - поле 
  // {type} - тип элемента 
  // В зависимости от типа функция выполняет необходимые проверки
  // text - проверка на пустое значение и русские буквы
  // phone - проверка на соответствие маске +7(xxx)-xxx-xx-xx
  // address - проверка на пустое значение


  var validate_input = function validate_input(element, type) {
    var check_all;

    if (type === 'text') {
      var empty_check = $(element).val().trim() !== '';
      var letters_check = /^[а-яА-Я]{2,}$/.test($(element).val());
      check_all = empty_check && letters_check;
    } else if (type === 'address') {
      var _empty_check = $(element).val().trim() !== '';

      check_all = _empty_check;
    } else if (type === 'phone') {
      var str = $(element).val().replace(/\s/g, '');
      var phone_check = /^\+7\(\d{3}\)\d{3}(-\d{2}){2}$/.test(str);
      check_all = phone_check;
    }

    if (check_all) {
      set_succes($(element));
      return true;
    } else {
      set_failure($(element));
      return false;
    }
  }; // Валиация поля Имя после перехода фокуса на другой элемент


  $('#name').blur(function () {
    var valid = validate_input($(this), 'text');

    if (valid) {
      set_succes($(this));
    } else {
      set_failure($(this));
    }
  }); // Валидация поля Телефон после перехода фокуса на другой элемент

  $('#phone').blur(function () {
    var valid = validate_input($(this), 'phone');

    if (valid) {
      set_succes($(this));
    } else {
      set_failure($(this));
    }
  }); // Валидация поля Адрес после перехода фокуса на другой элемент

  $('#address').blur(function () {
    var valid = validate_input($(this), 'address');

    if (valid) {
      set_succes($(this));
    } else {
      set_failure($(this));
    }
  });
  $('.form').on('submit', function (e) {
    // Отменяет отправку формы
    e.preventDefault();
    var name_is_valid = validate_input($('#name'), 'text');
    var phone_is_valid = validate_input($('#phone'), 'phone');
    var address_is_valid;

    if ($(window).width() <= 1260) {
      address_is_valid = validate_input($('#address'), 'address');
    } else {
      address_is_valid = $('#address_link').hasClass('address_valid');
    }

    if (name_is_valid && phone_is_valid && address_is_valid) {
      $.ajax({
        url: 'some/api/1',
        type: 'post',
        dataType: 'json',
        data: $(this).serialize(),
        success: function success(data) {
          // Один из вариантов сценария после успешной отправки данных:
          // редирект на адрес, полученный от сервера
          if (data.redirect) {
            window.location.href = data.redirect;
          }

          alert('Данные успешно отправлены');
        },
        error: function error(jqXHR) {
          if (jqXHR.status === 404) {
            alert('Адрес сервера не найден');
          } else if (jqXHR.status === 500) {
            alert('Ошибка сервера');
          } else {
            alert("\u0427\u0442\u043E-\u0442\u043E \u043F\u043E\u0448\u043B\u043E \u043D\u0435 \u0442\u0430\u043A. \u041A\u043E\u0434 \u043E\u0448\u0438\u0431\u043A\u0438: ".concat(jqXHR.status));
          }
        }
      });
    }
  });

  var init = function init() {
    // Устанавливает маску для ввода телефона
    $('#phone').mask('+7 (999) 999-99-99');
  };

  return {
    init: init
  };
};

var form_loader = form();
exports.form_loader = form_loader;

},{}],2:[function(require,module,exports){
"use strict";

var _form = require("./form");

var _map = require("./map");

_form.form_loader.init();

_map.map_loader.init();

},{"./form":1,"./map":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.map_loader = void 0;

var map = function map() {
  // Удаляет блок карты на планшетах и мобильных
  $(window).resize(function () {
    if ($(this).width() <= 1260) {
      $('#form_map').remove();
    }
  }); // Делает видимым блок с картой при клике на ссылку

  $('#address_link').click(function () {
    $('#form_map').css('display', 'block');
  });

  function init_map() {
    var myPlacemark,
        myMap = new ymaps.Map('form_map', {
      center: [59.95, 30.3],
      // Санкт-Петербург
      zoom: 12
    }, {
      searchControlProvider: 'yandex#search'
    }); // Добавляет обработчик клика на карте

    myMap.events.add('click', function (e) {
      var coords = e.get('coords'); // Изменяет координаты метки, если она уже существует

      if (myPlacemark) {
        myPlacemark.geometry.setCoordinates(coords);
      } // Создает новую метку на карте
      else {
          myPlacemark = createPlacemark(coords);
          myMap.geoObjects.add(myPlacemark); // Добавляет обработчик окончания перетаскивания на метке.

          myPlacemark.events.add('dragend', function () {
            getAddress(myPlacemark.geometry.getCoordinates());
          });
        }

      getAddress(coords);
    }); // Создает метку

    function createPlacemark(coords) {
      return new ymaps.Placemark(coords, {
        iconCaption: 'поиск...'
      }, {
        preset: 'islands#violetDotIconWithCaption',
        draggable: true
      });
    } // Определяет адрес по координатам


    function getAddress(coords) {
      myPlacemark.properties.set('iconCaption', 'поиск...');
      ymaps.geocode(coords).then(function (res) {
        var firstGeoObject = res.geoObjects.get(0);
        myPlacemark.properties.set({
          // Формируем строку с данными об объекте.
          iconCaption: [// Название населенного пункта или вышестоящее административно-территориальное образование.
          firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(), // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
          firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()].filter(Boolean).join(', '),
          // В качестве контента балуна задаем строку с адресом объекта.
          balloonContent: firstGeoObject.getAddressLine()
        }); // Отрисосвывает найденный адрес в элементе с id=address_link
        // - изменяет текст внутри элемента
        // - добавляет атрибут title для отображения полного текста,
        // если его часть обрежется
        // - добавляет класс address_valid для прохождения валидации
        // при отправке формы

        $('#address_link').text(firstGeoObject.getAddressLine()).attr('title', firstGeoObject.getAddressLine()).addClass('address_valid'); // Делает видимым плэйсхолдер над адресом

        $('.address_placeholder').text('Расположение объекта').css('display', 'block'); // Делает видимой кнопку для удаления адреса

        $('.address_remove').css('display', 'block');
      });
    } // Обработчик клика по кнопке удаления адреса


    $('#address_remove').click(function () {
      // Возвращает исходный вариант ссылки
      $('#address_link').text('Расположениe объекта').removeClass('address_valid'); // Скрывает плэйсхолдер

      $('.address_placeholder').css('display', 'none'); // Удаляет метку с карты и обнуляет переменную myPlacemark,
      // чтобы можно было создать новую метку

      myMap.geoObjects.remove(myPlacemark);
      myPlacemark = null; // Самоуничтожается

      $(this).css('display', 'none');
    });
  }

  var init = function init() {
    // Выполняет переданную в параметре функцию, когда
    // API Яндекс карт готово к использованию 
    ymaps.ready(init_map);
  };

  return {
    init: init
  };
};

var map_loader = map();
exports.map_loader = map_loader;

},{}]},{},[2]);
