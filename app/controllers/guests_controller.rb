class GuestsController < ApplicationController
  def create
    
  end

  private

  def guest_params
    params.require(:guest).permit(:nickname)
  end
end