class HomeController < ApplicationController
  before_action :check_no_authenticate, only: [:login]

  def index
  end
  
  def login
    @user = User.new
    @guest = Guest.new
  end
end
