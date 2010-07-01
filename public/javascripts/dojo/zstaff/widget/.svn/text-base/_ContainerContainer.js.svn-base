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
		templatePath: dojo.moduleUrl("zstaff", "widget/templates/_ContainerContainer.html"),

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