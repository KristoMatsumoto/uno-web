class HomeController < ApplicationController
  before_action :check_no_authenticate, only: [:login]

  def index
  end

  def login
    # @user = User.new
    # @guest = current_guest || Guest.new

    # @guests = Guest.all
  end
end
