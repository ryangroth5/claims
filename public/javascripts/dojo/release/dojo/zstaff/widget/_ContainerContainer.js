/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource['zstaff.widget._ContainerContainer']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['zstaff.widget._ContainerContainer'] = true;
dojo.provide('zstaff.widget._ContainerContainer');

dojo.declare(
	"zstaff.widget._ContainerContainer",
	[dijit._Widget, dijit._Templated],
	{
	//	
	//	summary:
	//		A simple table of options that the user selects
	//
	//	description:
	//
	//
	//	example:
	//
	//	example:
	//	
		templateString:"<div dojoAttachPoint=\"box_main\"  style=\"opacity: 0;\" class='container_box' >\n\t<div class='title_box'>\n\t\t<div class='icon_box' >\n\t\t\t<span dojoAttachPoint='span_icon' class='icon'></span>\n\t\t\t<a dojoAttachEvent=\"onclick: remove\"><img src='/images/delete.png'    dojoAttachPoint=\"button_remove\"></a>\n\t\t</div>\n\t\t<span dojoAttachPoint=\"span_title\" class='title'></span>\n\t\t<span dojoAttachPoint=\"span_input\" class='input'></span>\n\t</div>\n</div>\t\n",

		button_remove: null,
		span_title: null,
		span_input: null,		
		box_main: null,
		
		// name: string
		//	The name of the control to use.
		name: '',
		// value: string
		// value for this thing.
		value: '', 
		// icon: string
		// 	Path to an icon to include with each row. 
		icon: '',
		//values: Array
		//		Reference the values this thing already has in it.
		values: [], 
		
		
		postCreate: function()
		{
			
			var image = '';
			if(this.icon)
			{
				image = '<img src = "'+this.icon+'">';
				
			}
			this.span_icon.innerHTML = image;
			this.span_title.innerHTML = this.title;
			this.span_input.innerHTML = '<input type="hidden" name="'+this.name+'" value="'+this.value+'">';
			//this.button_remove.parentNode.onClick = dojo.hitch(this,this.remove); 	
		},

		show: function()
		{
			dojo.fadeIn({node: this.domNode, duration:500}).play();
		},
		
		remove: function()
		{
			this.box_main.parentNode.removeChild(this.domNode);
		}
});

}
