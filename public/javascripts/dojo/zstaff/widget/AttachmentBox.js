dojo.provide('zstaff.widget.AttachmentBox');

dojo.declare(
	"zstaff.widget.AttachmentBox",
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
		templatePath: dojo.moduleUrl("zstaff", "widget/templates/AttachmentBox.html"),
		
		/** dom nodes for manipulation 
		selectzero: null,	
		selectone: null,
		selecttwo: null,
		button: null,
		container: null,*/
		
		/*** widgets ***/
		wselectone: null,
		wselecttwo: null,
		wcontainer: null,
	
		
		
		/*** attributes ***/
		icon: '', // get the icon we 
		name: '', // name of this control
		values: {}, // values if there are any.
		url: '', // first url
		url2: '', //second lookup url.
			
		// find type selected
		step1: function()
		{
			var url2 = this.url+this.selectzero.value; // person, place, whatever. 
			this.wselectone.store = new dojox.data.QueryReadStore({url:url2});
			this.wselectone.setDisabled(false);
		},
		
		// person, position or organization selected
		step2: function()
		{
			var url2 = this.url2+this.selectzero.value+'='+this.wselectone.getValue(); // person, place, whatever.
			this.wselecttwo.store = new dojo.data.ItemFileReadStore({url:url2});
			this.wcontainer.store = this.wselecttwo.store; 
			this.wselecttwo.setDisabled(false);
		},
		
		// attachment selected
		step3: function()
		{
			
			
		},
		
		
		// add button clicked...
		step4: function()
		{
			this.wcontainer.add(this.wselecttwo.getValue());		
		},
		
		postCreate: function(){
			this.inherited(arguments);		 	
			
			console.log('moog');
			var sel1p=
			{
				disabled:true,
				autoComplete:false,
				onChange: dojo.hitch(this,this.step2),
				id: this.id+'-3' 
			};
			this.wselectone = new zstaff.widget.SelectBox(sel1p,this.selectone);
			
			var sel2p=
			{
				disabled:true,
				autoComplete:false,
				id: this.id+'-2' 
			};
			this.wselecttwo = new zstaff.widget.SelectBox(sel2p,this.selecttwo);
			
			s= new dojo.data.ItemFileReadStore({url:this.url2});
			var wscp=
			{
				icon: this.icon,
				name: this.name,
				store: s,
				values: this.values,
				id: this.id+'-1' 
			};
			this.wcontainer = new zstaff.widget.SelectContainer(wscp,this.container);
			this.step1();	
		}
		
	
	}
);
	
	
		
		