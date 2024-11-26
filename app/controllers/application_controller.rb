class ApplicationController < ActionController::Base
  include Authentication
  include ErrorHandling

  protect_from_forgery with: :null_session, if: -> { request.format.json? }
end
