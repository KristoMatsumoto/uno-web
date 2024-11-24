class SessionsController < ApplicationController
  before_action :check_no_authenticate, only: [:new, :create]
  before_action :check_authenticate, only: :destroy

  def new
    @user ||= User.new
  end

  def create
    @user = User.find_by login: params[:user][:login]
    if (@user&.authenticate(params[:user][:password]))
      sign_out_guest
      sign_in_user(@user)
      redirect_to new_room_path
    else
      @user = User.new(login: params[:user][:login])
      # @user.errors.add(:login, "or password is invalid")
      flash[:error] = "Login failed, try again"
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    sign_out_user
    redirect_to new_sessions_path
  end

  private

  def user_params
    params.require(:user).permit(:login, :password)
  end
end