class SessionsController < ApplicationController
  def new
    @users = User.find(:all);
    @user_id = 1;
    
    
  end
  
  def create
 
    
    if(!params[:session][:user_id].nil?)
      sign_in(User.find(params[:session][:user_id]))
    end
    new;
    render 'new'
  end



  def destroy
    sign_out
    redirect_to root_path
  end
end
