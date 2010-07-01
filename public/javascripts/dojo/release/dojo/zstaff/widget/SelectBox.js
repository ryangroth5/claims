/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["zstaff.widget.SelectBox"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["zstaff.widget.SelectBox"] = true;
dojo.provide("zstaff.widget.SelectBox");

dojo.require("dijit.form.FilteringSelect");

dojo.declare(
	"zstaff.widget.SelectBox",
	[dijit.form.FilteringSelect],
	{
		setDisplayedValue:function(/*String*/ label){
			// summary:
			//	Set textbox to display label
			//	Also performs reverse lookup to set the hidden value
			//	Used in InlineEditBox
			this.setValue(this.getValue());
		}
		
	}
);

}
