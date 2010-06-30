class FaultTypesController < ApplicationController
  # GET /fault_types
  # GET /fault_types.xml
  def index
    @fault_types = FaultType.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @fault_types }
    end
  end

  # GET /fault_types/1
  # GET /fault_types/1.xml
  def show
    @fault_type = FaultType.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @fault_type }
    end
  end

  # GET /fault_types/new
  # GET /fault_types/new.xml
  def new
    @fault_type = FaultType.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @fault_type }
    end
  end

  # GET /fault_types/1/edit
  def edit
    @fault_type = FaultType.find(params[:id])
  end

  # POST /fault_types
  # POST /fault_types.xml
  def create
    @fault_type = FaultType.new(params[:fault_type])

    respond_to do |format|
      if @fault_type.save
        format.html { redirect_to(@fault_type, :notice => 'FaultType was successfully created.') }
        format.xml  { render :xml => @fault_type, :status => :created, :location => @fault_type }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @fault_type.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /fault_types/1
  # PUT /fault_types/1.xml
  def update
    @fault_type = FaultType.find(params[:id])

    respond_to do |format|
      if @fault_type.update_attributes(params[:fault_type])
        format.html { redirect_to(@fault_type, :notice => 'FaultType was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @fault_type.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /fault_types/1
  # DELETE /fault_types/1.xml
  def destroy
    @fault_type = FaultType.find(params[:id])
    @fault_type.destroy

    respond_to do |format|
      format.html { redirect_to(fault_types_url) }
      format.xml  { head :ok }
    end
  end
end
