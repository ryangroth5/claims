dojo.provide("zstaff.data.store");

// dojox.grid._data.model is the module with dojox.grid.data.DojoData
dojo.require("dojox.data.QueryReadStore");




// our declared class
dojo.declare("zstaff.data.store",
	
	
        // we inherit from this class
        dojox.data.QueryReadStore,
        // class properties:
        {
		data : null,   
       		datasize: 100,
       		
       		getDataSize : function()
       		{
       			return this.datasize;
       			
       		},
       		
       		_filterResponse: function(data){
       			
       			if(typeof data.size != 'undefined')
       			{
       				
       				this.datasize = data.size;
       			}
       			
			return data;
	      },
       		
	     _fetchItems: function(request, fetchHandler, errorHandler){
		if(this.data)
		{		
			data = this._filterResponse(this.data);
			this.data = null;
			if (data.label){
				this._labelAttr = data.label;
			}
			var numRows = data.numRows || -1;
	
			this._items = [];
			// Store a ref to "this" in each item, so we can simply check if an item
			// really origins form here (idea is from ItemFileReadStore, I just don't know
			// how efficient the real storage use, garbage collection effort, etc. is).
			dojo.forEach(data.items,function(e){ 
				this._items.push({i:e, r:this}); 
			},this); 
			
			var identifier = data.identifier;
			this._itemsByIdentity = {};
			if(identifier){
				this._identifier = identifier;
				for(i = 0; i < this._items.length; ++i){
					var item = this._items[i].i;
					var identity = item[identifier];
					if(!this._itemsByIdentity[identity]){
						this._itemsByIdentity[identity] = item;
					}else{
						throw new Error(this._className+":  The json data as specified by: [" + this.url + "] is malformed.  Items within the list have identifier: [" + identifier + "].  Value collided: [" + identity + "]");
					}
				}
			}else{
				this._identifier = Number;
				for(i = 0; i < this._items.length; ++i){
					this._items[i].n = i;
				}
			}
			numRows = (numRows === -1) ? this._items.length : numRows;
			fetchHandler(this._items, request, numRows);

			
		}
		else
		{
			return(this.inherited('_fetchItems',arguments));
		}
	     }
	}
);


