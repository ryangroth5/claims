class TasksController < ApplicationController
  layout false  
  before_filter :authenticate
  #before_filter :correct_user #, :only => [:edit, :update]
  
  # GET /actions
  # GET /actions.xml
  def index
    @tasks = Task.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @tasks }
    end
  end

  #GET /actions/main
  def main
    render :layout=>'layout';  
  end
  
    
  def list
    actions = Task.find_by_sql( :all, :conditions => {:patient_id => params[:patientid]}, :order=>'contact_date')
    render :json => {:identifier => "id", :items=>actions};
  end

  # GET /actions/1
  # GET /actions/1.xml
  def show
    @task = Task.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @task }
    end
  end

  # GET /actions/new
  # GET /actions/new.xml
  def new
    if(request.post?)
      create;
    else
      @task = Task.new();
      @claims = Claim.find(params[:claimids].split(','));
      @claimids = params[:claimids];
    end
  end

  # GET /actions/1/edit
  def edit
    @task = Task.find(params[:id])
  end

  # POST /actions
  # POST /actions.xml
  def create
   
    saved = true;
    @claimids = params[:claimids].nil?  ? [] : params[:claimids];
    @claimids.split(',').each{|c| 
    
      @task = Task.new(
        {
          :claim_id => c, 
          :expected_writeoff=>params[:writeoff][c], 
          :expected_payment=>params[:payment][c],
          :user_id => current_user.id,
          :contact_date => DateTime.now()
         }.merge(params[:task])
       );
       saved &= @task.save;
    };
    
    
  
    

    
    if saved
      flash[:notice] = 'Task(s) successfully updated.'
      render :action=>'save';
    else
      flash[:warning] = 'Task had an error and was not updated!'
      render :action => 'save'      
    end
    
   
  end

  # PUT /actions/1
  # PUT /actions/1.xml
  def update
    @task = Task.find(params[:id])

    respond_to do |format|
      if @task.update_attributes(params[:action])
        format.html { redirect_to(@task, :notice => 'Action was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @Task.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /actions/1
  # DELETE /actions/1.xml
  def destroy
    @task = Task.find(params[:id])
    @task.destroy

    respond_to do |format|
      format.html { redirect_to(actions_url) }
      format.xml  { head :ok }
    end
  end
end
