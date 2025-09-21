export default function overlay()
{
    var toggles = [],       // Array of toggles
        overlay,            // Overlay( uses in "for" )
        overlays = [],      // Array of overlays
        attribute,          // Attribute [data-overlay] of toggle, contains ID of overlay ( uses in "for" )
        customX,            // Add custom X coord to overlay. Get it from attribute [data-overlay-custom-x] of overlay
        customY,            // Add custom Y coord to overlay. Get it from attribute [data-overlay-custom-y] of overlay
        closeButton,        // Close overlay button. Get button selector from [data-overlay-close-button] attribute
        temporary,          // Temporary css class from data-overlay-temporary attribute
        temporary_duration, // Temporary css class duration in ms
        activeOvelays;      // Active overlays array. Close all overlays before opening new

    // Get overlays
    overlays = document.querySelectorAll( '.overlay' );

    // Need to convert nodeList to array. And we can modify overlays array with index [i]
    // If we do not do this, error: "Failed to set an indexed property [0] on 'NodeList': Indexed property setter is not supported" appears
    overlays = Array.from(overlays);

    for ( var i = 0; i < overlays.length; ++i )
    {
        overlay = overlays[ i ];

        // Reset toggles array
        toggles = [];

        // Get toggles
        toggles = document.querySelectorAll( overlay.getAttribute( 'data-overlay-toggle' ) );

        // If overlay != null
        if( overlay !== null && toggles.length > 0 )
        {
            for( var n = 0; n < toggles.length; n++ )
            {
                // Bind toggle click event
                toggles[ n ].onclick = open;

                // Add new property to toggle, for using in "open" function
                toggles[ n ].index = i;
            }

            // Add class to overlay
            // ( !new RegExp('(\\s|^)overlay(\\s|$)').test( overlay.className ) ) && ( overlay.className += ' overlay' );
            overlay.classList.add( 'overlay' );

            // Bind overlay click event
            overlay.onclick = close;

            // Get element by [data-overlay-close] attribute. Searching in overlay.
            closeButton = overlay.querySelectorAll( overlay.getAttribute( 'data-overlay-close' ) );

            for( var g = 0; g < closeButton.length; g++ )
            {
                // Bind close button(if exists) click event
                // Использую замыкание, чтобы если есть несколько экземляров оверлея, то кнопка "закрыть" нажималась у всех оверлеев.
                // Иначе будет только у крайнего оверлея работать
                (function( closeButton, overlay )
                {
                    ( closeButton != null ) && ( closeButton.onclick = function( e ) { overlay.click(); e.stopPropagation() } );
                })( closeButton[ g ], overlay );
            }

            // Add to overlays
            overlays[ i ] = overlay;

        }
    }

    function open( e )
    {
        // Get opened overlays
        var activeOverlays = document.querySelectorAll('.overlay_active');

        // Close opened overlays
        for( var i = 0; i < activeOverlays.length; i++ ) activeOverlays[ i ].click();

        // Add class to body
        document.body.classList.add ( 'overlay__noscroll' );

        // Add temporary class to overlay(if exists)
        temporary          = overlays[ this.index ].getAttribute( 'data-overlay-temporary' );
        temporary_duration = overlays[ this.index ].getAttribute( 'data-overlay-temporary-duration' );

        overlays[ this.index ].classList.add( temporary );
        setTimeout( () => { overlays[ this.index ].classList.remove( temporary ) }, temporary_duration );

        // And stop body scrolling(on mobile device). Prevent background scrolling when overlay scroll.
        // На мобильных устройствах есть такой эффект, который заставляет подскакивать body, если overlay проскролен до конца
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
            stopBodyScrolling( overlays[ this.index ] );

        // Add padding-right to body( Для того, чтобы сайт не прыгал, когда появится overlay ).
        // Подробнее: К body применяется класс overflow__noscroll, в котором есть свойство overflow: hidden. И если у body есть скроллбар, то он исчезнет и сайт "скакнет(сместится)" на размер этого скроллбара
        // Чтобы этого скачка не происходило подставим к body padding-right, равный размеру скроллбара браузера.
        // Делаем это только есть скроллбар уже есть.
        if( documentHeight() > windowHeight() )
        {
            document.body.style.paddingRight = getScrollBarWidth() + 'px';
        }

        // Get custom X coordanate from [data-overlay-custom-x] attr.
        customX = overlays[ this.index ].getAttribute( 'data-overlay-custom-x' );

        // Add left offset to overlay
        ( customX != null ) && ( overlays[ this.index ].style.left = customX + 'px' );

        // Get custom Y coordanate from [data-overlay-custom-y] attr.
        customY = overlays[ this.index ].getAttribute( 'data-overlay-custom-y' );

        // Add top offset to overlay
        ( customY != null ) && ( overlays[ this.index ].style.top = customY + 'px' );

        // Add class to overlay
        overlays[ this.index ].classList.add ( 'overlay_active' );
    }

    function close( e )
    {
        // Only if clicked by overlay, not overlay child
        if( e.target === this )
        {
            // Remove class from body
            document.body.classList.remove('overlay__noscroll');
            document.querySelector( 'html' ).classList.remove('overlay__noscroll');

            // Remove padding-right from body
            document.body.style.paddingRight = 0;

            // Remove class from overlay
            this.classList.remove('overlay_active');
        }
    }

    // Stop body scrolling on mobile devices when overlay appears(ios)
    // Останавливаем подпрыгивание body(overscroll/bounce), когда долистали overlay до конца
    // Идея такая: ловим событие скрола на оверлее и смотрим, когда он становится проскроленным вниз или вверх и в этот момент, отключаем событие скролла по-умолчанию, чтобы не сработал overscroll у body
    function stopBodyScrolling ( scrollable_element )
    {
        var touchstart_client_y = null,  // ClientY before start touchmove. Координата Y пальца на экране в момент touchestart
            touchmove_client_y  = null,  // Координата Y пальца на экране в момент touchemove
            movement_direction  = null;  // Направление скролла. Вниз или вверх

        scrollable_element.addEventListener('touchstart', touchstart, false);
        scrollable_element.addEventListener('touchmove',  touchmove, false);
        scrollable_element.addEventListener('gesturestart', gesturestart, false);

        function touchstart( e )
        {
            // Remember initial value of clientY before touch move
            // targetTouches - список все точек прикосновения на текущем эелементе. Запоминаем clientY только когда один палец на элементе.
            // Интересный факт, если 2-мя пальцами тапнуть по оверлею, то targetTouches.length покажет 2(как и должно быть), а если на чилде оверлея, то всегда показывает 1
            // Запоминаем только если количество прикосновений === 1 и если высота контента оверлея больше, чем высота документа(ведь если меньше, то и скролла нет)
            (e.targetTouches.length === 1 ) && ( touchstart_client_y = e.targetTouches[0].clientY );
            // (e.targetTouches.length === 1 && scrollable_element.firstElementChild.clientHeight > documentHeight() ) && ( touchstart_client_y = e.targetTouches[0].clientY );
        }

        function touchmove( e )
        {
            // Елси движение совершается одним пальцем. Т.е. это не зум и т.д., а просто скролл. И если высота контента оверлея больше, чем высота документа(ведь если меньше, то и скролла нет)
            // if( e.targetTouches.length === 1 && scrollable_element.firstElementChild.clientHeight > documentHeight() )
            if( e.targetTouches.length === 1 )
            {
                touchmove_client_y = e.targetTouches[0].clientY;
                movement_direction = touchmove_client_y - touchstart_client_y < 0 ? 'down' : 'up';

                // Если элементу некуда скролится вверх, то предотвращаем скролл body, отменой стандарного поведения: e.preventDefault()
                // Если количество пикселей, на которое элемент прокручен равно 0 и направление скролла вверх, то значит, элементу некуда скролится и пойдет скролл body. Отменяем его
                if( scrollable_element.scrollTop === 0 && movement_direction === 'up' )
                {
                    // Предотвращаем стандартное поведение touchmove: страница перестанет скролиться
                    e.preventDefault();
                }

                // Определяем, проскролили ли мы элемент до конца
                // scrollHeight - высота элемента, плюс проскроленное расстояние
                // scrollTop - проскроленное расстояние
                // clientHeight - высота элемента с паддингами
                // Например: scrollHeight: 1000 пкс. scrollTop: 150 пкс. clientHeight: 850 пкс
                var is_scrolled = scrollable_element.scrollHeight - scrollable_element.scrollTop === scrollable_element.clientHeight;

                // Если мы проскролили элемент до конца, то предотвращаем скролл body, отменой стандарного поведения: e.preventDefault()
                if( is_scrolled && movement_direction === 'down' )
                {
                    // Предотвращаем стандартное поведение touchmove: страница перестанет скролиться
                    e.preventDefault();
                }
            }
        }

        // Запрещаем зумирование жестом
        function gesturestart( e )
        {
            return e.preventDefault();
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
