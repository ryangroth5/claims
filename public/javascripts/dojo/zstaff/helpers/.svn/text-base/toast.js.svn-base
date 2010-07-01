dojo.provide('zstaff.helpers.toast');
dojo.require("dojox.widget.Toaster");


zstaff.helpers.toast.toaster = null;

zstaff.helpers.toast.toast = function(message, severity)
{
    if(!dojo.byId("ztoaster"))
    {
      var nodeDiv = document.createElement("div");
      nodeDiv.id = "ztoaster";
      document.body.appendChild(nodeDiv);
        new dojox.widget.Toaster({
          id:"ztoaster",
          positionDirection:"br-left", 
          showDelay:000,
          messageTopic:"ztoastages"
        },nodeDiv);    
	}		
	opt = {};
	opt.message = message;
	if(severity)
	{
		opt.type = severity;
	}
	dojo.publish("ztoastages",[opt]); 	
};
