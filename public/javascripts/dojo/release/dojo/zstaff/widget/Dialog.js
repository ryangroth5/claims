/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["zstaff.widget.Dialog"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["zstaff.widget.Dialog"] = true;
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
		
		templateString:"<div class=\"dijitTooltipDialog\" >\n\t<div class=\"dijitTooltipContainer\">\n\t\t<span style='margin-right:-2em;' dojoAttachEvent=\"onclick: hide\">x</span>\n\t\t<div class =\"dijitTooltipContents dijitTooltipFocusNode\" dojoAttachPoint=\"containerNode\" tabindex=\"0\" waiRole=\"dialog\"></div>\n\t\t</div>\n\t\t<span dojoAttachPoint=\"tabEnd\" tabindex=\"0\" dojoAttachEvent=\"focus:_cycleFocus\"></span>\n\t\t<div class=\"dijitTooltipConnector\" ></div>\n</div>\n\n",
		
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

}
