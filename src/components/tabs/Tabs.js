import Elements from "../_elements/elements.js";

export default class Tabs extends Elements
{
    constructor( element )
    {
        super( element )

        if( this.element != null )
        {
            let tab_list     = this.elements.tab,
                content_list = this.elements.content;

            for( let i = 0; i < tab_list.length; i++ )
            {
                tab_list[i].onclick = () =>
                {
                    // Удаляем класс avtive с активных tabs__tab
                    tab_list.map( item =>
                    {
                        // C активных tabs__tab
                        item.classList.remove('tabs__tab_active');

                        // C text внутри
                        let text = item.querySelector('.text');
                        text.classList.remove('text_primary');
                        text.classList.add('text_secondary');
                    } );

                    // Удаляем класс active с активных tabs__content
                    content_list.map( item => item.classList.remove('tabs__content_active') );

                    // Добавляем класс avtive на кликнутый tabs__tab
                    tab_list[i].classList.add('tabs__tab_active');

                    // На text внутри
                    let text = tab_list[i].querySelector('.text');
                    text.classList.remove('text_secondary');
                    text.classList.add('text_primary');

                    // Добавляем класс avtive на кликнутый tabs__content
                    content_list[i].classList.add('tabs__content_active');
                }
            }

            // Активируем 1-ю вкладку(по-умолчанию)
            tab_list[0].click();
        }
    }
}
