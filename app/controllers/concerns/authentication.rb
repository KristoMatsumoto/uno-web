module Authentication
  extend ActiveSupport::Concern
  
  included do
    private

    def current_user
      if session[:user_id].present?
        @current_user ||= User.find_by(id: session[:user_id])
      elsif cookies.signed[:user_id].present?
        @current_user ||= User.find_by(id: cookies.signed[:user_id])
        session[:user_id] = cookies.signed[:user_id]
      end
      @current_user 
    end

    def current_guest
      if session[:session_token].present?
        @current_guest ||= Guest.find_by(session_token: session[:session_token])
      elsif cookies.signed[:session_token].present?
        @current_guest ||= Guest.find_by(session_token: cookies.signed[:session_token])
        session[:session_token] = cookies.signed[:session_token]
      end
      @current_guest
    end

    def current_player
      current_user || current_guest
    end

    def sign_in_user( user )
      session[:user_id] = user.id
      cookies.signed.permanent[:user_id] = user.id
    end

    def sign_out_user
      session.delete :user_id
      cookies.delete :user_id
    end

    def sign_in_guest( guest )
      session[:session_token] = guest.session_token
      cookies.signed.permanent[:session_token] = guest.session_token
    end

    def sign_out_guest
      session.delete :session_token
      cookies.delete :session_token
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

    def guest_signed_in?
      current_guest.present?
    end

    def signed_in?
      user_signed_in? || guest_signed_in?
    end

    helper_method :current_user, :current_guest, :user_signed_in?, :guest_signed_in?, :signed_in?
  end
end
