module Nickname
  extend ActiveSupport::Concern
  
  included do
    def set_valid_nickname
      self.nickname.gsub!(/[^a-zA-Z0-9_]/, '')
    end
  end
end
