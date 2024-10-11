module Authentication
  extend ActiveSupport::Concern
  
  included do
    private

    def current_user
      if session[:user_id].present?
        @current_user ||= User.find(session[:user_id])
      elsif cookies.signed[:user_id].present?
        @current_user ||= User.find(cookies.signed[:user_id])
        session[:user_id] = cookies.signed[:user_id]
      end
      @current_user 
    end

    def sign_in( user )
      session[:user_id] = user.id
      cookies.signed.permanent[:user_id] = user.id
    end

    def sign_out
      session.delete :user_id
      cookies.delete :user_id
    end

    def check_authenticate
      return if current_user.present?
      flash[:warning] = "You are no signed in"
      redirect_to new_sessions_path
    end

    def check_no_authenticate
      return if !current_user.present?
      flash[:warning] = "You are already signed in"
      redirect_back fallback_location: root_path
    end

    def user_signed_in?
      current_user.present?
    end

    helper_method :current_user, :user_signed_in?
  end
end
