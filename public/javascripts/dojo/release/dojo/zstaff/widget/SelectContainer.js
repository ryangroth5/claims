/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource['zstaff.widget.SelectContainer']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['zstaff.widget.SelectContainer'] = true;
dojo.provide('zstaff.widget.SelectContainer');
dojo.require('zstaff.widget._ContainerContainer');
dojo.require('zstaff.helpers.toast');
dojo.declare(
	"zstaff.widget.SelectContainer",
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
		templateString:"<div dojoAttachPoint=\"table_options\" class='widget_selectcontainer' >\n\t<div dojoAttachPoint=\"body_options\" class='inside'>\n\t</div>\n</div>\t\n",
		
		
		table_options: null,
		body_options: null,
		// name: string
		//	The name of the control to use.
		name: '',
		
		// icon: string
		// 	Path to an icon to include with each row. 
		icon: '',
		// store: Object
		//		Reference to data provider object used by this select container.
		store: null,
		//values: Array
		//		Reference the values this thing already has in it.
		values: {}, 
		
		
		
		_valuesadded: {},
		
		
		_constructor: function()
		{
			this._valuesadded = {};
		},
		
		
		_addrow: function(value,label)
		{
			
			var row = document.createElement("tr");
			var crow = new zstaff.widget._ContainerContainer({name:this.name, value:value, title: label, icon: this.icon},row);
			
			this.body_options.appendChild(crow.domNode);
			crow.show();
			
		},
		
		add: function(value)
		{
			var slf = this;
			var load = function(item)
			{
				var show=function(item2)
				{
					
					var moo = slf.store.getLabel(item2);
					if(moo==undefined)
					{
						moo = slf.store.getValue(item2,'name');
						
					}
					
					if(!slf._valuesadded[value])
					{
						slf._valuesadded[value]=true;					
						slf._addrow(value,moo);
					}
					else
					{
						zstaff.helpers.toast.toast('value already added','warning');
					}
				}
				if(slf.store.isItemLoaded(item))
				{
					show(item);		
				} 
				else
				{
					slf.store.loadItem({item:item, onItem: function(result, dataObject){show(dataObject)}});
				}
			}	
			
			this.store.fetchItemByIdentity({identity: value, onItem: load});
		},

		_removerow : function(value)
		{
			var id = this.name+'_'+value;
			dojo.fadeOut({node: id, duration:1000}).play();
			
			this.body_options.removeChild(dojo.byId(id));
		},

		remove: function(value)
		{
			if(this._valuesadded[value])
			{
				this._valuesadded[value]=false;
				this._removerow(value);
			}
			
		},
		
		postCreate: function(){
			this.inherited(arguments);
			
			if(this.values)
			{
				dojo.forEach(this.values,dojo.hitch(this,"add"));
				
			}
			
			
		}
		
		
		
		
});

}
