export default function dropdown()
{
    var dropdowns = [],             // Array of dropdowns
        old_doc_width,              // Document width before dropdown_content appears
        old_doc_height,             // Document width after dropdown_content appears
        customX,                    // Add custom X coord to dropdown_content. Get it from attribute [data-dropdown_content-custom-x] of dropdown
        customY,                    // Add custom Y coord to dropdown_content. Get it from attribute [data-dropdown_content-custom-y] of dropdown
        offsetX,                    // Add offset to X coord of dropdown_content. Get it from attribute [data-dropdown_content-offset-x] of dropdown
        offsetY,                    // Add offset to Y coord of dropdown_content. Get it from attribute [data-dropdown_content-offset-y] of dropdown
        onopen,                     // Function call when dropdown_content is opening
        onclose;                    // Function call when dropdown_content is closing

    // Get dropdowns
    dropdowns = document.querySelectorAll('.dropdown');

    // Add click event to dropdown__toggle
    for ( var i = 0; i < dropdowns.length; i++ )
    {
        var dropdown,
            dropdown_toggle,
            dropdown_content;

        dropdown_toggle  = dropdowns[i].querySelector('.dropdown__toggle');
        dropdown_content = dropdowns[i].querySelector('.dropdown__content');

        if( dropdown_toggle != null && dropdown_content != null )
            dropdown_toggle.onclick = open;
    }

    function open( e )
    {
        var dropdown         = this.parentNode,                                      // Get dropdown, parent node of toggle
            dropdown_toggle  = this,                                                 // Toggle of dropdown
            dropdown_content = dropdown.querySelector('.dropdown__content'); // Content of dropdown

        // Checking opened dropdown or not
        // If not opened
        if( !dropdown.classList.contains('dropdown_active') )
        {
            // Get onopen function
            onopen = dropdown.getAttribute( 'data-dropdown-onopen' );

            // Call it, if onopen is a function
            if( typeof window[onopen] === 'function' ) window[onopen]();

            // Get document width before dropdown_content appears
            old_doc_width  = documentWidth();
            old_doc_height = documentHeight();

            // Reset margins
            dropdown_content.style.marginLeft = 0 + 'px';
            dropdown_content.style.marginTop  = 0 + 'px';

            // Add class to dropdown
            dropdown.classList.add('dropdown_active');

            // Calculate margins
            calculate( dropdown, dropdown_toggle, dropdown_content );

            // Remember dropdown_toggle( to use in "close" function)
            close.prototype.dropdown_toggle = dropdown_toggle;

            // Remove old event listener(if exists)
            window.removeEventListener('click', close);

            // Attach global click event
            window.addEventListener('click', close, true);
        }

        // If dropdown is opened
        else
        {
            // Remove class from dropdown
            dropdown.classList.remove('dropdown_active');

            // Remove close global listener
            window.removeEventListener('click', close, true);

            // Get onclose function
            onclose = dropdown.getAttribute( 'data-dropdown-onclose' );

            // Call it, if onclose is a function
            if( typeof window[onclose] === 'function' ) window[onclose]();
        }
    }

    // Calculate coordinates for dropdown_content
    function calculate( dropdown, dropdown_toggle, dropdown_content )
    {
        var toggle_rect        = dropdown_toggle.getBoundingClientRect(),                       // Get left, top, etc properties of toggle
            content_rect       = dropdown_content.getBoundingClientRect(),                      // Get left, top, etc properties of dropdown content
            content_right      = Math.round( content_rect.right + window.scrollX ),           // getBoundingClientRect получает координаты относительно viewport. Чтобы получить координаты от начала документа, нужно прибавить проскролленое.
            content_bottom     = Math.round( content_rect.bottom + window.scrollY ),          // getBoundingClientRect получает координаты относительно viewport. Чтобы получить координаты от начала документа, нужно прибавить проскролленое.
            right_scrollbar_size  = window.innerWidth - document.documentElement.clientWidth,   // Vertical scrollbar width
            bottom_scrollbar_size = window.innerHeight - document.documentElement.clientHeight; // horizontal scrollbar height

            // Get offset X from [data-dropdown_content-offset-x] attr.
            offsetX = Number( dropdown.getAttribute('data-dropdown-offset-x') || 0 );

            // Get offset Y from [data-dropdown_content-offset-y] attr.
            offsetY = Number( dropdown.getAttribute('data-dropdown-offset-y') || 0 );


            // При помощи изменения ширины документа определять не вариант. Т.к. она меняется непонятным образом: dropdown может выйти за пределы документа, сделав его больше. Но размеры документа будут показываться меньшче, чем были т.к. появятся скролы. И нельзя просто взять и приплюсовать к размеру документа размер скролла. Т.к. высота документа меняется не на высоту скрола.
            // Через сравнение content_rect.right и ширины документа тоже нереал. Т.к. content_rect.right считается от вьюпорта, а не от начала документа. И при наличии проскроленой страницы, координаты дропдауна всегда будут меньше, чем ширина или высота документа. Можно попробовать приплюсовать scrollWidth. Но тогда стоит вопрос. scrollWidth чего брать? Document? ParentNode?. Я к тому, что дропдаун может находится в элементе со скролом и размер скрола у документа может не менятся
            // Нужно что-то, что позволит мне узнать, упириется ли dropdown в границы элементов?

            // Attribute and offsets by default. If none of conditions has been used
            dropdown.setAttribute('data-dropdown-position', 'left-top');

            dropdown_content.style.marginLeft = offsetX + 'px';
            dropdown_content.style.marginTop  = offsetY + 'px';

            // Left top
            // Если абсолютные координаты правой и нижней стороны dropdown_content меньше, чем ширина и высота до появления dropdown, значит dropdown не выходит за пределы экрана.
            // Приплюсовываем отступы. А то при подсчете без них все будет ок, а с ними dropdown будет вылазить
            // Приплюсовываем размеры скроллбара везде, т.к. он отнимает их от документа и может получится, что старая ширина и высота будет меньше, чем после появления dropdown__content
            if( content_right + offsetX + right_scrollbar_size < old_doc_width && content_bottom +  offsetY + bottom_scrollbar_size < old_doc_height )
            {
                //console.log('Left top');
                dropdown.setAttribute('data-dropdown-position', 'left-top');

                // On the top left calculate only offsets
                dropdown_content.style.marginLeft = offsetX + 'px';
                dropdown_content.style.marginTop  = offsetY + 'px';
            }

            // Right top
            // Если content_right больше, чем old_doc_width, а content_bottom меньше, чем old_doc_height, значит dropdown выходит за правую границу экрана
            else if( content_right +  offsetX + right_scrollbar_size > old_doc_width && content_bottom + offsetY +  bottom_scrollbar_size < old_doc_height )
            {
                //console.log('Right top')
                dropdown.setAttribute('data-dropdown-position', 'right-top');

                dropdown_content.style.marginLeft = Number( Math.max( toggle_rect.width, content_rect.width ) - Math.min( toggle_rect.width, content_rect.width ) + offsetX ) * -1 + 'px';
                dropdown_content.style.marginTop  = offsetY + 'px';
            }

            // Left Bottom
            // Если content_right меньше, чем old_doc_width, а content_bottom больше, чем old_doc_height, значит dropdown выходит за нижнюю границу экрана
            else if( content_right +  offsetX + right_scrollbar_size < old_doc_width && content_bottom + offsetY +  bottom_scrollbar_size > old_doc_height )
            {
                //console.log('Left Bottom')
                dropdown.setAttribute('data-dropdown-position', 'left-bottom');

                dropdown_content.style.marginLeft = offsetX + 'px';
                dropdown_content.style.marginTop  = Number( toggle_rect.height + content_rect.height + offsetY ) * -1 + 'px';
            }

            // Right Bottom
            // Если content_right больше, чем old_doc_width, и content_bottom больше, чем old_doc_height, значит dropdown выходит за правую и нижнюю границу экрана
            else if( content_right +  offsetX + right_scrollbar_size > old_doc_width && content_bottom + offsetY +  bottom_scrollbar_size > old_doc_height)
            {
                //console.log('right bottom')
                dropdown.setAttribute('data-dropdown-position', 'right-bottom');

                dropdown_content.style.marginLeft = Number( Math.max( toggle_rect.width, content_rect.width ) - Math.min( toggle_rect.width, content_rect.width ) + offsetX ) * -1 + 'px';
                dropdown_content.style.marginTop  = Number( toggle_rect.height + content_rect.height + offsetY ) * -1 + 'px';
            }
    }

    function close( e )
    {
        var dropdown = document.querySelector('.dropdown_active');

        if(
            dropdown != null                             &&
            e.target !== close.prototype.dropdown_toggle && // Если клик не по туглу
            e.target != dropdown                         && // Если клик не по дропдауну
            !dropdown.contains( e.target )                  // Если клик не по чилду дропдауна
        )
        {
            // Remove class from dropdown
            dropdown.classList.remove('dropdown_active');

            // Remove close global listener
            window.removeEventListener('click', close, true);

            // Get onclose function
            onclose = dropdown.getAttribute( 'data-dropdown-onclose' );

            // Call it, if onclose is a function
            if( typeof window[onclose] === 'function' ) window[onclose]();
        }
    }

    function documentWidth()
    {
        return Math.max(
            document.body.scrollWidth, document.documentElement.scrollWidth,
            document.body.offsetWidth, document.documentElement.offsetWidth,
            document.body.clientWidth, document.documentElement.clientWidth
        );
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
