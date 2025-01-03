class RoomPlayer < ApplicationRecord
  belongs_to :room
  belongs_to :player, polymorphic: true

  # validates :player_num, presence: true
  # validates :room_id, presence: true
  # validates :player, presence: true

  before_validation :set_player_number

  private 

  def set_player_number
    max_player_num = RoomPlayer.where(room_id: room_id).maximum(:player_num)
    self.player_num = max_player_num ? max_player_num + 1 : 0
  end
end
