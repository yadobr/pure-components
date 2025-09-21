/*
Срабатывает, когда пользователь прокрутил страницу доконца
*/

export default function onbottom( callback )
{
	window.addEventListener('scroll', function()
    {
		let difference = documentHeight() - ( scrollHeight() + windowHeight() );

        if( difference == 0 )
        {
            typeof callback === 'function' && callback()
        }
    });

	function scrollHeight()
	{
		return window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
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
