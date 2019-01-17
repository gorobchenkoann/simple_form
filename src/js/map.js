var map = function() {

    // Удаляет блок карты на планшетах и мобильных
    $(window).resize(function() {
        if ($(this).width() <= 1260) {
            $('#form_map').remove()
        }
    });
    
    // Делает видимым блок с картой при клике на ссылку
    $('#address_link').click(function() {
        $('#form_map').css('display', 'block')
    });

    function init_map() {
        var myPlacemark,
            myMap = new ymaps.Map('form_map', {
            center: [59.95, 30.3], // Санкт-Петербург
            zoom: 12
        },{
            searchControlProvider: 'yandex#search'
        });
    
        // Добавляет обработчик клика на карте
        myMap.events.add('click', function (e) {
            var coords = e.get('coords');
            // Изменяет координаты метки, если она уже существует
            if (myPlacemark) {
                myPlacemark.geometry.setCoordinates(coords)
            }
            // Создает новую метку на карте
            else {
                myPlacemark = createPlacemark(coords)
                myMap.geoObjects.add(myPlacemark)
                // Добавляет обработчик окончания перетаскивания на метке.
                myPlacemark.events.add('dragend', function () {
                    getAddress(myPlacemark.geometry.getCoordinates())
                });
            }
            getAddress(coords)
        });
    
        // Создает метку
        function createPlacemark(coords) {
            return new ymaps.Placemark(coords, {
                iconCaption: 'поиск...'
            }, {
                preset: 'islands#violetDotIconWithCaption',
                draggable: true
            });
        }
    
        // Определяет адрес по координатам
        function getAddress(coords) {
            myPlacemark.properties.set('iconCaption', 'поиск...')
            ymaps.geocode(coords).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0)
    
                myPlacemark.properties
                    .set({
                        // Формируем строку с данными об объекте.
                        iconCaption: [
                            // Название населенного пункта или вышестоящее административно-территориальное образование.
                            firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
                            // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
                            firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                        ].filter(Boolean).join(', '),
                        // В качестве контента балуна задаем строку с адресом объекта.
                        balloonContent: firstGeoObject.getAddressLine()
                    });
    
                // Отрисосвывает найденный адрес в элементе с id=address_link
                // - изменяет текст внутри элемента
                // - добавляет атрибут title для отображения полного текста,
                // если его часть обрежется
                // - добавляет класс address_valid для прохождения валидации
                // при отправке формы
                $('#address_link')
                    .text(firstGeoObject.getAddressLine())
                    .attr('title', firstGeoObject.getAddressLine())
                    .addClass('address_valid')
                
                // Делает видимым плэйсхолдер над адресом
                $('.address_placeholder')
                    .text('Расположение объекта')
                    .css('display', 'block')

                // Делает видимой кнопку для удаления адреса
                $('.address_remove')
                    .css('display', 'block')
            });
        }    
    
        // Обработчик клика по кнопке удаления адреса
        $('#address_remove').click(function() {
    
            // Возвращает исходный вариант ссылки
            $('#address_link')       
                .text('Расположениe объекта')
                .removeClass('address_valid')
    
            // Скрывает плэйсхолдер
            $('.address_placeholder')
                .css('display', 'none')
            
            // Удаляет метку с карты и обнуляет переменную myPlacemark,
            // чтобы можно было создать новую метку
            myMap.geoObjects.remove(myPlacemark)
            myPlacemark = null
    
            // Самоуничтожается
            $(this).css('display', 'none')        
        });
    }

    const init = () => {
        // Выполняет переданную в параметре функцию, когда
        // API Яндекс карт готово к использованию 
        ymaps.ready(init_map);
    }
    
    return {
        init: init
    }    
}

export let map_loader = map();
