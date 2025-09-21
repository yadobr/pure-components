export default class Elements
{
    constructor( element )
    {
        // Если element это не Node, а всего лишь string, то значит это селектор и надо выбрать элемент
        typeof element === 'string' && ( element = document.querySelector( element ) )

        // Main element of block
        this.element = element;

        if( element != null )
        {
            this.block_name = this.constructor.name.toLowerCase();

            // Array of child elements
            this.elements = [];

            Elements.slots = Elements.slots || {};

            // Автоинициализация элементов блока
            element || console.warn( 'Elements: element of class "%s" not found. Check the constructor argument of instance.', this.constructor.name);

            let child = element.querySelectorAll('[class*="' + this.block_name + '__"]');

            for( var i = 0; i < child.length; i++ )
            {
                // В классах элемента выбираем только тот класс, который относится к блоку. Например, form__row. А затем, оставляем только row.
                let name = child[i].classList.toString().match(/[a-z0-9-]*__[a-z0-9-]*/)[0].split('__')[1];

                // Узнаем, сколько есть дочерних элементов этого типа
                let length = element.querySelectorAll( this.block_name + '__' + name ).length;

                // Если больше одного, значит инициализируем как массив
                if ( length > 1 )
                {
                    this['__' + name] === 'undefined' && ( this['__' + name] = [] );
                    this['__' + name].push( child[ i ] );
                }
                else
                    this['__' + name] = child[i];

                // Дополнительно заносим все элементы в массив elements, в котором elements[name] всегда массив, назависимо от того, один там элемент или несколько
                typeof this.elements[name] === 'undefined' && ( this.elements[name] = [] );
                this.elements[name].push( child[ i ] );
            }
        }
    }

    // Создает экземпляр класса для всех блоков этого типа на странице
    static awake()
    {
        let name = this.name, // Name of class
            elements;

        elements = document.querySelectorAll( '.' + name.toLowerCase() );

        for( var i = 0; i < elements.length; i++ )
        {
            let element = elements[ i ];

            eval('new ' + name + '( element )')
        }
    }

    // Определяем какая страница открыта. meta[name="page"] задается на бэкэнде
    static get page()
    {
        return document.querySelector('meta[name="page"]').getAttribute('content');
    }
    
    static get assets_path()
    {
        return document.querySelector('meta[name="assets_path"]').getAttribute('content');
    }

    // url - url
    // raw_data - is a selector of parent element of inputs or json data object
    request( url, raw_data, options = {} )
    {
        var request = new XMLHttpRequest(),
            query = '',
            inputs,
            value,
            name,
            data = {};

        typeof options.file === 'undefined' && ( options.file = false );
        typeof options.json === 'undefined' && ( options.json = false );
        typeof options.alert_success === 'undefined' && ( options.alert_success = true );
        typeof options.alert_error === 'undefined' && ( options.alert_error = true );

        // If raw_data is a string, then it is a selector of parent element of inputs
        if( typeof raw_data === 'string' )
        {
            inputs = document.querySelectorAll( raw_data + ' [name]' );

            for( var i = 0; i < inputs.length; i++ )
            {
                value = inputs[ i ].value;
                name  = inputs[ i ].getAttribute('name');

                data[ name ] = value;
            }
        }

        // Else if raw_data is an object
        else
            data = raw_data;

        request.open('POST', url, true);

        // Если передаем json объект, то заголовок другой
        var header = options.json == false ? 'application/x-www-form-urlencoded; charset=UTF-8' : 'application/json; charset=UTF-8';

        // Если это не файл, то указываем contentType
        !options.file && request.setRequestHeader('Content-Type', header);

        request.onload = () =>
        {
            var response = request.responseText;

            try { response = JSON.parse( response ) }
            catch( error ){ console.log( error, response ) }

            // Success!
            if (request.status >= 200 && request.status < 400)
            {
                done( response );
                always( response );
            }

            // We reached our target server, but it returned an error
            else
            {
                fail( response );
                always( response );
            }
        };

        request.onerror = () =>
        {
            let response = request.responseText;

            try { response = JSON.parse( response ) }
            catch( error ){ console.log( response ) }

            options.alert_error && this.broadcast({ event: 'alert', payload: response });

            fail( response );
            always( response );
        };

        // Конвертируем объект в uri строку
        if( options.json == false )
            for ( let key in data )
                query += encodeURIComponent( key ) + '=' + encodeURIComponent( data[ key ] ) + '&';
        else
            query = JSON.stringify( data );

        // Отправляем данные. Если не файл, то отправляем query, если файл, то просто data
        request.send( !options.file ? query : data );

        const done = ( response ) =>
        {
            // try { response = JSON.parse( response ) }
            // catch( error ){ console.log( error, response ) }

            if (response.status == 0)
                options.alert_success && this.broadcast({ event: 'alert', payload: response });
            else if(response.status == 2)
                options.alert_error && this.broadcast({ event: 'alert', payload: response });

            typeof options.done === 'function' && options.done( response );
        }

        function fail( response )
        {
            // try { response = JSON.parse( response ) }
            // catch( error ){ console.log( response ) }

            typeof options.fail === 'function' && options.fail( response );
        }

        function always( response )
        {
            // try { response = JSON.parse( response ) }
            // catch( error ){ console.log( error, response ) }

            typeof options.always === 'function' && options.always( response );
        }
    }

    // Регистрируем слоты и блоки, от которых они ждут сигнала
    receive( params = { event: '', from: '', do: null } )
    {
        Elements.slots = Elements.slots || {};

        Elements.slots[ this.block_name ] = Elements.slots[ this.block_name ] || {};

        if(params.from)
            Elements.slots[ this.block_name ][ params.from || '*' ] = { event: params.event, do: params.do };

        // Если поле "откого" пустое, то вместо block_name ставим *, что означает "общее имя",
        // А вместо params.from имя события
        // И пушим туда наши callback
        else {
            Elements.slots['*'] = Elements.slots['*'] || [];

            Elements.slots['*'][params.event] = Elements.slots['*'][params.event] || [];
            Elements.slots['*'][params.event].push(params.do);
        }
    }

    // Транслируем сигнал
    broadcast( params = { event: '', to: '', payload: null } )
    {
        // Получаем все слоты блока-получателя
        let slots = Elements.slots[ params.to ];

        // Ищем слот с именем блока-отправителя у блока-получателя или слот "для всех": *
        let slot = slots && slots[this.block_name];

        // Если слот найден. То проверяем, совпадают ли события(on). И если совпадают, то вызываем do()
        if( slot && params.event == slot.event )
            typeof slot.do === 'function' && slot.do( params.payload );

        // Если слот не найден...
        else {

            // то ищем блок с общим именем *
            slots = Elements.slots['*'];

            // Затем ищем событие
            slots && (slot = slots[params.event]);

            slot.map(callback => typeof callback === 'function' && callback(params.payload))
        }

        slots || console.warn('Elements: slots of block "' + params.to + '" not found. Register slots of block using receive function or check block name in send function.');
        slot || console.warn('Elements: block "' + params.to + '" not contain slot for block "' + this.block_name + '". Check "from" field in receive functions.');
    }
}
