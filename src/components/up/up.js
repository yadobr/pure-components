export default function up( position )
{
    var button,       // up button
        flag = false, // Flag for uniq class name
        scrollTop;    // Store scrollTop value

    // Create up button
    button = document.createElement('div');

    // Add button class
    button.className = 'up';

    typeof position === 'undefined' && ( position = 'left' );

    button.classList.add( 'up_' + position )

    // Add scroll event to window
    window.addEventListener('scroll', windowSroll, false);

    // Add click event to button
    button.onclick = buttonClick;

    // Place button to Document
    document.body.appendChild( button );

    function windowSroll( e )
    {
        // If scrollTop > 70, then add active class to button
        if ( document.body.scrollTop  > 70 || document.documentElement.scrollTop > 70)
        {
            // If className does not have "active" class, then add it
            if ( !flag ) { button.classList.add('up_active') }

            // Add a "active" class and set flag to true
            flag = true;

            //scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        }

        // Else remove active class from button
        else
        {
            button.onmouseout = buttonMouseOut;

            // If button does not have a "back"  class, then remove "active class"
            if( !new RegExp('(\\s|^)up_back(\\s|$)').test( button.className ) )
            {
                // Remove active class from className
                button.classList.remove('up_active');

                // Set flag to false
                flag = false;
            }
        }
    }

    function buttonClick( e )
    {
        // If scrollTop != 0, then back to top
        if( document.body.scrollTop != 0 || document.documentElement.scrollTop != 0 )
        {
            // Remember scrollTop before up to use it in "else"
            scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

            document.body.scrollTop = 0; // For Chrome, Safari and Opera
            document.documentElement.scrollTop = 0; // For IE and Firefox

            // Add scroll back class
            button.classList.add('up_back')
        }

        // Else scroll back
        else
        {
            document.documentElement.scrollTop = scrollTop;
            document.body.scrollTop = scrollTop;

            // Remove "back" class
            button.classList.remove('up_back')
        }
    }

    function buttonMouseOut(  )
    {
        // Remove classes only if scrollTop == 0
        if ( Math.max(document.body.scrollTop, document.documentElement.scrollTop) === 0 )
        {
            // Remove active class from className
            button.classList.remove('up_active')

            // Remove "back" class
            button.classList.remove('up_back')

            // Set flag to false
            flag = false;
        }
    }
}
