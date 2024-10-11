class UsersController < ApplicationController
  before_action :check_no_authenticate, only: [:create]

  def create
    @user = User.new user_params

    if @user.save
      sign_in(@user)
      flash[:success] = "Successful registration"
      # redirect_to edit_user_path
    else
      flash[:error] = "Unable to save"
      # render :new, status: :unprocessable_entity
    end
  end
  
  def show
        
  end

  def edit 
        
  end

  def update
        
  end

  private

  def user_params
    params.require(:user).permit(:login, :password, :password_confirmation, :old_password)
  end
end
