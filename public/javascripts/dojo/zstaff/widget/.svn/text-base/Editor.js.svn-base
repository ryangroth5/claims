dojo.provide("zstaff.widget.Editor");


/** adds onhide **/
dojo.declare(
	"zstaff.widget.Editor",
	null,
	{
		constructor: function(args,element)
		{
			var id = element.id;
			this.mce = tinyMCE.init({
		  		mode : "exact",
		  		theme : "advanced",
		  		elements : id,
		  		height: '275px'
		  	});
			//var mce = this.mce;
			oldfn = dojo.hitch(element.form,element.form.onsubmit);
			element.form.onsubmit = function(e)
			{
				tinyMCE.triggerSave();
				return(oldfn(e));
			};
			//dojo.connect(element.form,'onsubmit',);
			
		}
	
		
	}
	
	
	
);

