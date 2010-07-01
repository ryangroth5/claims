dojo.provide('zstaff.helpers.form');
dojo.require("dojo.io.iframe");

zstaff.helpers.form.submit = function(update,form,url,content,load)
{
	/***
	 * Supporting files is a PIA, the rule is that only HTML can come back 
	 * if we are supporint files.
	 */
	var so = {
		
		url: url,
		load: function(	data,options,opt2)
		{
			if(load)
			{
				load();
			}
			if(options.xhr && options.xhr.getResponseHeader('content-type').match('text/javascript'))
			{
				dojo.eval(data);
			}
			else
			{
				/***
				 * So if the update area is specified and the thing coming
				 * back is an html document, process the body.
				 */
				if(update)
				{
					if(dojo.isObject(data) && (data instanceof Document))
					{
						dojo.byId(update).innerHTML = data.body.innerHTML;												
					}
					else
					{
						// otherwise it is text.
						dojo.byId(update).innerHTML = data;
					}
					
					dojo.parser.parse(dojo.byId(update));
					
					
					
				}
			}
		},
		error: function(data,err)
		{
			console.error('i/o failure %s %s',data,err);
			console.dir(data);
			console.dir(err);
			
		}
		
	};
	
	if(content)
	{
		so.content = content;
		
	}
	
	if(form.nodeName == 'FORM')
	{
		so.form = form;
		
	}
	
	/* if file field, we must send ioframe, and response must have html */	
	if(dojo.query("input[type='file']").length > 0 )
	{
		if(!update)
		{
			throw "When using a file field in the form, return HTML and provide a content to update";
		}
		/* handle as says we don't expext our output in a text area */
		so.handleAs = 'html';
		dojo.io.iframe.send(so);
	}
	else
	{
		dojo.xhrPost(so);
	}	
	return false;
	
}

