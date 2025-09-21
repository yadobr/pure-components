export default function viewer()
{
    var elements,          // Elements with [data-viewer] attribute
        region;            // Touch-region to catch the touching on mobile devices

    // Get all elements with [data-viewer] attribute
    elements = document.querySelectorAll('[data-viewer-src]');

    for( var i = 0; i < elements.length; i++ )
    {
        // Create overlay for each element
        overlay( elements[ i ] );
    }

    function overlay( element )
    {
        var overlay, // Overlay for image
            image;   // Image in overlay

        // Bind element(toggle for open an overlay) click event
        element.onclick = open;

        function open( e )
        {
            // Get opened overlays
            var activeOverlays = document.querySelectorAll('.viewer_active');

            // Close opened overlays
            for( var i = 0; i < activeOverlays.length; i++ ) activeOverlays[ i ].click();

            // Create an overlay
            overlay = document.createElement('div');

            // Bind overlay click(close)
            overlay.onclick = close

            // Add class to overlay
            overlay.className = 'viewer';

            // Create an image
            image = document.createElement('img');

            // Add class to image
            image.className = 'viewer__image';

            // Add src
            image.setAttribute( 'src', this.getAttribute('data-viewer-src') );

            // Append image to overlay
            overlay.appendChild( image );

            // Append overlay to body
            document.body.appendChild( overlay );

            // Create a touch-region. 3rd parameter need keep in "false". It's a "prevenDefault()" for my events in ZingTouch region
            // Но если поставить 3-й параметр в false, то на мобилках будут срабатывать стандартные события скрола и резайза страницы. Ведь жесты-то одинаковые!
            // Поэтому определяем мобильное устройство и там пишем один конструктор, а на десктопах другой
            // Хотя в будущем может быть переписать функцию onmousemove, чтобы осталась одна функция pan? Но в pan нельзя определить onmousedown...Использовать window touchestart? Это сработает?
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) region = new ZingTouch.Region(overlay, false, true);
            else region = new ZingTouch.Region(overlay, false, false);

            // Add swipe to image
            swipe( image, overlay );

            // Add scaling to image
            scale( image, overlay );

            // Add pan to image
            pan( image, overlay );

            // Add padding-right to body( Для того, чтобы сайт не прыгал, когда появится overlay ).
            // Подробнее: К body применяется класс freeze, в котором есть свойство overflow: hidden. И если у body есть скроллбар, то он исчезнет и сайт "скакнет(сместится)" на размер этого скроллбара
            // Чтобы этого скачка не происходило подставим к body padding-right, равный размеру скроллбара браузера.
            // Делаем это только есть скроллбар уже есть.
            if( documentHeight() > windowHeight() )
            {
                //document.body.style.paddingRight = getScrollBarWidth() + 'px';
            }
        }

        function close( e )
        {
            // Only if clicked by overlay, not overlay child
            if( e.target === this )
            {
                // Remove padding-right from body
                document.body.style.paddingRight = 0;

                // Remove event EventListener

                // Remove himself
                document.body.removeChild( this );
            }
        }

        // Function to get the browser scrollbar width
        function getScrollBarWidth()
        {
            var inner = document.createElement('p');
            inner.style.width = "100%";
            inner.style.height = "200px";

            var outer = document.createElement('div');
            outer.style.position = "absolute";
            outer.style.top = "0px";
            outer.style.left = "0px";
            outer.style.visibility = "hidden";
            outer.style.width = "200px";
            outer.style.height = "150px";
            outer.style.overflow = "hidden";
            outer.appendChild (inner);

            document.body.appendChild (outer);
            var w1 = inner.offsetWidth;
            outer.style.overflow = 'scroll';
            var w2 = inner.offsetWidth;
            if (w1 == w2) w2 = outer.clientWidth;

            document.body.removeChild (outer);

            return (w1 - w2);
        }

        function windowHeight()
        {
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        }

        function documentHeight()
        {
            return Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            );
        }
    }

    // Закрываем картинку и overlay при свайпе
    function swipe( image, overlay )
    {
        region.bind( overlay, 'swipe', function( e )
        {
            const { velocity, currentDirection } = e.detail.data[0];

            if( velocity >= 1.25 )
            {
                if( currentDirection >= 60 && currentDirection <= 160 )
                {
                    overlay.click();
                }
            }
        } );
        // Срабатывает только, если это мобильное устройство
        // if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
        // {
        //     region.bind( image, 'swipe', function( e )
        //     {
        //         alert( e.currentDirection );
        //     } );
        // }
    }

    // Scaling image. Element - element for scaling. Toggle - element with mouse wheel event
    function scale( element, toggle )
    {
        var transform = new Transform( element ),                    // Instance of js class for works with transform css property
            min = 0.2,                                               // Min image scale
            max = 3,                                                 // Max image scale
            prevExpandDistance = 0,                                  // Previous expand distance between fingers
            prevPinchDistance  = 0,                                  // Previous pinch distance between fingers
            odds;                                                    // The difference between distance and e.detail.distance

        // Current scale of image
        element.scale = 1;

        // Create closure
        ( function (element, toggle)
        {
            // Определяем, какая из сторон изображения больше
            // И большей стороне присваиваем размер в 100%

            // var percent = '100%';
            var percent = '90%'; // 90% потому, что может быть момент, когда картинка будет равно по ширине или высоте вьюпорту. И лучше, если она будет четь меньше

            // Если ширина картинки больше, чем ее высота и ширина картинки больше, чем ширина viewport'a
            if ( element.offsetWidth > element.offsetHeight && element.offsetWidth > toggle.offsetWidth )
            {
                element.style.width = percent;
            }

            // Если ширина картинки больше, чем ее высота и ширина картинки меньше или равна, ширине viewport'a
            else if ( element.offsetWidth > element.offsetHeight && element.offsetWidth <= toggle.offsetWidth )
            {
                // Ничего не делаем =)
            }

            // Если высота картинки больше, чем ее ширина и высота картинки больше, чем высота vieport'а
            else if ( element.offsetWidth < element.offsetHeight  && element.offsetHeight > toggle.offsetHeight )
            {
                element.style.height = percent;
            }

            // Если высота картинки больше, чем ее ширина и высота картинки меньше или равна, высоте vieport'а
            else if ( element.offsetWidth < element.offsetHeight  && element.offsetHeight <= toggle.offsetHeight )
            {
                // Ничего не делаем
            }

            // Если ширина картинки и ее высота равны и они больше, чем высота viewport'a
            else if ( element.offsetWidth == element.offsetHeight && element.offsetWidth > toggle.offsetWidth)
            {
                // Определяем, портретная ориентация или альбомная
                // Если портретная, то ставим ширину 100%
                // Если альбомная, то высоту 100%
                var width  = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
                    height = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

                // Портретная
                if( width > height ) element.style.width = percent;

                // Альбомная
                else element.style.height = percent;
            }

            // Если ширина картинки и ее высота равны и они меньше или равны высоте viewport'a
            else if ( element.offsetWidth == element.offsetHeight && element.offsetWidth <= toggle.offsetWidth)
            {
                element.style.width = percent;
            }

            // Attach mouse wheel event to toggle
            toggle.addEventListener( 'wheel', function( e )
            {
                // Increase scale or decrease. If e.deltaY < 0, then increase, else decrease
                element.scale = e.deltaY < 0 ? ( element.scale += 0.1 ) : ( element.scale -= 0.1 );

                // Check scale on out of bounds
                element.scale = ( element.scale > max ? max : ( element.scale < min ? min : element.scale ) );

                // Scaling the image
                transform.scale( element.scale );
                //element.style.transform = 'scale(' + element.scale + ')';

                e.preventDefault();
            } );


            // Create a mobile events
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
            {
                var speed = 0.007; // Speed coefficient of expand and pinch
                // var speed = 0.002; // Speed coefficient of expand and pinch

                // Binding tap event to call toggle click.
                // It's necessary, because ZingTouch preventing attached to ovelay events
                region.bind( toggle, 'tap', function( e )
                {
                    if ( e.target == toggle && e.detail.events[0].originalEvent.type != 'mouseup')
                    {
                        toggle.click();
                    }
                } );

                // Bind tap to stop propagation toggle tap event
                // Else tap on image will close the overlay
                region.bind( element, 'tap', function( e )
                {
                    // const { interval } = e.detail;
                    //
                    // // Doble tap
                    // if (interval <= 120) {
                    //     element.style.width = 'auto';
                    // }
                } );

                // Binding expand event
                region.bind(toggle, 'distance', function( e )
                {
                    // Setting up pinch distance to default everytime of transiton from Picnh to Expand
                    prevPinchDistance = 0;

                    // If the gesture occurs in the first time, then setting up expand distance equals to e.detail.distance
                    prevExpandDistance == 0 && ( prevExpandDistance = e.detail.distance );

                    // Calculating difference between prev distance and current distance to get the acceleration of finger movement
                    odds = Math.max( prevExpandDistance, e.detail.distance ) - Math.min( prevExpandDistance, e.detail.distance )

                    if (e.detail.change > 0)
                        element.scale += odds * speed;
                    else
                        element.scale -= odds * speed;

                    // Check the scale of the element on out of bounds of allowed values(Не знаю правильно написал или нет =) )
                    element.scale = ( element.scale > max ? max : ( element.scale < min ? min : element.scale ) );

                    // Set the scale to element
                    requestAnimationFrame(function()
                    {
                        transform.scale( element.scale );
                        //element.setAttribute( 'style', '-webkit-transform: scale(' + element.scale + '); transform: scale(' + element.scale + ');');
                    });

                    // Memorization the distance
                    prevExpandDistance = e.detail.distance;
                } );


                // Set expand distance and pinch distance to default on expand-end and pinch-end
                document.body.addEventListener('touchend', function( e )
                {
                    prevExpandDistance = 0;
                    prevPinchDistance  = 0;
                }, false);
            }

        } )( element, toggle );
    }

    // Функция панамирования(срабатывает и на десктопах и на мобилках.
    // Если ее закоментить, то на десктопах(благодаря element.onmousedown) все продолжает работать, а на мобилках нет.
    // С другой стороны, если закоментить onmousedown, то pan будет работать и на десктопах, хотя и не так правильно. Почему так реализовано, я не помню, наверно зачем-то нужно)
    function pan( element, toggle )
    {
        var transform  = new Transform( element ),               // Instance of js class for works with transform css property
            pan        = new ZingTouch.Pan( { threshold : 5 } ), // Custom Pan gesture
            isPanStart = false,                                  // Pan start flag
            startX     = 0,                                      // Start touch X coord
            startY     = 0,                                      // Start touch Y coord
            translateX = 0,                                      // Next image translateX
            translateY = 0,                                      // Next image translateY
            prevTranslateX = 0,                                  // Current image translateX
            prevTranslateY = 0;                                  // Current image translateY

        // Это событие вообще должно срабатывать на декстопах?
        region.bind(element, pan, function( e )
        {
            var deceleration; // Decelerate moving on big scale to make move more smooth

            // Pan start
            // Memorization start x and y coord of touch on first moving( analog of touchstart )
            if( !isPanStart )
            {
                startX = e.detail.events[0].pageX;
                startY = e.detail.events[0].pageY;
            }

            // Pan move

            // Calculating current x and y offsets
            translateX = prevTranslateX + ( e.detail.events[0].pageX - startX );
            translateY = prevTranslateY + ( e.detail.events[0].pageY - startY );

            // Calculating the deceleration. Needed for big scale to make move more smooth
            // Math.max нужен для того, чтобы не было рывка: (приближаем, сдвигаем, приближаем, сдвигаем(рывок))
            // Рывок, видимо, появляеся потому, при значениях ниже 0.6 глазу уже заметно.
            // Рывок - это сдиг чуть левее, при попытке двигать изображение, после второго масштабирования
            // Интересно, что без замедления(deceleration) равка нет
            deceleration = Math.max( 1 / element.scale, 0.6 );

            transform.translate(
            {
                x: translateX * deceleration,
                y: translateY * deceleration
            });

            isPanStart = true;
        });

        // Pan end
        window.addEventListener('touchend', function( e )
        {
            var rect = element.getBoundingClientRect();

            if( isPanStart )
            {
                prevTranslateX = translateX;
                prevTranslateY = translateY;

                window.touchend = null;

                // Если размер картинки меньше размера viewport'a, то сбрасываем смещение(translate) на дефолтные значение, а если нет, то не сбрасываем
                if ( rect.width < toggle.offsetWidth && rect.height < toggle.offsetHeight )
                {
                    //element.style.transform = 'translate(0px, 0px)';
                    transform.translate( { x: 0, y: 0 } );

                    // Reset prevX and prevY
                    prevTranslateX = 0;
                    prevTranslateY = 0;
                }

                isPanStart = false;
            }

        }, false);

        // В Firefox Quantum был глюк(в вебките и старом ФФ работало нормально): ZingTouch блокировал распространение onmousedown, onmousemove и т.д.
        // Т.е. событий, созданных мной не через функцию bind из Zingtouch. Т.е. выполнялся preventDefault() для всех событий региона, кроме Зиндточевских.
        // Это решалось установкой 3-го параметра в false(отменяет preventDefault для моих событий в регионе) в конструкторе создания региона. Это какбы логично, но в Хроме и так работало О_о
        // Это помогало новому ФФ: он начал выполнять мои события, но выполнял их не так! Оказалось, что нехватает return false в конце onmousedown, onmousemove и т.д. Т.е. без return false не отменялось стандартное событие!
        // Это какбы логично, но в Хроме и так работало О_о
        // Итого: в Хроме, Старом ФФ и Новом ФФ события работают не так:
        // 1) В Хроме и Старом ФФ события и так распространяются, не смотря на 3-й параметр в конструкторе создания региона(prevenDefault), а в Новом ФФ нет!
        // 2) Стандартное поведение события в Хроме и Старом ФФ отменилось, а в Новом ФФ нет.

        // Функция для работы на десктопах
        element.onmousedown = function( e )
        {
            startX = e.pageX;
            startY = e.pageY;

            document.onmousemove = function( e )
            {
                translateX = ( e.pageX - startX ) + prevTranslateX;
                translateY = ( e.pageY - startY ) + prevTranslateY;

                transform.translate(
                {
                    x: translateX,
                    y: translateY
                });

                return false;
            }

            element.onmouseup = function( e )
            {
                var rect = element.getBoundingClientRect();

                prevTranslateX = translateX;
                prevTranslateY = translateY;

                document.onmousemove = null;
                element.onmouseup = null;

                // Если размер картинки меньше размера viewport'a, то сбрасываем смещение(translate) на дефолтные значение, а если нет, то не сбрасываем
                if ( rect.width < toggle.offsetWidth && rect.height < toggle.offsetHeight )
                {
                    //element.style.transform = 'translate(0px, 0px)';
                    transform.translate( { x: 0, y: 0 } );

                    // Reset prevX and prevY
                    prevTranslateX = 0;
                    prevTranslateY = 0;
                }
            }

            window.onmouseup = function()
            {
                var rect = element.getBoundingClientRect();

                prevTranslateX = translateX;
                prevTranslateY = translateY;

                document.onmousemove = null;
                element.onmouseup    = null;
                window.onmouseup     = null;

                // Если размер картинки меньше размера viewport'a, то сбрасываем смещение(translate) на дефолтные значение, а если нет, то не сбрасываем
                if ( rect.width < toggle.offsetWidth && rect.height < toggle.offsetHeight )
                {
                    //element.style.transform = 'translate(0px, 0px)';
                    transform.translate( { x: 0, y: 0 } );

                    // Reset prevX and prevY
                    prevTranslateX = 0;
                    prevTranslateY = 0;
                }
            }

            return false;
        }

    }
}
