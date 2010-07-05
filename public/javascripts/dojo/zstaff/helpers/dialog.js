dojo.provide('zstaff.helpers.dialog');
dojo.require("zstaff.widget.Dialog");
dojo.require("zstaff.helpers.refresh");




zstaff.helpers.dialog.dlg = null;

zstaff.helpers.dialog.show = function(name,url,title)
{
	if(title == null) 
	{
		title = "";
	}

	if(!zstaff.helpers.dialog.dlg)
	{
	    if(!dojo.byId("zdialog"))
	    {
	      var nodeDiv = document.createElement("div");
	      nodeDiv.id = "zdialog";
	      document.body.appendChild(nodeDiv);
	      zstaff.helpers.dialog.dlg = new zstaff.widget.Dialog({
	          id:"zdialog",
	          preventCache:true,
	          parseOnLoad:true,
	          refreshOnShow:true
	        },nodeDiv);
	        
	       zstaff.helpers.dialog.dlg.onHide = zstaff.helpers.refresh.refreshAll;
	           
		}
		
	}
	//zstaff.helpers.dialog.dlg.title = name;
	zstaff.helpers.dialog.dlg.setTitle(title);
	zstaff.helpers.dialog.dlg.setHref(url);
	zstaff.helpers.dialog.dlg.show();
	
};


zstaff.helpers.dialog.close = function()
{
	if(zstaff.helpers.dialog.dlg)
	{
		zstaff.helpers.dialog.dlg.hide();
	}
};


zstaff.helpers.dialog.ttdlg = null;

zstaff.helpers.dialog.tooldialog = function(attachNode, url)
{
	dojo.xhrGet({url:url,load:function(d){dijit.showTooltip(d,attachNode); }});	
	
	var eventid = null; //keep track of the event id 
	var diefunc=function()
	{
		//2. hide tooltip
		dijit.hideTooltip(attachNode);
		//3. disconnect this function
		dojo.disconnect(eventid);
	};
	//1. on mouseup 
	eventid = dojo.connect(document.body,'onmouseup',diefunc);
};
