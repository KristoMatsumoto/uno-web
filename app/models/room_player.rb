class RoomPlayer < ApplicationRecord
  belongs_to :room
  belongs_to :player, polymorphic: true

  def self.delete_player_from_all(player)
    @room_players = RoomPlayer.all.where(player: player)
    @room_players.each do | player_in_room |
      player_in_room.destroy()
    end
  end
end
