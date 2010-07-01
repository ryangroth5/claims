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
		templatePath: dojo.moduleUrl("zstaff.widget", "templates/Calendar.html"),
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
