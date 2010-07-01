module SessionsHelper
    def sign_in(user)
      #user.remember_me! -- generate a random salt with a time ever time the user logs in.
      cookies[:remember_token] = {:value=>user.id, :expires=> 20.years.from_now.utc}
      
      self.current_user = user;
      redirect_back_or('/main')
    end
    
    
   def authenticate
    
      deny_access unless signed_in?
    end
  
  
  
   def current_user=(user)
      @current_user = user
   end
   
    def current_user
      @current_user ||= user_from_remember_token
    end
    
    def user_from_remember_token
      remember_token = cookies[:remember_token]
      User.find_by_id(remember_token) unless remember_token.nil?
    end
    
  def signed_in?
    !current_user.nil?
  end
  
  def sign_out
    cookies.delete(:remember_token)
    self.current_user = nil
  end
  
  
  def deny_access
    store_location
    flash[:notice] = "Please sign in to access this page."
    redirect_to signin_path
  end
  
   def store_location
    session[:return_to] = request.request_uri
  end

  def redirect_back_or(default)
    redirect_to(session[:return_to] || default)
    clear_return_to
  end

  def clear_return_to
    session[:return_to] = nil
  end
  
end
