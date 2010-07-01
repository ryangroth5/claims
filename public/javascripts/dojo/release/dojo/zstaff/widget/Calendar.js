/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["zstaff.widget.Calendar"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["zstaff.widget.Calendar"] = true;
dojo.provide("zstaff.widget.Calendar");

dojo.require("dijit.form._FormWidget");
dojo.require("dijit._Calendar");
dojo.require("dijit.form.TimeTextBox");
/** adds onhide **/
dojo.declare(
	"zstaff.widget.Calendar",
	[dijit.form._FormWidget],
	{
		name: '',
		boxInput: null,
		divCalendar: null,
		ctlCalendar: null,
		value: new Date(),
		templateString:"<div class='calendar'>\n\t<input dojoAttachPoint='boxInput,focusNode' type='hidden' value='' name='${name}'>\n\t<div dojoAttachPoint='divCalendar'>\n\t\t\n\t</div>\n</div>\n",
		form: null,
		
		
		
		onChange: function(e)
		{},
		postCreate: function(){
			zstaff.widget.Calendar.superclass.postCreate.apply(this);
			this.ctlCalendar = new dijit._Calendar({value: this.value},this.divCalendar);
			this.boxInput.value = dojo.date.stamp.toISOString(this.value);
			var slf = this;
			this.ctlCalendar.onChange = function(e)
			{
				slf.boxInput.value = dojo.date.stamp.toISOString(e);
				slf.onChange(slf);
				slf.value = dojo.date.stamp.toISOString(e);
			};
			this.form = this.boxInput.form;
		}
		
	}
);

}
