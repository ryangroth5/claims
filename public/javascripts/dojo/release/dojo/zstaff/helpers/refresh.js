/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource['zstaff.helpers.refresh']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['zstaff.helpers.refresh'] = true;
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

}
