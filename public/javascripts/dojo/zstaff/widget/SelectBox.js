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