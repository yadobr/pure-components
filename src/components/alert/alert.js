import Elements from "../_elements/elements.js";

export default class Alert extends Elements
{
    constructor( element )
    {
        super( element );

        this.receive({ event: 'alert', do: this.notification });
    }

    notification ({ status, message } ) {
        let list = document.querySelector('.alert-list');

        if(list === null) {
            list = document.createElement('div')
            list.classList.add('alert-list');
            document.body.appendChild(list);
        }

        let element = document.createElement('div'),
            text = document.createElement('div'),
            className = '';

        switch (status) {
            case 0: className = 'alert_success'; break;
            case 1: className = 'alert_secondary'; break;
            case 2: className = 'alert_error'; break;
        }

        element.classList.add('alert');
        element.classList.add(className);
        element.classList.add('alert_bounceIn');
        text.classList.add('text');
        text.innerHTML = message;
        element.appendChild(text);
        list.appendChild(element);

        setTimeout(() => {
            element.classList.remove('alert_bounceIn');
            element.classList.add('alert_bounceOut');

            setTimeout(() => element.remove(), 650)
        }, 5000)
    }
}