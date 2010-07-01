dojo.provide("zstaff.widget.Dialog");

dojo.require("dijit.Dialog");

/** adds onhide **/
dojo.declare(
	"zstaff.widget.Dialog",
	[dijit.Dialog],
	{
		hide: function()
		{
			this.inherited("hide",arguments);
			if(this.onHide)
			{
				this.onHide();
			}
			
		},

		setTitle: function(title){ this.titleNode.innerHTML = title; }

	}
);

/** adds onhide **/
dojo.declare(
	"zstaff.widget.TooltipDialog",
	[dijit.TooltipDialog],
	{
		
		templatePath: dojo.moduleUrl("zstaff.widget", "templates/TooltipDialog.html"),
		
		show: function()
		{
			console.log('showing');
			this.inherited("show",arguments);
			this.domNode.style.display = "block";
		},
		hide: function()
		{
			this.domNode.style.display = "none";
			if(this.onHide)
			{
				this.onHide();
			}
			
		}

	}
);