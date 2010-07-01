dojo.provide('zstaff.helpers.refresh');

zstaff.helpers.refresh.refreshAll =function()
	       {
	       		dojo.query("div[dojoType='dijit.layout.ContentPane']").each(function(d)
	       		{
	       			if(d.style.display != 'none')
	       			{
					if(dijit.byId(d.id) && dijit.byId(d.id).refresh)
					{
		       				dijit.byId(d.id).refresh();
					}
	       			}
	       		}
	       		
	       		);
	       };