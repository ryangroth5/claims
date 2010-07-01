dojo.provide('zstaff.helpers.printer');
dojo.require('zstaff.helpers.toast');
/***
 * Excecute the print job.
 */
 
 
zstaff.helpers.printer.REQUEST_PARAM_NAME = 'printreportid';
zstaff.helpers.printer.print = function()
{
	//determine the request id 
	var requestid = 0;
	d = dojo.query('#printreportid');
	if(d.length)
	{
		requestid = d[0].value;
	}
	zstaff.helpers.printer.printbyid(requestid);
}

zstaff.helpers.printer.printbyid = function(id)
{
	
	//determine the request id 
	var requestid = id;
	if(requestid)
	{
		document.location = '/Print_Report/print?'+zstaff.helpers.printer.REQUEST_PARAM_NAME+'='+requestid;	
	}
	else
	{
		zstaff.helpers.toast.toast('Printer is not setup correctly internally, cannot find report id', 'warning')
	} 
	return(false);
}