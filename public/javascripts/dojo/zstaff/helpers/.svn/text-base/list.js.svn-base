dojo.provide('zstaff.helpers.list');
dojo.require('zstaff.helpers.form');
dojo.require("zstaff.helpers.refresh");


zstaff.helpers.list.group_button=function(button,grid,url)
{
	// prepare qp
	qp={};
	ogrid = null;
	// get the grid 
	if(grid != null)
	{
		var ogrid = dijit.byId(grid);
		if(!ogrid)
		{
			throw "Invalid grid passed in :"+grid;
			
		}
		var selection = ogrid.selection.getSelected();
		var ids=[];
		var idindex = ogrid.model.fields.indexOf('id');
		dojo.forEach(selection, function(s)
		{
			ids.push(ogrid.model.getDatum(s,idindex));	
		});
		qp['id[]'] = ids;
	}
	
	zstaff.helpers.form.submit(null,button.form,url,qp,
		function()
		{
			if(ogrid)
			{
				//alert("here");
				//ogrid.model.refresh();//new param, don't clear store.
				ogrid.refresh();//new param, don't clear store. (update for PGSQL conversion)
			}
			else
			{
				// otherwise refresh the content panes.
				zstaff.helpers.refresh.refreshAll();
			}
		}
	
	);
	
	return(false);
};


