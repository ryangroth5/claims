/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["zstaff.data.grid"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["zstaff.data.grid"] = true;
dojo.provide("zstaff.data.grid");



// An extension of dojox.grid.data.DojoData that supports server side
// paging and sorting
// ES 11/28/2007


// dojox.grid._data.model is the module with dojox.grid.data.DojoData
dojo.require("dojox.grid._data.model");

// our declared class
dojo.declare("zstaff.data.grid", // we inherit from this class
dojox.grid.data.DojoData, // class properties:
{
    form: '', // form node or name.
    data: null, // JSON data substitutes for first request.
    markupFactory: function(args, node){
        return new zstaff.data.grid(null, null, args);
    },
    
    constructor: function(inFields, inData, args){
        this.count = 100; //start with a larger count.
        
    },
    
    // custom override of requestRows()
    requestRows: function(inRowIndex, inCount){
        // creates serverQuery-parameter
        var row = inRowIndex || 0;
        var otherfilters = {};
        if (this.form) {
            otherfilters = dojo.formToObject(this.form);
        }
        
        //console.log(this.sortColumn);
        sort_index = this.fields.get(Math.abs(this.sortColumn - 1)).name;
        sort_order = (this.sortColumn > 0) ? 0 : 1;
        
        
        /*
         * start - actual row we want (0-based)
         * count - how many records we want
         * sort - field name to sort by (asc, desc ind )
         * sort_order - true is
         * page_size - page size
         */
        var self = this;
        

            var params = {
                start: row,
                count: inCount || this.rowsPerPage,
                serverQuery: dojo.mixin({
                    page: (row / this.rowsPerPage),
                    count: inCount || this.rowsPerPage,
                    sort: sort_index,
                    sort_order: sort_order,
                    page_size: this.rowsPerPage
                }, otherfilters, this.query),
                query: this.query,
                // onBegin: dojo.hitch(this, "beginReturn"),
                onComplete: function(d, i){
                    if (self.store.getDataSize) {
                        var ds = self.store.getDataSize();
						dojo.publish('zstaff.data.grid.rowsize',[ds]);
                        if (ds != this.count) {
                            self.setRowCount(ds);
                        }
                    }
                    self.processRows(d, i);
                }
            }
            
            
            this.store.fetch(params);
                

    },
    
    setData: function(inData){
        //this.count = this.rowsPerPage;
        // edited not to reset the store
        this.data = [];
        this.allChange();
    },
    sort: function(colIndex){
        this.clearData();
        this.sortColumn = colIndex;
        this.requestRows();
    },
    canSort: function(){
        // always true
        return true;
    }
    
});

}
