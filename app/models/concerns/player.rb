module Player
  extend ActiveSupport::Concern
  
  included do
    def set_valid_nickname
      self.nickname.gsub!(/[^a-zA-Z0-9_]/, '') if self.nickname
      self.nickname = "Player_#{SecureRandom.hex(4)}" if self.nickname.blank?
    end

    def leave_room
      room_player = self.room_player
      return unless room_player
      room_player.destroy
    end
  end
end
