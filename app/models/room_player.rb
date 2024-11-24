class RoomPlayer < ApplicationRecord
  belongs_to :room
  belongs_to :player, polymorphic: true

  # validates :player_num, presence: true
  # validates :room_id, presence: true
  # validates :player, presence: true

  before_validation :set_player_number

  private 

  def set_player_number
    self.player_num = self.room.get_next_player_num if (self.player_num.blank?)
  end
end
